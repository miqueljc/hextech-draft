import re
import os
S=os.path.dirname(os.path.abspath(__file__))+'/'
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))+'/'
src=open(ROOT+'pc.html',encoding='utf-8').read()
css=src[src.index('<style>')+7:src.index('</style>')]
script=src[src.index('<script>')+8:src.rindex('</script>')]
body=src[src.index('<body>')+6:src.index('<script>')]

def between(a,b,text=body):
    i=text.index(a); j=text.index(b,i); return text[i:j]
draft_all=between('<div id="tab-draft"','<!-- TAB 2')
# split draft tab
i_assign=draft_all.index('  <!-- ASSIGNACIÓ DE ROLS -->')
draft_main=draft_all[:i_assign]+'</div>\n'
assign_strat=draft_all[i_assign:].rstrip()
assign_strat=assign_strat[:assign_strat.rindex('</div>')]  # drop closing of tab-draft
others=body[body.index('<!-- TAB 2'):]
# header buttons -> sheet
mobile_css=r'''
/* ===== MOBILE APP ===== */
html{-webkit-text-size-adjust:100%}
html,body{overflow-x:clip;max-width:100%}
main,main *{min-width:0}
.panel,.draft-grid>*{max-width:100%;box-sizing:border-box}
.pick-slot,.ban-slot{max-width:100%}
body{padding:0 0 calc(70px + env(safe-area-inset-bottom));margin:0;-webkit-tap-highlight-color:transparent}
main{padding:10px 12px 20px;max-width:720px;margin:0 auto}
.appbar{position:sticky;top:0;z-index:50;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:calc(8px + env(safe-area-inset-top)) 12px 8px;background:rgba(9,20,40,.96);backdrop-filter:blur(8px);border-bottom:1px solid rgba(200,155,60,.35)}
.appbar h1{font-size:.92rem;margin:0;letter-spacing:.5px;color:var(--gold-light)}
.appbar .brand-badge{font-size:.62rem}
.appbar-btn{background:var(--bg-card);border:1px solid rgba(200,155,60,.4);color:var(--gold-light);border-radius:10px;min-width:44px;height:40px;font-size:1.1rem}
.bottomnav{position:fixed;left:0;right:0;bottom:0;z-index:60;display:grid;grid-template-columns:repeat(4,1fr);background:rgba(9,20,40,.98);border-top:1px solid rgba(200,155,60,.4);padding-bottom:env(safe-area-inset-bottom)}
.nav-btn{background:none;border:0;color:var(--text-muted);padding:8px 2px 7px;font-size:.66rem;display:flex;flex-direction:column;align-items:center;gap:2px;min-height:56px}
.nav-btn span{font-size:1.25rem;line-height:1}
.nav-btn.active{color:var(--gold-light);border-top:2px solid var(--gold);margin-top:-2px}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:70;display:none}
.overlay.open{display:block}
.sheet{position:fixed;left:0;right:0;bottom:0;z-index:80;background:var(--bg-panel);border-top:2px solid var(--gold);border-radius:18px 18px 0 0;padding:14px 14px calc(18px + env(safe-area-inset-bottom));max-height:80vh;overflow:auto;transform:translateY(105%);transition:transform .22s ease}
.sheet.open{transform:none}
.sheet h3{margin:0 0 10px;color:var(--gold-light);font-size:1rem}
.sheet .btn{width:100%;margin-bottom:8px;min-height:46px;justify-content:center;text-align:center}
.sheet .row2{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.btn{min-height:42px;font-size:.84rem}
input,select,textarea{font-size:16px!important}
.tab-content{display:none}.tab-content.active{display:block}
.draft-grid{display:flex!important;flex-direction:column;gap:10px}
.draft-grid{align-items:stretch!important}.draft-grid>.panel:nth-child(2){order:1}.draft-grid>.panel:nth-child(1){order:2}.draft-grid>.panel:nth-child(3){order:3}
.pick-slot{padding:6px 8px!important;min-height:0!important}
.ban-slot{min-height:40px}
.turn-banner{flex-direction:column;align-items:stretch;gap:8px}
.turn-banner>div:last-child{display:grid!important;grid-template-columns:1fr 1fr;gap:6px}
.turn-banner .btn-primary{grid-column:1/-1}
.filter-pills{display:flex;flex-wrap:nowrap;overflow-x:auto;gap:6px;padding-bottom:6px;scrollbar-width:none}
.filter-pills .pill{flex:0 0 auto;padding:9px 13px;font-size:.78rem}
.champ-grid{grid-template-columns:repeat(auto-fill,minmax(88px,1fr))!important;max-height:none!important;overflow:visible!important}
.sheet{overscroll-behavior:contain;-webkit-overflow-scrolling:touch;touch-action:pan-y}
.table-wrap,.mchips,.filter-pills{touch-action:pan-x pan-y}
.champ-chip{min-height:44px;font-size:.78rem}
.search-bar{position:sticky;top:56px;z-index:5}
.panel{padding:10px}
.assign-cols{grid-template-columns:1fr!important}
.assign-row{flex-wrap:wrap}
.assign-row select{min-height:42px;max-width:100%}
.strategy-grid{grid-template-columns:1fr!important}
.strategy-box{margin-top:12px}
.strat-card h4{cursor:pointer;display:flex;justify-content:space-between;align-items:center}
.strat-card h4::after{content:"▾";color:var(--gold);margin-left:8px}
.strat-card.collapsed h4::after{content:"▸"}
.strat-card.collapsed>*:not(h4){display:none!important}
/* taules -> targetes */
table.responsive thead{display:none}
table.responsive,table.responsive tbody,table.responsive tr,table.responsive td{display:block;width:100%}
table.responsive tr{background:var(--bg-card);border:1px solid rgba(255,255,255,.08);border-radius:12px;margin-bottom:10px;padding:8px 10px}
table.responsive td{border:0!important;padding:5px 0!important}
table.responsive td::before{content:attr(data-label);display:block;font-size:.66rem;text-transform:uppercase;letter-spacing:.5px;color:var(--gold);margin-bottom:2px}
.table-wrap{overflow-x:auto}
textarea{width:100%}
/* El meu joc */
.mchips{display:flex;gap:8px;overflow-x:auto;padding:2px 0 10px;scrollbar-width:none}
.mchip{flex:0 0 auto;background:var(--bg-card);color:var(--text);border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:8px 12px;text-align:left;font-size:.78rem;min-width:96px}
.mchip small{color:var(--text-muted)}
.mchip.active{border-color:var(--gold);background:rgba(200,155,60,.15)}
.mchip-r{display:block;font-size:.62rem;color:var(--gold);font-weight:800}
.mg-head{background:linear-gradient(135deg,rgba(200,155,60,.18),rgba(10,200,185,.08));border:1px solid rgba(200,155,60,.4);border-radius:14px;padding:12px;margin-bottom:10px}
details.mg{background:var(--bg-card);border:1px solid rgba(255,255,255,.08);border-radius:12px;margin-bottom:8px}
details.mg>summary{padding:13px 12px;font-weight:700;color:var(--gold-light);list-style:none;min-height:44px;cursor:pointer}
details.mg>summary::-webkit-details-marker{display:none}
.mg-body{padding:0 12px 12px;font-size:.86rem;line-height:1.45}
.mg-body ul{margin:6px 0 6px 18px}.mg-body li{margin-bottom:4px}
.ph{display:flex;gap:10px;margin-bottom:8px}.ph-t{flex:0 0 84px;color:var(--gold);font-weight:700;font-size:.76rem}
.empty,.warn{padding:14px;border-radius:12px;background:var(--bg-card);color:var(--text-muted);font-size:.86rem}
.warn{color:var(--orange);margin-bottom:10px;padding:9px 12px;font-size:.78rem}
.actions{display:grid;gap:8px;margin-top:12px}
.shared-banner{padding:10px;border-radius:12px;background:rgba(10,200,185,.12);border:1px solid rgba(10,200,185,.4);margin-bottom:8px}
body.shared .bottomnav,body.shared .appbar-btn{display:none}
.ct-head{color:var(--gold-light);margin:6px 0 4px;font-size:.9rem}.ct-row{padding:7px 0;border-top:1px solid rgba(255,255,255,.08);font-size:.84rem;line-height:1.35}
[data-ctr]{-webkit-touch-callout:none;user-select:none;-webkit-user-select:none}
.hint{font-size:.72rem;color:var(--text-muted);margin:0 0 8px}
.toast{position:fixed;left:50%;bottom:calc(76px + env(safe-area-inset-bottom));transform:translateX(-50%) translateY(20px);background:#0A323C;border:1px solid var(--blue);color:#fff;padding:10px 16px;border-radius:12px;font-size:.84rem;opacity:0;pointer-events:none;transition:.2s;z-index:100}
.toast.show{opacity:1;transform:translateX(-50%)}
'''
shell_top='''
<div class="appbar">
  <div><span class="brand-badge">PATCH 26.23</span><h1>HEXTECH DRAFT</h1></div>
  <button class="appbar-btn" aria-label="Opcions" onclick="toggleSheet('sheetOpts')">⚙️</button>
</div>
<main>
'''
more_sheet='''
<div id="overlay" class="overlay" onclick="closeSheets()"></div>
<div id="sheetOpts" class="sheet">
  <h3>⚙️ Opcions del draft</h3>
  <div class="row2">
    <button id="btnSideBlue" class="btn btn-active-blue" onclick="setOurSide('BLUE')">🔵 Blue side</button>
    <button id="btnSideRed" class="btn" onclick="setOurSide('RED')">🔴 Red side</button>
    <button id="btnModeOrder" class="btn btn-active-blue" onclick="setDraftMode('ORDER')">📋 Ordre torneig</button>
    <button id="btnModeFree" class="btn" onclick="setDraftMode('FREE')">🖱️ Mode lliure</button>
  </div>
  <button id="btnFearless" class="btn" onclick="toggleFearless()">⚔️ Fearless: OFF</button>
  <button class="btn btn-danger" onclick="if(confirm('Reiniciar el draft?')){resetDraft();closeSheets();}">🔄 Reiniciar draft</button>
</div>
<div id="sheetMore" class="sheet">
  <h3>Més seccions</h3>
  <button class="btn" onclick="switchTab('roster')">👥 Roster, pools i op.gg</button>
  <button class="btn" onclick="switchTab('comps')">📚 Llibre de composicions</button>
  <button class="btn" onclick="switchTab('pro')">🧠 Draft pro, flex i jugadors</button>
  <button class="btn" onclick="switchTab('data')">🛠️ Dades i editors</button>
  <button class="btn" onclick="switchTab('patch')">📈 Parc 26.23</button>
</div>
<div id="sheetTip" class="sheet"><h3>Counters i sinergies</h3><div id="tipBody"></div></div>
<div id="toast" class="toast"></div>
<nav class="bottomnav">
  <button class="nav-btn active" data-tab="draft" onclick="switchTab('draft')"><span>🎯</span>Draft</button>
  <button class="nav-btn" data-tab="analysis" onclick="switchTab('analysis')"><span>🧩</span>Anàlisi</button>
  <button class="nav-btn" data-tab="me" onclick="switchTab('me')"><span>🎮</span>El meu joc</button>
  <button class="nav-btn" data-tab="more" onclick="toggleSheet('sheetMore')"><span>☰</span>Més</button>
</nav>
'''
tab_analysis='<div id="tab-analysis" class="tab-content">\n'+assign_strat+'\n</div>\n'
tab_me='<div id="tab-me" class="tab-content"><div id="meChips" class="mchips"></div><div id="meContent"></div></div>\n'

# patch draft: analyze button -> analysis tab
draft_main=draft_main.replace('onclick="generateStrategy()"','onclick="switchTab(\'analysis\')"')
draft_main=draft_main.replace('Analitzar Pla de Partida','Analitzar draft')
draft_main='<p class="hint">💡 Mantén premut un campió (llista o picks) per veure els seus counters i sinergies.</p>\n'+draft_main
# tables responsive
others=others.replace('<table','<table class="responsive"',) if False else others
# patch script
def sub1(pat,rep,s,flags=re.S):
    n=len(re.findall(pat,s,flags)); assert n==1,(pat,n); return re.sub(pat,lambda m:rep,s,flags=flags)
script=sub1(r"function switchTab\(tabId, btn\) \{.*?\n\}\n",'',script)
script=sub1(r"function openDataTab\(\) \{.*?\n\}\n",'',script)
script=sub1(r"  const sec = document.getElementById\('strategySection'\);\n  sec.style.display = 'block';\n  sec.scrollIntoView\(\{ behavior: 'smooth' \}\);",
 "  const sec = document.getElementById('strategySection');\n  sec.style.display = 'block';\n  makeCollapsible(document.getElementById('strategyContent'));",script)
script=sub1(r"function deliverPlanText\(out, nParts\) \{.*?\n\}\n",
 "function deliverPlanText(out) { shareText('Pla de partida', out, ''); }\n",script)
tail='''
// taules -> targetes (data-label)
function labelTables(){
  document.querySelectorAll('.tab-content table').forEach(t=>{
    t.classList.add('responsive');
    const ths=[...t.querySelectorAll('thead th')].map(h=>h.textContent.trim());
    t.querySelectorAll('tbody tr').forEach(tr=>[...tr.children].forEach((td,i)=>{ if(ths[i]&&td.dataset.label!==ths[i]) td.dataset.label=ths[i]; }));
  });
}
try{
  new MutationObserver(labelTables).observe(document.querySelector('main'),{childList:true,subtree:true});
  labelTables();
}catch(e){}
try{ if('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('sw.js').catch(()=>{}); }catch(e){}
(function(){
  const m=/^#j=(.+)$/.exec(location.hash||'');
  if(m){const d=decodeShare(m[1]); if(d&&d.v===1){showSharedView(d);return;}}
  switchTab('draft');
})();
'''
script=script.replace('\ninit();\n','\ninit();\n'+open(S+'blockM.js',encoding='utf-8').read()+tail,1)
assert 'showSharedView(d);return' in script
html='<!DOCTYPE html>\n<html lang="ca">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<meta name="theme-color" content="#091428">\n<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="mobile-web-app-capable" content="yes">\n<title>Hextech Draft Mobile 26.23</title>\n<link rel="manifest" href="manifest.webmanifest">\n<link rel="icon" href="icon-192.png">\n<link rel="apple-touch-icon" href="icon-192.png">\n<meta name="apple-mobile-web-app-title" content="Hextech Draft">\n<style>'+css+mobile_css+'</style>\n</head>\n<body>\n'+shell_top+draft_main+tab_analysis+tab_me+others+'</main>\n'+more_sheet+'<script>'+script+'</script>\n</body>\n</html>\n'
open(ROOT+'index.html','w',encoding='utf-8').write(html)
print(len(html))
