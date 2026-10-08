// Local Whisper worker. Adapted from hush/web/app/src/whisper-worker.js (wavey-ai/hush, MIT).
// Loads a whisper.cpp WASM build (direct mel input) and a GGML model cached via the Cache API.
if (self.name === "em-pthread") {
  // Emscripten pthread workers re-load the script that created them; hand off to the runtime.
  importScripts(new URL("vendor/whisper/hush-whisper.js", self.location.href).href);
} else {
  let moduleUrl = "";
  let modelUrl = "";
  let language = "en";
  let nThreads = 4;
  let whisperModule = null;
  let whisperInstance = 0;
  let initPromise = null;
  const CACHE = "nodaw-lyrics-models-v1";

  const postStatus = (message, extra = {}) => postMessage({ type: "status", message, ...extra });

  async function cachedFetchBytes(url) {
    let cache = null;
    if ("caches" in self) {
      try {
        cache = await caches.open(CACHE);
        const hit = await cache.match(url);
        if (hit) {
          postStatus("Model loaded from browser cache.", { cached: true });
          return new Uint8Array(await hit.arrayBuffer());
        }
      } catch (_) { cache = null; }
    }
    const response = await fetch(url, { mode: "cors" });
    if (!response.ok) throw new Error(`model fetch failed: ${response.status}`);
    const total = Number(response.headers.get("content-length")) || 0;
    const reader = response.body.getReader();
    const parts = [];
    let got = 0, lastPost = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      parts.push(value);
      got += value.length;
      const now = performance.now();
      if (now - lastPost > 150) {
        lastPost = now;
        postMessage({ type: "download", loaded: got, total });
      }
    }
    postMessage({ type: "download", loaded: got, total: total || got });
    const bytes = new Uint8Array(got);
    let o = 0;
    for (const p of parts) { bytes.set(p, o); o += p.length; }
    if (cache) {
      try {
        await cache.put(url, new Response(bytes, { headers: { "content-type": "application/octet-stream" } }));
      } catch (error) { postStatus(`Model cache write skipped: ${error.message}`); }
    }
    return bytes;
  }

  async function initWhisper() {
    const t0 = performance.now();
    postStatus("Loading Whisper WASM runtime...");
    importScripts(moduleUrl);
    whisperModule = await whisper_factory({
      print: (text) => postMessage({ type: "log", message: text }),
      printErr: (text) => postMessage({ type: "log", message: text }),
    });
    postStatus("Fetching Whisper model...");
    const model = await cachedFetchBytes(modelUrl);
    try { whisperModule.FS_unlink("whisper.bin"); } catch (_) {}
    whisperModule.FS_createDataFile("/", "whisper.bin", model, true, true);
    postStatus("Initializing Whisper model...");
    whisperInstance = whisperModule.init("whisper.bin");
    if (!whisperInstance) throw new Error("Whisper model initialization failed");
    postMessage({ type: "ready", elapsedMs: Math.round(performance.now() - t0), modelBytes: model.length });
  }

  function ensureInit() {
    if (!initPromise) initPromise = initWhisper();
    return initPromise;
  }

  async function transcribe(job) {
    await ensureInit();
    const started = performance.now();
    const raw = whisperModule.full_mel_segments(whisperInstance, job.mel, job.nMels, job.nFrames, language, nThreads, false);
    const res = JSON.parse(raw);
    if (res.error) throw new Error(res.error);
    postMessage({ type: "result", id: job.id, segments: res.segments, elapsedMs: Math.round(performance.now() - started) });
  }

  self.onmessage = (event) => {
    const message = event.data || {};
    if (message.type === "init") {
      moduleUrl = message.moduleUrl;
      modelUrl = message.modelUrl;
      language = message.language || "en";
      nThreads = message.nThreads || 4;
      ensureInit().catch((error) => postMessage({ type: "fatal", message: error.message }));
    } else if (message.type === "transcribe") {
      transcribe(message).catch((error) => postMessage({ type: "error", id: message.id, message: error.message }));
    }
  };
}
