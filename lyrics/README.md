# /lyrics/ - Lyrics from your vocal stem

Static page. Needs the COOP/COEP headers in the root `vercel.json` (scoped to `/lyrics/` only).
Built on wavey-ai/hush + wavey-ai/mel-spec (MIT) and whisper.cpp (MIT); see `licenses/`.
Vendor WASM is prebuilt; the source, build script and tests are in the prototype
(`/workspace/wavey-proto/liminal-lyrics` on the agent box: `build.sh`, `whisper/`, `test/`).
