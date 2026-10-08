// "Lyrics from your vocal stem" - NoDAW Labs prototype.
// Pipeline: decode file (Web Audio) -> 16 kHz mono PCM -> mel-spec WASM worker (mel + VAD)
// -> VAD regions -> chunks -> whisper.cpp WASM worker (direct mel input) -> timestamped lyrics.
(() => {
  "use strict";
  const Core = window.LyricsCore;
  const { CONFIG } = Core;
  const $ = (id) => document.getElementById(id);
  const qs = new URLSearchParams(location.search);
  // Static assets (scripts, WASM) may come from a CDN mirror; workers must be same-origin.
  const base = new URL(".", document.currentScript.src);
  const asset = (p) => new URL(p, base).href;
  const workerUrl = (p) => `${new URL(p, location.href).href}?base=${encodeURIComponent(base.href)}`;
  const MODEL_BASE = "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/";

  const state = (window.__lyricsState = {
    status: "idle", frames: 0, vadFrames: 0, regions: [], chunks: [], lines: [],
    melMs: 0, whisperReadyMs: 0, chunkMs: [], error: null, modelUrl: "", crossOriginIsolated: window.crossOriginIsolated,
  });

  // ---------- environment ----------
  const iso = $("isoStatus");
  const supportsThreads = window.crossOriginIsolated && typeof SharedArrayBuffer !== "undefined";
  iso.classList.add(supportsThreads ? "ok" : "bad");
  iso.querySelector("span").textContent = supportsThreads
    ? "Local mode * nothing is uploaded"
    : "This page needs cross-origin isolation (COOP/COEP) for local Whisper";
  if (qs.get("model")) $("model").value = qs.get("model");
  if (qs.get("language")) $("language").value = qs.get("language");
  if (qs.get("whole") === "1") $("wholeFile").checked = true;
  const syncLang = () => {
    const multi = !$("model").value.includes(".en");
    $("language").disabled = !multi;
    if (!multi) $("language").value = "en";
  };
  $("model").addEventListener("change", syncLang);
  syncLang();

  // ---------- colormap (magma key colours, matplotlib CC0) ----------
  const LUT = (() => {
    const stops = [[0, 0, 0, 4], [0.2, 59, 15, 112], [0.4, 140, 41, 129], [0.6, 222, 73, 104], [0.8, 254, 159, 109], [1, 252, 253, 191]];
    const lut = new Uint8ClampedArray(256 * 3);
    for (let i = 0; i < 256; i++) {
      const t = i / 255;
      let k = 0;
      while (k < stops.length - 2 && t > stops[k + 1][0]) k++;
      const [t0, ...a] = stops[k], [t1, ...b] = stops[k + 1];
      const f = (t - t0) / (t1 - t0);
      for (let c = 0; c < 3; c++) lut[i * 3 + c] = a[c] + (b[c] - a[c]) * f;
    }
    return lut;
  })();

  // ---------- frame store ----------
  let store = null; // { q, min, max, va, n, cap, gmax }
  function newStore(cap) {
    return { q: new Uint8Array(cap * 80), min: new Float32Array(cap), max: new Float32Array(cap), va: new Uint8Array(cap), n: 0, cap, gmax: -Infinity };
  }
  // display intensity 0..255 for frame k, mel row m (log10 power mapped over an 8-decade range like Whisper)
  function intensity(k, m) {
    const mn = store.min[k], mx = store.max[k];
    const v = mn + (store.q[k * 80 + m] * (mx - mn)) / 255;
    const t = (v - (store.gmax - 8)) / 8;
    return t <= 0 ? 0 : t >= 1 ? 255 : (t * 255) | 0;
  }

  // ---------- drawing ----------
  const overview = $("overview"), live = $("live");
  const octx = overview.getContext("2d"), lctx = live.getContext("2d");
  let totalFrames = 0, regions = [], lines = [], player = $("player");
  let overviewDirty = false;

  function sizeCanvases() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    overview.width = Math.max(300, Math.round(overview.clientWidth * dpr));
    overview.height = Math.round(120 * dpr);
    live.width = Math.max(300, Math.round(live.clientWidth));
    live.height = 160;
    overviewDirty = true;
  }
  window.addEventListener("resize", sizeCanvases);

  let overviewImage = null;
  function drawOverviewBase() {
    const W = overview.width, H = overview.height, specH = Math.round(H * 0.78);
    const img = octx.createImageData(W, H);
    const d = img.data;
    for (let i = 3; i < d.length; i += 4) d[i] = 255;
    if (store && store.n && totalFrames) {
      for (let x = 0; x < W; x++) {
        const f0 = Math.floor((x * totalFrames) / W), f1 = Math.max(f0 + 1, Math.floor(((x + 1) * totalFrames) / W));
        if (f0 >= store.n) break;
        const fEnd = Math.min(f1, store.n);
        for (let y = 0; y < specH; y++) {
          const m = 79 - Math.floor((y * 80) / specH);
          let best = 0;
          for (let k = f0; k < fEnd; k += Math.max(1, ((fEnd - f0) / 6) | 0)) best = Math.max(best, intensity(k, m));
          const o = (y * W + x) * 4;
          d[o] = LUT[best * 3]; d[o + 1] = LUT[best * 3 + 1]; d[o + 2] = LUT[best * 3 + 2];
        }
        // raw per-frame VAD strip (mel-spec VoiceActivityDetector)
        let anyVa = 0;
        for (let k = f0; k < fEnd; k++) anyVa |= store.va[k];
        for (let y = specH + 2; y < specH + 6; y++) {
          const o = (y * W + x) * 4;
          if (anyVa) { d[o] = 45; d[o + 1] = 120; d[o + 2] = 95; }
        }
      }
    }
    octx.putImageData(img, 0, 0);
    const fx = (f) => (f / Math.max(1, totalFrames)) * W;
    // smoothed vocal regions
    for (const [a, b] of regions) {
      octx.fillStyle = "rgba(45,212,160,0.16)";
      octx.fillRect(fx(a), 0, fx(b) - fx(a), specH);
      octx.fillStyle = "rgba(45,212,160,0.85)";
      octx.fillRect(fx(a), specH + 7, Math.max(1, fx(b) - fx(a)), 5);
    }
    // lyric segments
    octx.fillStyle = "rgba(79,209,232,0.85)";
    for (const l of lines) {
      const a = l.start / 0.01, b = l.end / 0.01;
      octx.fillRect(fx(a), specH + 14, Math.max(2, fx(b) - fx(a) - 2), H - specH - 16);
    }
    overviewImage = octx.getImageData(0, 0, W, H);
  }

  function drawFrameLoop() {
    if (overviewDirty) { overviewDirty = false; drawOverviewBase(); }
    if (overviewImage) {
      octx.putImageData(overviewImage, 0, 0);
      if (totalFrames && player.duration) {
        const x = (player.currentTime / player.duration) * overview.width;
        octx.fillStyle = "#fff";
        octx.fillRect(Math.round(x), 0, Math.max(1, Math.round(overview.width / 600)), overview.height);
      }
    }
    drawLive();
    highlightLyric();
    requestAnimationFrame(drawFrameLoop);
  }

  // Scrolling "live" view: one mel frame per pixel column, playhead in the middle.
  function drawLive() {
    const W = live.width, H = live.height, specH = H - 14;
    const img = lctx.createImageData(W, H);
    const d = img.data;
    for (let i = 3; i < d.length; i += 4) d[i] = 255;
    const t = player.currentTime || 0;
    const center = Math.round(t * 100);
    const startF = center - Math.floor(W / 2);
    const regionAt = (f) => regions.some(([a, b]) => f >= a && f < b);
    if (store && store.n) {
      for (let x = 0; x < W; x++) {
        const k = startF + x;
        if (k < 0 || k >= store.n) continue;
        for (let y = 0; y < specH; y++) {
          const m = 79 - Math.floor((y * 80) / specH);
          const v = intensity(k, m);
          const o = (y * W + x) * 4;
          d[o] = LUT[v * 3]; d[o + 1] = LUT[v * 3 + 1]; d[o + 2] = LUT[v * 3 + 2];
        }
        if (regionAt(k)) {
          for (let y = specH + 4; y < H; y++) { const o = (y * W + x) * 4; d[o] = 45; d[o + 1] = 212; d[o + 2] = 160; }
        }
      }
    }
    lctx.putImageData(img, 0, 0);
    lctx.fillStyle = "rgba(255,255,255,0.85)";
    lctx.fillRect(Math.floor(W / 2), 0, 1, specH);
    $("liveTime").textContent = Core.fmtTime(t);
  }

  let activeIdx = -1;
  function highlightLyric() {
    const t = player.currentTime || 0;
    let idx = -1;
    for (let i = 0; i < lines.length; i++) if (t >= lines[i].start - 0.05 && t < lines[i].end + 0.3) idx = i;
    if (idx === activeIdx) return;
    const items = $("lyrics").querySelectorAll("li[data-i]");
    items.forEach((li) => li.classList.toggle("active", Number(li.dataset.i) === idx));
    activeIdx = idx;
    if (idx >= 0 && !player.paused) items[idx]?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  overview.addEventListener("click", (e) => {
    if (!player.duration) return;
    const r = overview.getBoundingClientRect();
    player.currentTime = ((e.clientX - r.left) / r.width) * player.duration;
  });
  live.addEventListener("click", (e) => {
    const r = live.getBoundingClientRect();
    const dx = ((e.clientX - r.left) / r.width) * live.width - live.width / 2;
    player.currentTime = Math.max(0, (player.currentTime || 0) + dx / 100);
  });

  // ---------- UI helpers ----------
  function pill(id, text, cls) {
    const el = $(id);
    el.textContent = text;
    el.className = "pill" + (cls ? " " + cls : "");
  }
  function progress(frac, text) {
    $("progressWrap").hidden = frac == null;
    if (frac == null) return;
    $("progressBar").style.width = `${Math.round(frac * 100)}%`;
    $("progressText").textContent = text;
  }
  function renderLyrics(pendingText) {
    const ol = $("lyrics");
    ol.innerHTML = "";
    lines.forEach((l, i) => {
      const li = document.createElement("li");
      li.dataset.i = i;
      const tm = document.createElement("time");
      tm.textContent = Core.fmtTime(l.start);
      const sp = document.createElement("span");
      sp.textContent = l.text;
      li.append(tm, sp);
      li.addEventListener("click", () => { player.currentTime = l.start; player.play().catch(() => {}); });
      ol.appendChild(li);
    });
    if (pendingText) {
      const li = document.createElement("li");
      li.className = "pending";
      li.textContent = pendingText;
      ol.appendChild(li);
    }
    activeIdx = -1;
    const has = lines.length > 0;
    ["copyBtn", "lrcBtn", "srtBtn", "txtBtn"].forEach((id) => ($(id).disabled = !has));
  }

  let currentName = "lyrics";
  function download(name, text) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  $("copyBtn").onclick = () => navigator.clipboard?.writeText(lines.map((l) => l.text).join("\n"));
  $("lrcBtn").onclick = () => download(`${currentName}.lrc`, Core.toLrc(lines, currentName));
  $("srtBtn").onclick = () => download(`${currentName}.srt`, Core.toSrt(lines));
  $("txtBtn").onclick = () => download(`${currentName}.txt`, lines.map((l) => `[${Core.fmtTime(l.start)}] ${l.text}`).join("\n") + "\n");

  // ---------- workers ----------
  let whisper = null, whisperKey = "", whisperReady = null, jobId = 0;
  const jobs = new Map();
  function modelUrlFor(key) {
    return qs.get("whisperModel") || `${MODEL_BASE}ggml-${key}.bin`;
  }
  function getWhisper() {
    const key = `${$("model").value}|${$("language").value}`;
    if (whisper && whisperKey === key) return whisperReady;
    if (whisper) whisper.terminate();
    whisperKey = key;
    const modelUrl = modelUrlFor($("model").value);
    state.modelUrl = modelUrl;
    whisper = new Worker(workerUrl("whisper-worker.js"));
    whisperReady = new Promise((resolve, reject) => {
      whisper.onmessage = (e) => {
        const m = e.data || {};
        if (m.type === "status") pill("whisperPill", `whisper: ${m.message.replace(/\.+$/, "").toLowerCase()}`, "busy");
        else if (m.type === "download") {
          const mb = (x) => (x / 1e6).toFixed(1);
          pill("whisperPill", `model ${mb(m.loaded)}${m.total ? "/" + mb(m.total) : ""} MB`, "busy");
          if (m.total) progress(m.loaded / m.total, `Downloading Whisper model (one time, cached after): ${mb(m.loaded)} / ${mb(m.total)} MB`);
        } else if (m.type === "ready") {
          state.whisperReadyMs = m.elapsedMs;
          pill("whisperPill", `whisper: ready (${(m.elapsedMs / 1000).toFixed(1)}s)`, "ok");
          resolve();
        } else if (m.type === "fatal") {
          pill("whisperPill", "whisper: failed", "bad");
          reject(new Error(m.message));
        } else if (m.type === "result" || m.type === "error") {
          const job = jobs.get(m.id);
          jobs.delete(m.id);
          if (!job) return;
          m.type === "result" ? job.resolve(m) : job.reject(new Error(m.message));
        } else if (m.type === "log") console.debug("[whisper]", m.message);
      };
      whisper.onerror = (e) => reject(new Error(e.message || "whisper worker error"));
    });
    whisper.postMessage({
      type: "init",
      moduleUrl: asset("vendor/whisper/hush-whisper.js"),
      modelUrl,
      language: $("language").value,
      nThreads: Math.max(1, Math.min(4, (navigator.hardwareConcurrency || 4) - 1)),
    });
    return whisperReady;
  }
  function transcribeChunk(mel, nFrames) {
    const id = ++jobId;
    return new Promise((resolve, reject) => {
      jobs.set(id, { resolve, reject });
      whisper.postMessage({ type: "transcribe", id, mel, nMels: 80, nFrames }, [mel.buffer]);
    });
  }

  async function decodeTo16kMono(file) {
    const bytes = await file.arrayBuffer();
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    let decoded;
    try { decoded = await ac.decodeAudioData(bytes); } finally { ac.close(); }
    const len = Math.ceil(decoded.duration * CONFIG.sampleRate);
    const off = new OfflineAudioContext(1, len, CONFIG.sampleRate);
    const src = off.createBufferSource();
    src.buffer = decoded;
    src.connect(off.destination);
    src.start();
    const rendered = await off.startRendering();
    return { pcm: rendered.getChannelData(0), duration: decoded.duration, channels: decoded.numberOfChannels, sampleRate: decoded.sampleRate };
  }

  function analyzeMel(pcm) {
    return new Promise((resolve, reject) => {
      const w = new Worker(workerUrl("mel-worker.js"));
      w.onmessage = (e) => {
        const m = e.data;
        if (m.type === "frames") {
          if (m.start + m.count > store.cap) return;
          store.q.set(m.q, m.start * 80);
          store.min.set(m.min, m.start);
          store.max.set(m.max, m.start);
          store.va.set(m.va, m.start);
          store.n = m.start + m.count;
          for (let i = 0; i < m.count; i++) if (m.max[i] > store.gmax) store.gmax = m.max[i];
          pill("melPill", `mel: ${store.n} frames`, "busy");
          overviewDirty = true;
        } else if (m.type === "done") { w.terminate(); resolve(m); }
        else if (m.type === "error") { w.terminate(); reject(new Error(m.message)); }
      };
      w.onerror = (e) => reject(new Error(e.message || "mel worker error"));
      w.postMessage({ type: "analyze", pcm }, [pcm.buffer]);
    });
  }

  // ---------- main flow ----------
  let running = false;
  async function handleFile(file) {
    if (!file || running) return;
    running = true;
    state.status = "decoding";
    state.error = null;
    currentName = file.name.replace(/\.[^.]+$/, "") || "lyrics";
    $("panel").hidden = false;
    $("lyricsPanel").hidden = false;
    $("fname").textContent = file.name;
    lines = []; regions = []; state.lines = lines; state.chunkMs = [];
    renderLyrics("Reading audio...");
    sizeCanvases();
    if (player.src) URL.revokeObjectURL(player.src);
    player.src = URL.createObjectURL(file);
    pill("melPill", "mel: -"); pill("vadPill", "vocal: -");
    try {
      const whisperP = supportsThreads ? getWhisper() : Promise.reject(new Error("cross-origin isolation unavailable"));
      whisperP.catch(() => {});
      const { pcm, duration } = await decodeTo16kMono(file);
      totalFrames = Math.floor(pcm.length / CONFIG.hopSize);
      store = newStore(totalFrames + 2);
      state.status = "mel";
      const melDone = await analyzeMel(pcm);
      state.melMs = melDone.elapsedMs;
      state.frames = store.n;
      totalFrames = store.n;
      const flags = store.va.subarray(0, store.n);
      state.vadFrames = flags.reduce((a, b) => a + b, 0);
      regions = Core.vadRegions(flags);
      state.regions = regions.map(([a, b]) => [Core.frameTime(a), Core.frameTime(b)]);
      const vocalSec = regions.reduce((s, [a, b]) => s + (b - a) / 100, 0);
      pill("melPill", `mel: ${store.n} frames in ${melDone.elapsedMs} ms`, "ok");
      pill("vadPill", `vocal: ${regions.length} regions, ${vocalSec.toFixed(1)}s`, regions.length ? "ok" : "bad");
      overviewDirty = true;

      const whole = $("wholeFile").checked;
      const queue = whole ? Core.wholeFileChunks(store.n) : Core.planChunks(regions, store.n);
      state.chunks = queue.map(([a, b]) => [Core.frameTime(a), Core.frameTime(b)]);
      if (!queue.length) {
        renderLyrics("No vocals detected. Try \"Ignore vocal detection\" if this is wrong.");
        state.status = "done";
        return;
      }
      state.status = "whisper-load";
      renderLyrics(`Loading Whisper (${$("model").selectedOptions[0].dataset.mb} MB model, cached after the first run)...`);
      await whisperP;
      progress(null);
      state.status = "transcribing";
      const totalAudio = queue.reduce((s, [a, b]) => s + (b - a), 0);
      let doneAudio = 0, guard = 0;
      while (queue.length && guard++ < 200) {
        const [a, b] = queue.shift();
        progress(doneAudio / totalAudio, `Transcribing locally ${Core.fmtTime(Core.frameTime(a))} - ${Core.fmtTime(Core.frameTime(b))}`);
        renderLyrics(`Transcribing ${Core.fmtTime(Core.frameTime(a))} - ${Core.fmtTime(Core.frameTime(b))}...`);
        const { mel, nFrames } = Core.buildChunkMel(store, a, b);
        const res = await transcribeChunk(mel, nFrames);
        state.chunkMs.push(res.elapsedMs);
        const segs = Core.cleanSegments(res.segments, a).map((s) => ({ ...s, end: Math.min(s.end, Core.frameTime(b)) }));
        lines.push(...segs);
        lines.sort((x, y) => x.start - y.start);
        doneAudio += b - a;
        overviewDirty = true;
        const next = whole ? null : Core.followUpChunk([a, b], segs, regions);
        if (next) queue.unshift(next);
      }
      progress(null);
      renderLyrics(lines.length ? null : "No lyrics recognised.");
      pill("whisperPill", `whisper: done (${state.chunkMs.length} chunks)`, "ok");
      state.status = "done";
    } catch (err) {
      console.error(err);
      state.status = "error";
      state.error = String(err.message || err);
      progress(null);
      renderLyrics(`Error: ${state.error}`);
    } finally {
      running = false;
    }
  }

  // ---------- input ----------
  const drop = $("drop"), input = $("file");
  input.addEventListener("change", () => handleFile(input.files[0]));
  drop.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") input.click(); });
  ["dragenter", "dragover"].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.add("over"); }));
  ["dragleave", "drop"].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.remove("over"); }));
  drop.addEventListener("drop", (e) => handleFile(e.dataTransfer.files[0]));

  sizeCanvases();
  requestAnimationFrame(drawFrameLoop);
})();
