// Mel + VAD worker: runs wavey-ai/mel-spec SpeechToMel (WASM) over decoded PCM.
// Adapted from hush/web/app/src/worker.js (wavey-ai/hush, MIT). Audio never leaves the browser.
const ASSET_BASE = new URLSearchParams(self.location.search).get("base") || new URL(".", self.location.href).href;
const assetUrl = (p) => new URL(p, ASSET_BASE).href;
importScripts(assetUrl("vendor/mel-spec/mel_spec.js"), assetUrl("lyrics-core.js"));
const { CONFIG } = self.LyricsCore;
const ready = wasm_bindgen({ module_or_path: assetUrl("vendor/mel-spec/mel_spec_bg.wasm") });

self.onmessage = async (event) => {
  const msg = event.data || {};
  if (msg.type !== "analyze") return;
  try {
    await ready;
    const pcm = msg.pcm; // Float32Array, 16 kHz mono
    const hop = CONFIG.hopSize;
    const v = CONFIG.vadSettings;
    const s2m = wasm_bindgen.SpeechToMel.newWithVadSettings(
      CONFIG.fftSize, hop, CONFIG.sampleRate, CONFIG.nMels, v.minEnergy, v.minY, v.minX, v.minMel
    );
    const batch = 400; // frames per progress message (4 s of audio)
    let q = new Uint8Array(batch * 80), min = new Float32Array(batch), max = new Float32Array(batch), va = new Uint8Array(batch);
    let n = 0, start = 0, total = 0;
    const started = performance.now();
    const flush = () => {
      if (!n) return;
      postMessage({ type: "frames", start, count: n, q: q.slice(0, n * 80), min: min.slice(0, n), max: max.slice(0, n), va: va.slice(0, n) });
      start += n; n = 0;
    };
    for (let i = 0; i < pcm.length; i += hop) {
      const r = s2m.add(pcm.subarray(i, i + hop), true);
      if (!r.ok) continue;
      q.set(r.frame, n * 80); min[n] = r.min; max[n] = r.max; va[n] = r.va ? 1 : 0;
      n++; total++;
      if (n === batch) { flush(); await new Promise((res) => setTimeout(res, 0)); }
    }
    flush();
    s2m.free();
    postMessage({ type: "done", frames: total, elapsedMs: Math.round(performance.now() - started) });
  } catch (error) {
    postMessage({ type: "error", message: String(error && error.message || error) });
  }
};
