const store = [
  { name:'NoDAW Labs Store', blurb:'Official Shopify storefront. Gear, merch, and drops.', href:'https://www.nodawlabs.com', host:'nodawlabs.com' },
  { name:'NoDAW Gumroad', blurb:'Digital kits, Producer gear, and Syrup packs.', href:'https://nodaw.gumroad.com', host:'nodaw.gumroad.com' },
  { name:'Liminal StemSplit', blurb:'Live stem site. Isolate vocals, drums, bass, and other. Local, one-time. Was wrongly pointed at the Shopify product.', href:'https://liminal-stemsplit.onrender.com/', host:'liminal-stemsplit.onrender.com' },
  { name:'Liminal Pro', blurb:'Local AI stem separation for Windows. $29 one-time.', href:'https://nodaw-pagekit.vercel.app/liminal-pro/', host:'nodaw-pagekit/liminal-pro' },
  { name:'Beat Mob Store', blurb:'Beat leases and the Beat Mob storefront. October build.', href:'https://beat-mob-store.vercel.app/', host:'beat-mob-store.vercel.app' },
  { name:'Beat Mob Pages', blurb:'Earlier Beat Mob storefront still on GitHub Pages.', href:'https://myaiplug.github.io/beatmob/', host:'myaiplug.github.io/beatmob' },
];
const apps = [
  { name:'Liminal StemSplit', blurb:'6-stem split, local, no upload. The page the card should open.', href:'https://liminal-stemsplit.onrender.com/', host:'liminal-stemsplit.onrender.com' },
  { name:'Lyrics from your vocal stem', blurb:'Free, local lyric transcription with timestamps. Mel spectrogram, vocal regions, Whisper in the browser. Nothing uploaded.', href:'https://nodaw-labs-hub.vercel.app/lyrics/', host:'nodaw-labs-hub.vercel.app/lyrics' },
  { name:'CoProducer', blurb:'Level pass and mix analysis. Same-night vocal sit.', href:'https://myaiplug.github.io/coproducer-web/', host:'myaiplug.github.io/coproducer-web' },
  { name:'ScrewAI', blurb:'Chop and screw engine. Web pass, not the unverified Windows exe.', href:'https://myaiplug.github.io/ScrewAI-App/', host:'myaiplug.github.io/ScrewAI-App' },
  { name:'NoDAW Mix Rescue', blurb:'Same-night mix rescue landing. Vocal, low end, release check.', href:'https://myaiplug.github.io/nodaw-audiorescue/', host:'myaiplug.github.io/nodaw-audiorescue' },
  { name:'Mix Rescue Pages', blurb:'Cloudflare copy of the rescue landing.', href:'https://nodaw-audiorescue.pages.dev/', host:'nodaw-audiorescue.pages.dev' },
  { name:'NoDAW Suite', blurb:'ConvertIT, TrimIT, FxIT, TestIT. Browser audio tools.', href:'https://myaiplug.github.io/nodaw/', host:'myaiplug.github.io/nodaw' },
  { name:'CyberForge', blurb:'Newton Field audio UI system. October Vercel deploy.', href:'https://cyberforge.vercel.app/', host:'cyberforge.vercel.app' },
  { name:'reTUNE[432]', blurb:'432Hz retuning engine.', href:'https://retune-432.vercel.app/', host:'retune-432.vercel.app' },
  { name:'Harmonic Reality Warper', blurb:'Harmonic-series processor.', href:'https://harmonic-reality-warper.vercel.app/', host:'harmonic-reality-warper.vercel.app' },
  { name:'DeepSplit', blurb:'Stem and split experiment.', href:'https://myaiplug.github.io/DeepSplit/', host:'myaiplug.github.io/DeepSplit' },
  { name:'Signal Chain', blurb:'Signal chain builder.', href:'https://myaiplug.github.io/signal-chain/', host:'myaiplug.github.io/signal-chain' },
  { name:'FanTune Skin', blurb:'Tuning and pitch-correction skin.', href:'https://myaiplug.github.io/fantune-skin/', host:'myaiplug.github.io/fantune-skin' },
  { name:'Creative Culture', blurb:'Cloud Run creative culture app.', href:'https://creative-culture-2-505465593925.us-west1.run.app/', host:'us-west1.run.app' },
  { name:'Lacquer Journal', blurb:'CoProducer essays. Loudness, true peak, stem diagnosis.', href:'https://myaiplug.github.io/coproducer-web/blog/index.html', host:'coproducer-web/blog' },
];
const experiments = [
  { name:'Softglow Threshold', blurb:'Quiet liminal romantasy. Lina and the Archivist in a museum of residual feeling.', href:'https://softglow-threshold.vercel.app/', host:'softglow-threshold.vercel.app' },
  { name:'BZ Creative Engine', blurb:'Creative engine playground.', href:'https://myaiplug.github.io/bz-engine/', host:'myaiplug.github.io/bz-engine' },
  { name:'Bzportfolio', blurb:'Beez portfolio site.', href:'https://myaiplug.github.io/Bzportfolio/', host:'myaiplug.github.io/Bzportfolio' },
  { name:'PromptCraft', blurb:'Prompt system audit. Link corrected from prompt-formx to prompt-fixx.', href:'https://myaiplug.github.io/prompt-fixx/', host:'myaiplug.github.io/prompt-fixx' },
  { name:'ClearPath', blurb:'Accessibility fix brief. Link corrected from accessibility-form-brief.', href:'https://myaiplug.github.io/accessibility-fix-brief/', host:'myaiplug.github.io/accessibility-fix-brief' },
  { name:'HalfScrew', blurb:'Slow-motion potion interface. Domain halfscrew.com still needs DNS. Repo page is the live reflection.', href:'https://myaiplug.github.io/halfscrew/', host:'myaiplug.github.io/halfscrew' },
  { name:'WAVE Instrument', blurb:'Centered reactor, skeuomorphic EQ, waveform engine. October repo.', href:'https://myaiplug.github.io/wave-instrument/', host:'myaiplug.github.io/wave-instrument' },
  { name:'Wavve', blurb:'October audio app repo. Pages URL if the workflow is on.', href:'https://myaiplug.github.io/wavve/', host:'myaiplug.github.io/wavve' },
  { name:'NoDAW Goated', blurb:'October experiment. Pages URL if the workflow is on.', href:'https://myaiplug.github.io/nodaw-goated/', host:'myaiplug.github.io/nodaw-goated' },
  { name:'radar', blurb:'Radar utility.', href:'https://myaiplug.github.io/radar/', host:'myaiplug.github.io/radar' },
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
  { name:'halfscrew.com', blurb:'Domain still misconfigured. Use the GitHub Pages reflection until DNS is fixed.', status:'Domain errors', href:'https://myaiplug.github.io/halfscrew/' },
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
    ? '<div class="shot"><img alt="" loading="lazy" src="'+shot(item.href)+'"><div class="tint"></div><div class="glass"></div></div>'
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
