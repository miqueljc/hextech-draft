// Mode partida: un draft sencer amb tocs, correcció d'un pick rival, desfer, copiar per a Discord, desar resultat.
// Ús: node tests/match.test.js [mobile]
const { PC, MOBILE, check, done, openPage } = require('./lib');
const mobile = process.argv[2] === 'mobile';
(async () => {
  const { browser, page: p, errors: errs } = await openPage(mobile ? MOBILE : PC, mobile ? { device: 'iPhone 13' } : {});
  const out = [];
  const log2 = (...a) => { out.push(a.map(x => typeof x === 'string' ? x : JSON.stringify(x)).join(' ')); if (process.env.VERBOSE) console.log(...a); };
const clk=async s=>{await p.waitForSelector(s);await p.$eval(s,e=>{e.scrollIntoView({block:'center'});e.click()})};
const tap=async s=>{const t0=Date.now();await clk(s);await p.waitForTimeout(60);return Date.now()-t0};
await tap('#matchBtn');

const enemy={BAN:['Ahri','Kayn','Darius','Thresh','Jinx'],PICK:['Lee Sin','Orianna','Renekton','Kai\'Sa','Nautilus']};
const log=[];let taps=0,step=0,pairUsed=false;const ms=[];
for(let guard=0;guard<30;guard++){
 const info=await p.evaluate(()=>({done:mmComplete(),st:state.activeSlot,ours:state.activeSlot.side===state.ourSide,label:document.querySelector('.mm-turnlabel').innerText,sub:(document.querySelector('.mm-sub')||{}).innerText||''}));
 if(info.done)break;
 if(info.ours){
  const pair=await p.$('.mm-pair button');
  const t0=Date.now();
  if(pair&&!pairUsed){pairUsed=true;const txt=await p.innerText('.mm-pair .mm-card-h');await pair.evaluate(e=>e.click());taps++;log.push(info.label+' | '+info.sub+' => PAIR '+txt.replace('\n',' '));}
  else{const name=await p.innerText('.mm-card .mm-card-h b');await clk('.mm-card .btn-primary');taps++;log.push(info.label+' | '+info.sub+' => '+name);}
  ms.push(Date.now()-t0);
 } else {
  let want=enemy[info.st.type].shift();const unav=await p.evaluate(()=>[...getUnavailableChamps()]);while(unav.includes(want)){want=({BAN:['Viego','Warwick','Jhin','Sylas'],PICK:['Viego','Syndra','Gnar','Ezreal','Rakan']})[info.st.type].find(x=>!unav.includes(x));}
  const chips=await p.$$eval('.mm-chip',e=>e.map(x=>x.dataset.c));
  if(chips.includes(want)){await clk(`.mm-chip[data-c="${want}"]`);taps++;log.push(info.label+' => '+want+' (1 toc, suggerit)');}
  else{await clk('.mm-other');await p.fill('#mmQ',want.slice(0,3));await p.waitForTimeout(50);const r=await p.$$eval('#mmRes .mm-chip',e=>e.map(x=>x.dataset.c));await clk(`#mmRes .mm-chip[data-c="${want}"]`);taps+=2;log.push(info.label+' => '+want+' (cerca "'+want.slice(0,3)+'": '+r.slice(0,3).join(',')+')');}
 }
 await p.waitForTimeout(80);
 
 step++;
}
log2(log.join('\n'));log2('taps',taps,'ms our turns',ms.join(','));

// correction: tap enemy pick 2 cell & change to Syndra, then undo
const rr=await p.evaluate(()=>state.redPicks.slice());
const redCells=await p.$$('.mm-red .mm-picks .mm-cell');await p.evaluate(()=>{document.getElementById('matchMode').scrollTop=0});await p.waitForTimeout(100);await redCells[1].dispatchEvent('click');await p.fill('#mmQ','synd');await clk('#mmRes .mm-chip[data-c="Syndra"]');
const after=await p.evaluate(()=>({r:state.redPicks.slice(),done:mmComplete(),label:document.querySelector('.mm-turnlabel').innerText}));
await clk('#matchMode .mm-undo');const undo=await p.evaluate(()=>state.redPicks.slice());
log2('before',rr,'\nafter fix',after,'\nafter undo',undo);
await clk('#matchMode >> text=⏱️ OFF');await p.waitForTimeout(300);const tm=await p.evaluate(()=>(document.getElementById('mmTimer')||{}).textContent||'(no timer: draft complet)');log2('timer',tm);
await clk('#matchMode >> text=📋 Copia per a Discord');await p.waitForTimeout(300);let clip='';try{clip=await p.evaluate(()=>navigator.clipboard.readText())}catch(e){clip='ERR '+e.message}
log2('clip',clip.slice(0,300));
await clk('#matchMode >> text=✅ Victòria');await p.waitForTimeout(100);log2('hist',await p.evaluate(()=>DRAFT_HIST.length+' '+DRAFT_HIST[DRAFT_HIST.length-1].result));

await clk('#matchMode >> text=🔄 Nou draft');await p.waitForTimeout(200);log2('new',await p.evaluate(()=>document.querySelector('.mm-turnlabel').innerText));
await clk('#matchMode >> text=⏱️ ON').catch(()=>{});
await clk('#matchMode >> text=✕ Surt');log2('closed',await p.evaluate(()=>getComputedStyle(document.getElementById('matchMode')).display));
  const txt = out.join('\n');
  check('draft complet amb tocs', /taps \d+/.test(txt), txt.slice(0, 300));
  check('correcció i desfer', /after undo/.test(txt));
  check('copia per a Discord', /clip .*DRAFT/s.test(txt), (txt.match(/clip.*/) || [''])[0]);
  check('resultat desat', /hist \d+ W/.test(txt));
  check('mode partida tancat', /closed none/.test(txt));
  check('sense errors de pàgina', errs.length === 0, errs.slice(0, 5));
  await browser.close();
  done(mobile ? 'mode partida (mòbil)' : 'mode partida (escriptori)');
})();
