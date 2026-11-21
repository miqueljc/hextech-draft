// Prova del motor en Node (sense navegador). VERBOSE=1 per veure-ho tot.
const _log=console.log;if(!process.env.VERBOSE){console.log=(...a)=>{if(/^(FAIL|ok|comps)$/.test(String(a[0])))_log(...a)};console.warn=()=>{};}
process.on('exit',()=>{if(typeof fail!=='undefined'&&fail)process.exitCode=1});
const fs=require('fs');
const html=fs.readFileSync(process.env.HTML||require('path').join(__dirname,'..','pc.html'),'utf8');
let js=html.match(/<script>([\s\S]*)<\/script>/)[1];
const els={};const mk=id=>els[id]||(els[id]={scrollIntoView(){},id,value:'',innerHTML:'',textContent:'',checked:false,childElementCount:0,classList:{add(){},remove(){},toggle(){}},style:{},dataset:{}});
global.alert=()=>{};global.document={getElementById:mk,querySelectorAll:()=>[],addEventListener(){},activeElement:null};
global.localStorage={_d:{},getItem(k){return this._d[k]||null},setItem(k,v){this._d[k]=v},removeItem(k){delete this._d[k]}};
Object.defineProperty(globalThis,'navigator',{value:{clipboard:{writeText(){}}},configurable:true});
js=js.replace(/^init\(\);\s*$/m,'');
eval(js+';global.S=state;global.api={recommendChamps,buildCtx,getLiveAdvice,evaluateComps,buildStrategy,generateStrategy,renderAll,init,COMPS,ROSTER,parseOpgg,analyzeOpgg,applyOpgg,resetOpgg,recommendBans,predictEnemy,runWhatIf,closeGame,toggleFearless,fearlessBlocked,saveCounters,saveSynergy,saveTier,resetTier,resetCounters,resetSynergy,saveTagChamp,loadTagChamp,resetAllTags,LANE_COUNTERS,SYNERGY_PAIRS,PATCH_META,CHAMP_DATA,renderPatchBanner,saveTagChamp,copyDiscordPlan,tierToText,bestTier}');
const strip=s=>s.replace(/<[^>]+>/g,'');
var ok=0,fail=0;const T=(n,c)=>{c?ok++:(fail++,console.log('FAIL',n))};
api.init();
// 1 opgg parser
const txt=`1\nKai'Sa\nADC\n53.1%\n146 Played\n2\nCaitlyn 50% 130\nJhin 57,5% 40 partides\nNada 99%\nNunu & Willump 49% 20`;
const p=api.parseOpgg(txt);console.log(JSON.stringify(p));
T('parse kaisa',p.find(x=>x.champ==="Kai'Sa"&&x.wrNum===53.1&&x.games===146));
T('parse cait',p.find(x=>x.champ==='Caitlyn'&&x.games===130));
T('parse jhin',p.find(x=>x.champ==='Jhin'&&x.wrNum===57.5&&x.games===40));
T('nunu',p.find(x=>x.champ==='Nunu & Willump'));
mk('opggText_3').value=txt;api.analyzeOpgg(3);api.applyOpgg(3);
console.log(api.ROSTER[3].opggHighlights.map(h=>h.champ+':'+h.bonus+':'+h.wr).join(' | '));
T('opgg applied',api.ROSTER[3].opggHighlights.some(h=>h.champ==='Jhin'));
api.resetOpgg(3);T('opgg reset',api.ROSTER[3].opggHighlights.some(h=>h.champ==='Samira')&&!api.ROSTER[3].opggCustom);
// 2 counters/synergy
mk('countersText').value="Malphite > Yasuo, Zed\nFoo > Bar";api.saveCounters();T('counters',api.LANE_COUNTERS.Malphite.join()==='Yasuo,Zed'&&Object.keys(api.LANE_COUNTERS).length===1);console.log(els.countersMsg.textContent);
api.resetCounters();T('counters reset',Object.keys(api.LANE_COUNTERS).length>=10);
mk('synergyText').value="Lux + Garen : 9\nbad line";api.saveSynergy();T('syn',api.SYNERGY_PAIRS.length===1&&api.SYNERGY_PAIRS[0][2]===9);api.resetSynergy();T('syn reset',api.SYNERGY_PAIRS.length>10);
// 3 tier
const orig=api.tierToText();mk('tierSource').value='26.23';mk('tierText').value=orig.replace('Top S+: Malphite, Ornn','Top S+: Garen, Teemo');api.saveTier();
console.log(els.tierMsg.textContent);T('tier 26.23',api.PATCH_META.tierSource==='26.23'&&api.bestTier('Teemo')==='S+'&&api.bestTier('Ornn')!=='S+');
api.renderPatchBanner();console.log('banner',els.patchBanner.innerHTML.slice(0,150));
api.resetTier();T('tier reset',api.PATCH_META.tierSource==='26.23'&&api.bestTier('Malphite')==='S+');
// 4 tags
mk('tagChamp').value='Garen';api.loadTagChamp();
['T','J','M','B','S'].forEach(L=>mk('tr_'+L).checked=(L==='T'||L==='M'));
['front','eng','peel','poke','dive','assn','rng','mob','combo','scale','early','split','ap','ad'].forEach(t=>mk('tt_'+t).checked=(t==='ap'));
api.saveTagChamp('Garen');T('tags',api.CHAMP_DATA.Garen.roles.includes('M')&&api.CHAMP_DATA.Garen.tags.has('ap')&&!api.CHAMP_DATA.Garen.tags.has('front'));
api.resetAllTags();T('tags reset',api.CHAMP_DATA.Garen.tags.has('front'));
// 5 bans
S.ourSide='BLUE';S.activeSlot={type:'BAN',side:'BLUE',index:0};
let b=api.recommendBans(api.buildCtx());console.log('BAN r1',b.slice(0,5).map(x=>x.champ+':'+x.score).join(', '));T('ban excl pool',!b.some(x=>['Malphite','Galio','Pyke'].includes(x.champ)));
console.log(strip(api.getLiveAdvice(api.evaluateComps())).slice(0,400));
S.bluePicks=['Malphite','Ahri',null,null,null];S.redPicks=['Lee Sin','Orianna',null,null,null];S.activeSlot={type:'BAN',side:'RED',index:3};
console.log(strip(api.getLiveAdvice(api.evaluateComps())).slice(0,420));
S.activeSlot={type:'BAN',side:'BLUE',index:3};b=api.recommendBans(api.buildCtx());console.log('BAN r2',b.slice(0,5).map(x=>x.champ+':'+x.score+' ['+x.why.map(w=>w.txt).join('; ')+']').join('\n'));
// 7 prediction
S.activeSlot={type:'PICK',side:'RED',index:2};const pr=api.predictEnemy(api.buildCtx());console.log('PRED',pr.slice(0,5).map(x=>x.champ+' '+Math.round(x.prob*100)+'%').join(', '));T('pred sums',Math.abs(pr.reduce((s,x)=>s+x.prob,0)-1)<1e-6);
console.log(strip(api.getLiveAdvice(api.evaluateComps())).slice(-300));
// 8 whatif
S.activeSlot={type:'PICK',side:'BLUE',index:2};const before=JSON.stringify([S.bluePicks,S.assign]);api.runWhatIf();T('whatif restore',JSON.stringify([S.bluePicks,S.assign])===before);
console.log(strip(els.whatIfBox.innerHTML).slice(0,600));
// 6 fearless
S.bluePicks=['Malphite','Ahri',"Kai'Sa",'Zaahen','Pyke'];S.redPicks=['Lee Sin','Orianna','Nautilus','Rumble','Ezreal'];
api.toggleFearless();T('fearless on',S.fearless===true);
api.closeGame('W');T('game closed',S.series.games.length===1&&S.bluePicks.every(x=>x===null));
T('blocked both',api.fearlessBlocked('BLUE').has('Rumble')&&api.fearlessBlocked('BLUE').has('Pyke'));
S.fearlessRule='OWN';T('own blocked',api.fearlessBlocked('BLUE').has('Pyke')&&!api.fearlessBlocked('BLUE').has('Rumble')&&api.fearlessBlocked('RED').has('Rumble'));
S.fearlessRule='BOTH';api.renderAll();console.log(strip(els.fearlessPanel.innerHTML).slice(0,500));
S.activeSlot={type:'PICK',side:'BLUE',index:0};const rr=api.recommendChamps(api.buildCtx(),0);T('no locked recs',!rr.some(x=>['Pyke','Malphite'].includes(x.champ)));
// 9 plan
S.fearless=false;S.bluePicks=['Malphite','Ahri',"Kai'Sa",'Zaahen','Pyke'];S.redPicks=['Lee Sin','Orianna','Nautilus','Rumble','Ezreal'];
const st=api.buildStrategy();T('plan',st.phasePlan.phases.length===7&&st.phasePlan.winConds.length>=1);
console.log(st.phasePlan.phases.map(f=>f.time+' '+f.title+': '+f.text).join('\n'));
console.log(st.phasePlan.winConds,st.phasePlan.loseConds);
api.generateStrategy();T('strategy has plan',els.strategyContent.innerHTML.includes('Pla per fases'));
let copied='';global.navigator.clipboard.writeText=t=>{copied=t;return Promise.resolve()};api.copyDiscordPlan();
console.log('ok',ok,'fail',fail);
