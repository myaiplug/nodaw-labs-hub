const store = [
  { name:'NoDAW Labs Store', blurb:'Official Shopify storefront. Gear, merch, and drops.', href:'https://www.nodawlabs.com', host:'nodawlabs.com' },
  { name:'NoDAW Gumroad', blurb:'Digital kits, Producer gear, and Syrup packs.', href:'https://nodaw.gumroad.com', host:'nodaw.gumroad.com', img:'thumbs/gumroad.webp', alt:'NoDAW Labs Gumroad storefront with the Liminal AI Stem Splitter free demo listing' },
  { name:'Liminal StemSplit', blurb:'Live stem site. Isolate vocals, drums, bass, and other. Local, one-time. Was wrongly pointed at the Shopify product.', href:'https://liminal-stemsplit.onrender.com/', host:'liminal-stemsplit.onrender.com' },
  { name:'Liminal Pro', blurb:'Local AI stem separation for Windows. $29 one-time.', href:'https://nodaw-pagekit.vercel.app/liminal-pro/', host:'nodaw-pagekit/liminal-pro' },
  { name:'Beat Mob Store', blurb:'Beat leases and the Beat Mob storefront. October build.', href:'https://beat-mob-store.vercel.app/', host:'beat-mob-store.vercel.app' },
  { name:'Beat Mob Pages', blurb:'Earlier Beat Mob storefront still on GitHub Pages.', href:'https://myaiplug.github.io/beatmob/', host:'myaiplug.github.io/beatmob', img:'thumbs/beatmob-pages.webp', alt:'THE BEATMOB STORE hero title over a dark starfield' },
];
const apps = [
  { name:'Liminal StemSplit', blurb:'6-stem split, local, no upload. The page the card should open.', href:'https://liminal-stemsplit.onrender.com/', host:'liminal-stemsplit.onrender.com' },
  { name:'Lyrics from your vocal stem', blurb:'Free, local lyric transcription with timestamps. Mel spectrogram, vocal regions, Whisper in the browser. Nothing uploaded.', href:'https://nodaw-labs-hub.vercel.app/lyrics/', host:'nodaw-labs-hub.vercel.app/lyrics' },
  { name:'CoProducer', blurb:'Level pass and mix analysis. Same-night vocal sit.', href:'https://myaiplug.github.io/coproducer-web/', host:'myaiplug.github.io/coproducer-web' },
  { name:'ScrewAI', blurb:'Chop and screw engine. Web pass, not the unverified Windows exe.', href:'https://myaiplug.github.io/ScrewAI-App/', host:'myaiplug.github.io/ScrewAI-App' },
  { name:'NoDAW Mix Rescue', blurb:'Same-night mix rescue landing. Vocal, low end, release check.', href:'https://nodaw-audiorescue.pages.dev/', host:'nodaw-audiorescue.pages.dev' },
  { name:'NoDAW Suite', blurb:'ConvertIT, TrimIT, FxIT, TestIT. Browser audio tools.', href:'https://myaiplug.github.io/nodaw/', host:'myaiplug.github.io/nodaw', img:'thumbs/nodaw-suite.webp', alt:'NoDAW Suite hero: Audio tools that feel like instruments' },
  { name:'CyberForge', blurb:'Newton Field audio UI system. October Vercel deploy.', href:'https://cyberforge-five-psi.vercel.app/', host:'cyberforge-five-psi.vercel.app', img:'thumbs/cyberforge.webp', alt:'CyberForge Newton Field hero with a particle field panel' },
  { name:'reTUNE[432]', blurb:'432Hz retuning engine.', href:'https://retune-432.vercel.app/', host:'retune-432.vercel.app', img:'thumbs/retune.webp', alt:'reTUNE[432] hero: Lower the reference. Hear it differently, with a glowing waveform' },
  { name:'Harmonic Reality Warper', blurb:'Harmonic-series processor.', href:'https://harmonic-reality-warper.vercel.app/', host:'harmonic-reality-warper.vercel.app', img:'thumbs/warper.webp', alt:'Spectral Space Designer interface with space recipe buttons and effect knobs' },
  { name:'DeepSplit', blurb:'Stem and split experiment.', href:'https://myaiplug.github.io/DeepSplit/', host:'myaiplug.github.io/DeepSplit', img:'thumbs/deepsplit.webp', alt:'StemSplit.AI hero: Stop Renting Stems. Own the Source.' },
  { name:'Signal Chain', blurb:'Signal chain builder.', href:'https://myaiplug.github.io/signal-chain/', host:'myaiplug.github.io/signal-chain', img:'thumbs/signal-chain.webp', alt:'The Signal Chain powered on: Every signal needs a chain, with live meters' },
  { name:'FanTune', blurb:'Spectral fan modulator. The box-fan vocal chop as a VST3, AU and CLAP plugin, with a free browser demo.', href:'https://myaiplug.github.io/fantune-skin/', host:'myaiplug.github.io/fantune-skin', img:'thumbs/fantune.webp', alt:'FanTune plugin interface with a spinning fan, speed, pitch and tone knobs' },
  { name:'Creative Culture', blurb:'Cloud Run creative culture app.', href:'https://creative-culture-2-505465593925.us-west1.run.app/', host:'us-west1.run.app' },
  { name:'Lacquer Journal', blurb:'CoProducer essays. Loudness, true peak, stem diagnosis.', href:'https://myaiplug.github.io/coproducer-web/blog/index.html', host:'coproducer-web/blog', img:'thumbs/lacquer.webp', alt:'Lacquer CoProducer Journal masthead over a mixing console' },
  { name:'FANOUT', blurb:'Listing house. One catalog, every marketplace: bulk listings, posts and an upload queue.', href:'https://cross-lister.vercel.app/', host:'cross-lister.vercel.app', img:'thumbs/fanout.webp', alt:'FANOUT catalog view: a lookbook grid of product listings with live and unlisted tags' },
  { name:'Black Box', blurb:'For independent artists. Pulls public writer, performer and producer credits, then checks The MLC for each work.', href:'https://blackbox-sigma-eight.vercel.app/', host:'blackbox-sigma-eight.vercel.app', img:'thumbs/blackbox.webp', alt:'Black Box scan form: Money is sitting in the pool, with stage name and legal name fields' },
];
const experiments = [
  { name:'Softglow Threshold', blurb:'Quiet liminal romantasy. Lina and the Archivist in a museum of residual feeling.', href:'https://softglow-threshold.vercel.app/', host:'softglow-threshold.vercel.app', img:'thumbs/softglow.webp', alt:'Softglow Threshold book page hero in soft gold light' },
  { name:'BZ Creative Engine', blurb:'Creative engine playground.', href:'https://myaiplug.github.io/bz-engine/', host:'myaiplug.github.io/bz-engine', img:'thumbs/bz-engine.webp', alt:'BZ Creative Engine glass orb floating in a particle field' },
  { name:'Brian Jutz Portfolio', blurb:'Creative technologist portfolio. Creator tools, audio tech and local-first AI workflows.', href:'https://myaiplug.github.io/Bzportfolio/', host:'myaiplug.github.io/Bzportfolio', img:'thumbs/bzportfolio.webp', alt:'Brian Jutz portfolio hero: I build technology for creative work' },
  { name:'PromptCraft', blurb:'Prompt system audit. Link corrected from prompt-formx to prompt-fixx.', href:'https://myaiplug.github.io/prompt-fixx/', host:'myaiplug.github.io/prompt-fixx' },
  { name:'ClearPath', blurb:'Accessibility fix brief. Link corrected from accessibility-form-brief.', href:'https://myaiplug.github.io/accessibility-fix-brief/', host:'myaiplug.github.io/accessibility-fix-brief' },
  { name:'HalfScrew', blurb:'Slow-motion potion interface. Domain halfscrew.com still needs DNS. Repo page is the live reflection.', href:'https://myaiplug.github.io/halfscrew/', host:'myaiplug.github.io/halfscrew', img:'thumbs/halfscrew.webp', alt:'HalfScrew plugin with Time and Pitch knobs and waveform display' },
  { name:'WAVE Instrument', blurb:'Centered reactor, skeuomorphic EQ, waveform engine. October repo.', href:'https://wavve-ten.vercel.app/', host:'wavve-ten.vercel.app' },
  { name:'Wavve', blurb:'October audio app repo. Pages URL if the workflow is on.', href:'https://myaiplug.github.io/wavve/', host:'myaiplug.github.io/wavve' },
  { name:'NoDAW Goated', blurb:'October experiment. Pages URL if the workflow is on.', href:'https://myaiplug.github.io/nodaw-goated/', host:'myaiplug.github.io/nodaw-goated' },
  { name:'radar', blurb:'Radar utility.', href:'https://myaiplug.github.io/radar/', host:'myaiplug.github.io/radar' },
  { name:'BZ Audio Systems', blurb:'Sound design and audio systems portfolio. Web Audio and interactive sound work.', href:'https://bz-dlvr-audio-systems.vercel.app/', host:'bz-dlvr-audio-systems.vercel.app', img:'thumbs/bz-audio-systems.webp', alt:'BZ Audio Systems hero: Sound is part of the interaction' },
  { name:'EditPix', blurb:'AI photo editing with text prompts. Retouching, creative filters and adjustments.', href:'https://editpix.vercel.app/', host:'editpix.vercel.app', img:'thumbs/editpix.webp', alt:'EditPix hero: AI-Powered Photo Editing, Simplified, with an upload button' },
];
const transfer = [
  { name:'CoProducer .bat suite', blurb:'Drop a file, get the level report. Full brand sale if a buyer wants the Windows kit, not a gig.', href:'https://myaiplug.github.io/coproducer-web/', host:'brand transfer' },
  { name:'ScrewAI strains', blurb:'Web syrup pass plus local strain library. Exe stays off the public card until it is proven on other machines.', href:'https://myaiplug.github.io/ScrewAI-App/', host:'brand transfer' },
  { name:'WaveTrim', blurb:'Waveform trimmer with producer tag. Source ready. Not on the live grid yet.', href:'https://github.com/myaiplug/wavetrim', host:'github.com/myaiplug/wavetrim' },
  { name:'Local AI Patterns', blurb:'Playbook and landing. Deploy still errors. Source can transfer with the brand.', href:'https://github.com/myaiplug/local-ai-patterns-playbook', host:'needs deploy' },
  { name:'ffmpeg .bat rack', blurb:'Convert, trim, FX, test. You run them. Buyers get the file, not an install lesson.', href:'https://myaiplug.github.io/nodaw/', host:'in-house bats' },
  { name:'Beat catalog', blurb:'Leases on the Beat Mob store. Also open to a full catalog handoff.', href:'https://beat-mob-store.vercel.app/', host:'beat-mob-store.vercel.app' },
];
const broken = [
  { name:'local-ai-patterns-playbook', blurb:'Vercel project exists. Last deploy did not go ready. Rebuild before sending the link.', status:'Deploy error', href:'https://github.com/myaiplug/local-ai-patterns-playbook' },
  { name:'local-ai-patterns-landing', blurb:'Separate landing project. Same deploy block.', status:'Deploy error', href:'https://github.com/myaiplug/local-ai-patterns-landing' },
  { name:'halfscrew.com', blurb:'Domain still misconfigured. Use the GitHub Pages reflection until DNS is fixed.', status:'Domain errors', href:'https://myaiplug.github.io/halfscrew/', img:'thumbs/halfscrew.webp', alt:'HalfScrew plugin with Time and Pitch knobs and waveform display' },
  { name:'Liminal Shopify URL', blurb:'Old card opened nodawlabs.com/products/liminal-ai-stem-splitter. Store card now opens the stem site.', status:'Redirected', href:'https://liminal-stemsplit.onrender.com/' },
];
function hostOf(href){
  try { return new URL(href).hostname.replace(/^www\./,''); } catch { return ''; }
}
function shot(href){
  if(!href) return '';
  return 'https://image.thum.io/get/width/800/crop/420/noanimate/' + href;
}
function card(item, kind){
  const live = !!item.href;
  const badge = kind === 'store' ? 'store' : kind === 'broken' ? 'broken' : kind === 'exp' ? 'exp' : kind === 'sale' ? 'sale' : 'live';
  const badgeLabel = kind === 'store' ? 'STORE' : kind === 'broken' ? 'FIX' : kind === 'exp' ? 'PAGE' : kind === 'sale' ? 'SALE' : 'LIVE';
  const cta = live ? 'OPEN ->' : (item.status || 'NEEDS FIX');
  const host = item.host || (live ? hostOf(item.href) : '-');
  const tag = live ? 'a' : 'div';
  const attrs = live ? ('href="'+item.href+'" target="_blank" rel="noopener"') : '';
  const preview = live
    ? '<div class="shot"><img alt="'+(item.alt||'')+'" loading="lazy" src="'+(item.img||shot(item.href))+'"><div class="tint"></div><div class="glass"></div></div>'
    : '<div class="shot"><div class="tint"></div></div>';
  return '<'+tag+' class="card'+(kind==='broken'?' broken':'')+'" '+attrs+'>'
    + preview
    + '<div class="body"><div class="top"><h4>'+item.name+'</h4><span class="badge '+badge+'">'+badgeLabel+'</span></div>'
    + '<p>'+item.blurb+'</p></div>'
    + '<div class="foot"><span class="host">'+host+'</span><span>'+cta+'</span></div>'
    + '</'+tag+'>';
}
document.getElementById('storeGrid').innerHTML = store.map(i => card(i,'store')).join('');
document.getElementById('appsGrid').innerHTML = apps.map(i => card(i,'live')).join('');
document.getElementById('expGrid').innerHTML = experiments.map(i => card(i,'exp')).join('');
document.getElementById('transferGrid').innerHTML = transfer.map(i => card(i,'sale')).join('');
document.getElementById('brokenGrid').innerHTML = broken.map(i => card(i,'broken')).join('');
document.getElementById('appsCount').textContent = apps.length + ' live';
document.getElementById('expCount').textContent = experiments.length + ' pages';
document.getElementById('storeCount').textContent = store.length + ' live';
document.getElementById('transferCount').textContent = transfer.length + ' open';
document.getElementById('brokenCount').textContent = broken.length + ' items';
