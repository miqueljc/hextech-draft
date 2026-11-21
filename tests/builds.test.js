// Builds: les reals (data.json) són vàlides i tenen icones; les generades per a tots els campions i rols també.
const { PC, check, done, openPage } = require('./lib');
(async () => {
  const { browser, page, errors } = await openPage(process.env.HTML || PC);
  const real = await page.evaluate(()=>{const bad=[];
 Object.entries(REAL_BUILDS).forEach(([k,r])=>{const [ks,pri,sec,sh,sums,start,boots,core,alt,fourth]=r;
  const kt=runeRowOf(ks);if(!kt||kt.row!==0)bad.push(k+' keystone '+ks);
  const pm=pri.split(' · ');const rows=pm.map(m=>{const z=runeRowOf(m);if(!z||z.tree!==kt.tree)bad.push(k+' primary '+m);return z&&z.row});
  if(new Set(rows).size!==3||rows.includes(0))bad.push(k+' primary rows '+rows);
  const st=sec.slice(0,sec.indexOf(': ')),sm=sec.slice(sec.indexOf(': ')+2);const ss=sm.split(' · ');if(st===kt.tree)bad.push(k+' sec same tree');
  const sr=ss.map(m=>{const z=runeRowOf(m);if(!z||z.tree!==st)bad.push(k+' sec '+m);return z&&z.row});if(sr[0]===sr[1]||sr.includes(0))bad.push(k+' sec rows');
  [...pm,...ss,ks].forEach(m=>{if(!runeUrl(m))bad.push(k+' no icon rune '+m)});
  sh.split('·').forEach(s=>{if(!shardUrl(s))bad.push(k+' shard '+s)});
  sums.split(' + ').forEach(s=>{if(!spellUrl(s))bad.push(k+' spell '+s)});
  [...start.split(' + '),boots,...core,...alt,...fourth].forEach(i=>{if(!itemUrl(i))bad.push(k+' item '+i)});
  // pool coverage
 });
 const miss=[];ROSTER.forEach((pl,pi)=>playerRoles(pi).forEach(r=>poolOf(pi,r).forEach(c=>{if(!REAL_BUILDS[c+'|'+r])miss.push(c+'|'+r)})));
 return {bad:[...new Set(bad)],n:Object.keys(REAL_BUILDS).length,miss:[...new Set(miss)]};});
  check('builds reals carregades (>=100)', real.n >= 100, real.n);
  check('builds reals sense errors de runes, fragments o icones', real.bad.length === 0, real.bad);
  check('pool cobert gairebé sencer (<=5 sense build real)', real.miss.length <= 5, real.miss);
  const gen = await page.evaluate(()=>{
 const ROWS={Domination:[['Electrocute','Dark Harvest','Hail of Blades'],['Cheap Shot','Taste of Blood','Sudden Impact'],['Sixth Sense','Grisly Mementos','Deep Ward'],['Treasure Hunter','Relentless Hunter','Ultimate Hunter']],
 Inspiration:[['Glacial Augment','Unsealed Spellbook','First Strike'],['Hextech Flashtraption','Magical Footwear','Cash Back'],['Triple Tonic','Time Warp Tonic','Biscuit Delivery'],['Cosmic Insight','Approach Velocity','Jack of All Trades']],
 Precision:[['Press the Attack','Lethal Tempo','Fleet Footwork','Conqueror'],['Absorb Life','Triumph','Presence of Mind'],['Legend: Alacrity','Legend: Haste','Legend: Bloodline'],['Coup de Grace','Cut Down','Last Stand']],
 Resolve:[['Grasp of the Undying','Aftershock','Guardian'],['Demolish','Font of Life','Shield Bash'],['Conditioning','Second Wind','Bone Plating'],['Overgrowth','Revitalize','Unflinching']],
 Sorcery:[['Summon Aery','Arcane Comet',"Stormraider's Surge",'Deathfire Touch'],['Axiom Arcanist','Manaflow Band','Nimbus Cloak'],['Transcendence','Celerity','Absolute Focus'],['Scorch','Waterwalking','Gathering Storm']]};
 const rowOf=(t,n)=>ROWS[t]?ROWS[t].findIndex(r=>r.includes(n)):-2;
 const minorsOf=str=>{const i=str.indexOf(': ');return {tree:str.slice(0,i),m:str.slice(i+2).split(' · ').map(x=>x.replace(/\([^)]*\)/g,'').split(/\s+o\s+/).map(y=>y.trim()))}};
 const bad=new Set(),unres=new Set();let n=0;
 const enemies=[['Zed','Lee Sin','Syndra','Jinx','Leona'],['Ornn','Sejuani','Orianna','Ezreal','Soraka'],['Darius','Warwick','LeBlanc','Kai\'Sa','Nautilus'],['Malphite','Amumu','Malzahar','Vayne','Yuumi'],['Fiora','Vi','Katarina','Draven','Thresh']];
 ALL_CHAMPS.forEach(c=>champRoles(c).forEach(r=>enemies.forEach(en=>{const x=makeBuildCtx([c],en);let bb;try{bb=adviseBuild(c,r,x)}catch(e){bad.add('ERR '+c+' '+e.message);return}n++;
  // validesa: clau al seu arbre, menors 1 per fila (1-3), secundari 2 de files diferents (1-3) d'un altre arbre
  const kt=TREE_OF[bb.keystone];const P=minorsOf(bb.primary),Sx=minorsOf(bb.secondary);
  if(P.tree!==kt)bad.add('clau '+bb.keystone+' fora de '+P.tree);
  if(rowOf(kt,bb.keystone)!==0)bad.add('clau '+bb.keystone+' no és keystone');
  const pr=P.m.map(opts=>opts.map(o=>rowOf(P.tree,o)));pr.forEach((rs,i)=>rs.forEach(rw=>{if(rw!==i+1)bad.add('principal '+P.tree+': '+P.m[i].join('/')+' fila '+rw+' (esperada '+(i+1)+')')}));
  if(Sx.tree===P.tree)bad.add('secundari mateix arbre '+Sx.tree);
  const sr=Sx.m.map(o=>rowOf(Sx.tree,o[0]));if(sr.some(v=>v<1)||sr[0]===sr[1])bad.add('secundari '+bb.secondary+' files '+sr);
  const html=buildIconsHtml(bb,'t');const d=document.createElement('div');d.innerHTML=html;d.querySelectorAll('.gi-txt').forEach(e=>unres.add(e.dataset.n));
 })));
 return {n,bad:[...bad],unres:[...unres]};});
  check('builds generades (>=1000)', gen.n >= 1000, gen.n);
  check('builds generades vàlides', gen.bad.length === 0, gen.bad.slice(0, 10));
  check('totes les icones resoltes', gen.unres.filter(x => !x.startsWith('Sense desviaments')).length === 0, gen.unres);
  check('sense errors de pàgina', errors.length === 0, errors);
  await browser.close();
  done('builds');
})();
