// Prova del motor en Node (sense navegador). VERBOSE=1 per veure-ho tot.
const _log=console.log;if(!process.env.VERBOSE){console.log=(...a)=>{if(/^(FAIL|ok|comps)$/.test(String(a[0])))_log(...a)};console.warn=()=>{};}
process.on('exit',()=>{if(typeof fail!=='undefined'&&fail)process.exitCode=1});
const fs=require('fs');
const html=fs.readFileSync(process.env.HTML||require('path').join(__dirname,'..','pc.html'),'utf8');
let js=html.match(/<script>([\s\S]*)<\/script>/)[1];
const els={};const mk=id=>els[id]||(els[id]={scrollIntoView(){},id,value:'',innerHTML:'',textContent:'',checked:false,childElementCount:0,classList:{add(){},remove(){},toggle(){}},style:{},dataset:{}});
global.document={getElementById:mk,querySelectorAll:()=>[],addEventListener(){},activeElement:null};
global.localStorage={_d:{},getItem(k){return this._d[k]||null},setItem(k,v){this._d[k]=v},removeItem(k){delete this._d[k]}};
Object.defineProperty(globalThis,'navigator',{value:{clipboard:{writeText(){return Promise.resolve()}}},configurable:true});global.alert=()=>{};
js=js.replace(/^init\(\);\s*$/m,'');
eval(js+';global.S=state;global.api={ROSTER,COMPS,init,recommendChamps,buildCtx,autoAssign,getAssignment,buildStrategy,generateStrategy,champRating,champStat,statText,duoSuggestions,renderAll,playerSlump,playerHot,evaluateComps,getLiveAdvice}');
const strip=s=>s.replace(/<[^>]+>/g,'');var ok=0,fail=0;const T=(n,c)=>{c?ok++:(fail++,console.log('FAIL',n))};
api.init();
api.ROSTER.forEach((p,i)=>console.log(shortN(p),Object.entries(p.rolePools).map(([r,l])=>r+':'+l.length).join(' '),'| hl:',p.opggHighlights.map(h=>h.champ+h.bonus).join(',')));
function shortN(p){return p.name.split('#')[0]}
T('arn sup pool',api.ROSTER[0].rolePools.Sup&&api.ROSTER[0].rolePools.Sup.includes('Milio')&&api.ROSTER[0].rolePools.Sup.includes('Nautilus'));
T('pil bot pool',api.ROSTER[4].rolePools.Bot&&api.ROSTER[4].rolePools.Bot.includes('Caitlyn'));
T('ronin top',!!api.ROSTER[2].rolePools.Top);
T('vpa only bot',Object.keys(api.ROSTER[3].rolePools).join()==='Bot');
T('rating order',api.champRating(0,'Nautilus')>10&&api.champRating(0,'Seraphine')<-8&&api.champRating(1,'Naafiri')<-15);
console.log('ratings',['Nautilus','Milio','Poppy','Seraphine'].map(c=>c+':'+api.champRating(0,c).toFixed(1)).join(' '));
T('slump ronin',api.playerSlump(2)&&api.playerHot(0)&&!api.playerSlump(1));
// assignment
const a=api.autoAssign(['Malphite','Jhin','Zaahen','Vex','Pyke']);console.log('assign',a.rolePlayer.map((p,r)=>['Top','Jg','Mid','Bot','Sup'][r]+':'+shortN(api.ROSTER[p])+'='+a.roleChamp[r]).join(' '));
const b=api.autoAssign(['Milio','Caitlyn','Zaahen','Vex','Poppy']);console.log('assign2',b.rolePlayer.map((p,r)=>['Top','Jg','Mid','Bot','Sup'][r]+':'+shortN(api.ROSTER[p])+'='+b.roleChamp[r]).join(' '));
// recs
S.ourSide='BLUE';S.activeSlot={type:'PICK',side:'BLUE',index:0};
let r=api.recommendChamps(api.buildCtx(),0);console.log('REC1',r.slice(0,10).map(x=>x.champ+':'+x.score).join(', '));
const sera=r.find(x=>x.champ==='Seraphine');console.log('sera',sera&&sera.score,sera&&sera.why.filter(w=>/historial/.test(w.txt)).map(w=>w.txt));
const zh=r.find(x=>x.champ==='Zaahen');console.log('zaahen',zh.why.filter(w=>/historial/.test(w.txt)).map(w=>w.pts+' '+w.txt));
const bard=r.find(x=>x.champ==='Bard');console.log('bard',bard&&bard.why.filter(w=>/historial/.test(w.txt)).map(w=>w.pts+' '+w.txt));T('bard penalised',bard&&bard.why.some(w=>/historial negatiu/.test(w.txt)));
// strategy
S.bluePicks=['Malphite','Jhin','Zaahen','Vex','Pyke'];S.redPicks=['Lee Sin','Orianna','Nautilus','Rumble','Ezreal'];
const st=api.buildStrategy();console.log(st.lanes.map(l=>l.role+' '+l.champ+' | '+l.notes.join('; ')+' | '+l.flags.join('; ')).join('\n'));
T('lane has historial',st.lanes.some(l=>l.notes.some(n=>/historial/.test(n))));
const d=api.duoSuggestions('Bot','Sup',5);console.log('duos',d.map(o=>o.c1+'+'+o.c2+':'+o.s.toFixed(0)).join(', '));T('duos',d.length>=3);
console.log(strip(els.playerSheets.innerHTML).slice(0,900));
api.renderAll();api.generateStrategy();
console.log('comps',api.COMPS.length,'ok',ok,'fail',fail);
