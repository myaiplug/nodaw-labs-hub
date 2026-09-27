const store = [
  { name:'NoDAW Labs Store', blurb:'Official Shopify storefront - gear, merch, and drops.', href:'https://www.nodawlabs.com', host:'nodawlabs.com' },
  { name:'NoDAW Gumroad', blurb:'Digital products, kits, and Producer & Syrup gear.', href:'https://nodaw.gumroad.com', host:'nodaw.gumroad.com' },
  { name:'Liminal AI Stem Splitter', blurb:'Local vocal & instrument separation for Windows. Shopify product page (Gumroad free demo at nodaw.gumroad.com/l/Liminal).', href:'https://www.nodawlabs.com/products/liminal-ai-stem-splitter', host:'nodawlabs.com' },
];
const apps = [
  { name:'reTUNE[432]', blurb:'432Hz retuning engine.', href:'https://retune-432.vercel.app/', host:'retune-432.vercel.app' },
  { name:'Harmonic Reality Warper', blurb:'Harmonic-series processor.', href:'https://harmonic-reality-warper.vercel.app/', host:'harmonic-reality-warper.vercel.app' },
  { name:'NoDAW Mix Rescue', blurb:'Audio rescue & mix fix utilities.', href:'https://nodaw-audiorescue.pages.dev/', host:'nodaw-audiorescue.pages.dev' },
  { name:'Creative Culture / The Collective', blurb:'Cloud Run creative culture app.', href:'https://creative-culture-2-505465593925.us-west1.run.app/', host:'us-west1.run.app' },
  { name:'CoProducer', blurb:'Collaborative production companion.', href:'https://myaiplug.github.io/coproducer-web/', host:'myaiplug.github.io' },
  { name:'FanTune Skin', blurb:'Tuning / pitch-correction skin.', href:'https://myaiplug.github.io/fantune-skin/', host:'myaiplug.github.io' },
  { name:'NoDAW Suite', blurb:'Core NoDAW suite landing.', href:'https://myaiplug.github.io/nodaw/', host:'myaiplug.github.io' },
  { name:'ScrewAI', blurb:'Chop & screw engine app.', href:'https://myaiplug.github.io/ScrewAI-App/', host:'myaiplug.github.io' },
  { name:'DeepSplit', blurb:'Stem / split experiment.', href:'https://myaiplug.github.io/DeepSplit/', host:'myaiplug.github.io' },
  { name:'Signal Chain', blurb:'Signal chain builder.', href:'https://myaiplug.github.io/signal-chain/', host:'myaiplug.github.io' },
  { name:'BZ Creative Engine', blurb:'Creative engine playground.', href:'https://myaiplug.github.io/bz-engine/', host:'myaiplug.github.io' },
  { name:'radar', blurb:'Radar utility / experiment.', href:'https://myaiplug.github.io/radar/', host:'myaiplug.github.io' },
];
const experiments = [
  { name:'Softglow Threshold', blurb:'Quiet liminal romantasy - Lina and the Archivist in a museum of residual feeling.', href:'https://softglow-threshold.vercel.app/', host:'softglow-threshold.vercel.app' },
  { name:'Bzportfolio', blurb:'Beez portfolio site.', href:'https://myaiplug.github.io/Bzportfolio/', host:'myaiplug.github.io' },
  { name:'THE BEATMOB STORE', blurb:'Beatmob storefront page.', href:'https://myaiplug.github.io/beatmob/', host:'myaiplug.github.io' },
  { name:'PromptCraft', blurb:'Prompt craft / form experiment.', href:'https://myaiplug.github.io/prompt-formx/', host:'myaiplug.github.io' },
  { name:'ClearPath', blurb:'Accessibility form brief.', href:'https://myaiplug.github.io/accessibility-form-brief/', host:'myaiplug.github.io' },
];
const broken = [
  { name:'local-ai-patterns-playbook', blurb:'Deploy error - needs rebuild / fix.', status:'Deploy error' },
  { name:'local-ai-patterns-landing', blurb:'Deploy error - needs rebuild / fix.', status:'Deploy error' },
  { name:'HalfScrew2 / halfscrew.com', blurb:'Domain errors - DNS or hosting misconfigured.', status:'Domain errors' },
];
function hostOf(href){
  try { return new URL(href).hostname.replace(/^www\./,''); } catch { return ''; }
}
function card(item, kind){
  const live = !!item.href;
  const badge = kind === 'store' ? 'store' : kind === 'broken' ? 'broken' : kind === 'exp' ? 'exp' : 'live';
  const badgeLabel = kind === 'store' ? 'STORE' : kind === 'broken' ? 'FIX' : kind === 'exp' ? 'PAGE' : 'LIVE';
  const cta = live ? 'OPEN ->' : (item.status || 'NEEDS FIX');
  const host = item.host || (live ? hostOf(item.href) : '-');
  const tag = live ? 'a' : 'div';
  const attrs = live ? ('href="'+item.href+'" target="_blank" rel="noopener"') : '';
  return '<'+tag+' class="card'+(kind==='broken'?' broken':'')+'" '+attrs+'>'
    +'<div class="top"><h4>'+item.name+'</h4><span class="badge '+badge+'">'+badgeLabel+'</span></div>'
    +'<p>'+item.blurb+'</p>'
    +'<div class="foot"><span class="host">'+host+'</span><span>'+cta+'</span></div>'
    +'</'+tag+'>';
}
document.getElementById('storeGrid').innerHTML = store.map(i => card(i,'store')).join('');
document.getElementById('appsGrid').innerHTML = apps.map(i => card(i,'live')).join('');
document.getElementById('expGrid').innerHTML = experiments.map(i => card(i,'exp')).join('');
document.getElementById('brokenGrid').innerHTML = broken.map(i => card(i,'broken')).join('');
document.getElementById('appsCount').textContent = apps.length + ' live';
document.getElementById('expCount').textContent = experiments.length + ' pages';
document.getElementById('storeCount').textContent = store.length + ' live';
document.getElementById('brokenCount').textContent = broken.length + ' items';
