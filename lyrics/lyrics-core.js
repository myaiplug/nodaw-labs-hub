// Shared pipeline helpers for "Lyrics from your vocal stem" (NoDAW Labs prototype).
// Works in the browser (window / worker global `LyricsCore`) and in Node (require).
// Mel frame layout and dequantize/normalize steps follow wavey-ai/hush (MIT).
(function (root) {
  "use strict";

  const CONFIG = {
    sampleRate: 16000,
    fftSize: 400, // whisper.cpp uses N_FFT=400 (hush's mic demo uses 1024)
    hopSize: 160, // 10 ms per mel frame, same as Whisper
    nMels: 80,
    vadSettings: { minEnergy: 1.0, minY: 6, minX: 6, minMel: 1 }, // hush defaults
    whisperWindowFrames: 3000, // 30 s
    maxChunkFrames: 2800, // keep chunks < 28 s to leave decoder headroom
  };

  // Time (s) of the centre of mel frame k produced by mel-spec SpeechToMel.
  // SpeechToMel emits its first frame once fftSize samples are buffered.
  function frameTime(k) {
    const firstEnd = Math.ceil(CONFIG.fftSize / CONFIG.hopSize) * CONFIG.hopSize;
    return (firstEnd - CONFIG.fftSize / 2 + k * CONFIG.hopSize) / CONFIG.sampleRate;
  }

  function dequantizeInto(q, min, max, out, offset) {
    const scale = max === min ? 0 : (max - min) / 255.0;
    for (let i = 0; i < q.length; i++) out[offset + i] = q[i] * scale + min;
  }

  // frames: { q: Uint8Array(nFrames*80), min: Float32Array(nFrames), max: Float32Array(nFrames) }
  // Returns a Whisper-normalized, mel-major Float32Array padded to 3000 frames.
  function buildChunkMel(frames, start, end) {
    const nMels = CONFIG.nMels;
    const nFrames = end - start;
    const padded = Math.max(CONFIG.whisperWindowFrames, nFrames);
    const tmp = new Float32Array(nMels);
    const out = new Float32Array(nMels * padded);
    let mmax = -Infinity;
    const cols = new Float32Array(nMels * nFrames);
    for (let f = 0; f < nFrames; f++) {
      const k = start + f;
      dequantizeInto(frames.q.subarray(k * nMels, (k + 1) * nMels), frames.min[k], frames.max[k], tmp, 0);
      for (let m = 0; m < nMels; m++) {
        const v = tmp[m];
        cols[f * nMels + m] = v;
        if (v > mmax) mmax = v;
      }
    }
    const floor = mmax - 8.0;
    const padValue = (floor + 4.0) / 4.0; // what whisper.cpp's zero-padding becomes after clamp
    out.fill(padValue);
    for (let f = 0; f < nFrames; f++) {
      for (let m = 0; m < nMels; m++) {
        out[m * padded + f] = (Math.max(cols[f * nMels + m], floor) + 4.0) / 4.0;
      }
    }
    return { mel: out, nLen: padded, nFrames };
  }

  // Smooth raw per-frame VAD flags into vocal regions [start, end) in frames.
  function vadRegions(flags, opts = {}) {
    const closeGap = opts.closeGap ?? 40; // bridge gaps <= 0.4 s
    const minLen = opts.minLen ?? 25; // drop blips < 0.25 s
    const pad = opts.pad ?? 15; // 150 ms padding each side
    const n = flags.length;
    let regions = [];
    let s = -1;
    for (let i = 0; i < n; i++) {
      if (flags[i] && s < 0) s = i;
      if (!flags[i] && s >= 0) { regions.push([s, i]); s = -1; }
    }
    if (s >= 0) regions.push([s, n]);
    const merged = [];
    for (const r of regions) {
      const last = merged[merged.length - 1];
      if (last && r[0] - last[1] <= closeGap) last[1] = r[1];
      else merged.push(r.slice());
    }
    regions = merged.filter((r) => r[1] - r[0] >= minLen)
      .map((r) => [Math.max(0, r[0] - pad), Math.min(n, r[1] + pad)]);
    const out = [];
    for (const r of regions) {
      const last = out[out.length - 1];
      if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
      else out.push(r);
    }
    return out;
  }

  // Pack vocal regions into Whisper chunks (<= maxChunkFrames). Long silences between
  // phrases (> splitGap) start a new chunk so Whisper never sees long empty stretches.
  function planChunks(regions, totalFrames, opts = {}) {
    const max = opts.maxChunkFrames ?? CONFIG.maxChunkFrames;
    const splitGap = opts.splitGap ?? 800; // 8 s: keep phrases together for context
    const chunks = [];
    let cur = null;
    const pushSplit = (s, e) => {
      for (let a = s; a < e; a += max) chunks.push([a, Math.min(e, a + max)]);
    };
    for (const [s, e] of regions) {
      if (cur && e - cur[0] <= max && s - cur[1] <= splitGap) {
        cur[1] = e;
        continue;
      }
      if (cur) chunks.push(cur);
      if (e - s > max) { pushSplit(s, e); cur = null; }
      else cur = [s, e];
    }
    if (cur) chunks.push(cur);
    return chunks.filter(([s, e]) => e - s >= 10 && s < totalFrames);
  }

  function wholeFileChunks(totalFrames) {
    const out = [];
    for (let s = 0; s < totalFrames; s += CONFIG.maxChunkFrames) {
      out.push([s, Math.min(totalFrames, s + CONFIG.maxChunkFrames)]);
    }
    return out.filter(([s, e]) => e - s >= 10);
  }

  // Whisper sometimes stops decoding a window early (emits end-of-text before the
  // last phrase). If a vocal region inside the chunk starts after the last
  // returned segment, return a follow-up chunk [regionStart, chunkEnd).
  function followUpChunk(chunk, lines, regions) {
    const [cs, ce] = chunk;
    const lastEnd = lines.length ? Math.max(...lines.map((l) => l.end)) : -Infinity;
    for (const [rs, re] of regions) {
      if (rs <= cs || rs >= ce || re - rs < 20) continue;
      if (frameTime(rs) > lastEnd + 0.3) return [rs, ce];
    }
    return null;
  }

  const NON_LYRIC = /^\s*([\[\(\*♪].*[\]\)\*♪]|♪+|\.+)\s*$/;
  function cleanSegments(segments, chunkStartFrame) {
    const base = frameTime(chunkStartFrame);
    return segments
      .map((s) => ({
        start: base + s.t0 / 100,
        end: base + s.t1 / 100,
        text: String(s.text || "").trim(),
        noSpeech: s.noSpeech,
      }))
      .filter((s) => s.text && !NON_LYRIC.test(s.text));
  }

  function fmtTime(sec, sep = ".") {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const cs = Math.floor((sec * 100) % 100);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}${sep}${String(cs).padStart(2, "0")}`;
  }

  function toLrc(lines, title) {
    const head = title ? [`[ti:${title}]`, "[re:NoDAW Labs - Lyrics from your vocal stem]"] : [];
    return head.concat(lines.map((l) => `[${fmtTime(l.start)}]${l.text}`)).join("\n") + "\n";
  }

  function srtTime(sec) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.round((sec % 1) * 1000) % 1000;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(ms).padStart(3, "0")}`;
  }

  function toSrt(lines) {
    return lines.map((l, i) => `${i + 1}\n${srtTime(l.start)} --> ${srtTime(l.end)}\n${l.text}\n`).join("\n");
  }

  const api = { CONFIG, frameTime, buildChunkMel, vadRegions, planChunks, wholeFileChunks, followUpChunk, cleanSegments, fmtTime, toLrc, toSrt };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.LyricsCore = api;
})(typeof self !== "undefined" ? self : this);
