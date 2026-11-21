// Aprenentatge: historial compartit (data.json) + local, parelles de campions, veredicte de línia i text de Discord.
const { PC, DATA, check, done, openPage } = require('./lib');
const d = JSON.parse(DATA);
// historial de prova (només per a aquesta prova; no es publica)
d.data.hextech_history_v1=[{date:'2026-11-01',side:'BLUE',result:'W',us:['Malphite','Zaahen','Vex','Kai\'Sa','Pyke'],enemy:['A'],roles:[{role:'Top',player:'arnauklero#EUW',champ:'Malphite'},{role:'Jg',player:'StepOnMeEvelynn#EUW',champ:'Zaahen'},{role:'Mid',player:'RoninKamui66#PIXAR',champ:'Vex'},{role:'Bot',player:'vpa2134#EUW',champ:"Kai'Sa"},{role:'Sup',player:'PiltoversTelecom#EUW',champ:'Pyke'}]},
{date:'2026-11-02',side:'RED',result:'W',us:['Ornn','Zaahen','Vex','Kai\'Sa','Pyke'],enemy:['B'],roles:[{role:'Top',player:'arnauklero#EUW',champ:'Ornn'},{role:'Jg',player:'StepOnMeEvelynn#EUW',champ:'Zaahen'},{role:'Mid',player:'RoninKamui66#PIXAR',champ:'Vex'},{role:'Bot',player:'vpa2134#EUW',champ:"Kai'Sa"},{role:'Sup',player:'PiltoversTelecom#EUW',champ:'Pyke'}]},
{date:'2026-11-03',side:'RED',result:'W',us:['Ornn','Zaahen','Ahri','Kai\'Sa','Pyke'],enemy:['C'],roles:[{role:'Top',player:'arnauklero#EUW',champ:'Ornn'},{role:'Jg',player:'StepOnMeEvelynn#EUW',champ:'Zaahen'},{role:'Mid',player:'RoninKamui66#PIXAR',champ:'Ahri'},{role:'Bot',player:'vpa2134#EUW',champ:"Kai'Sa"},{role:'Sup',player:'PiltoversTelecom#EUW',champ:'Pyke'}]}];

(async () => {
  const { browser, page: p, errors } = await openPage(process.env.HTML || PC, { data: JSON.stringify(d) });
  const r = await p.evaluate(()=>{const o={};
 o.builds=Object.keys(REAL_BUILDS).length+' '+REAL_BUILDS_PATCH;
 o.hist=allHist().length+' teamRec Zaahen '+JSON.stringify(teamRec(1,'Zaahen'));
 o.duo=JSON.stringify(duoRec('Kai\'Sa','Pyke'));
 resetDraft();setOurSide('BLUE');setDraftMode('FREE');state.bluePicks=['Ornn','Zaahen',null,"Kai'Sa",null];state.redPicks=['Darius',"Kha'Zix",'Zed','Draven',null];renderAll();
 const rec=recommendChamps(buildCtx(),4).find(x=>x.champ==='Pyke');o.pyke=rec?rec.why.filter(w=>/parella/.test(w.txt)).map(w=>w.pts+' '+w.txt).join(';'):'none';
 o.mu=JSON.stringify(muScore('Orianna','Zed'))+' '+JSON.stringify(laneMatchup('Orianna','Zed','Mid').score);
 state.bluePicks=['Ornn','Zaahen','Orianna',"Kai'Sa",'Pyke'];state.redPicks=['Darius',"Kha'Zix",'Zed','Draven','Leona'];renderAll();
 const s=buildStrategy();o.mid=s.lanes.find(l=>l.role==='Mid').verdict;
 o.discord=copyDiscordPlan().slice(0,2600);
 renderHistory();o.histTxt=(document.querySelector('#histPanel .panel-title + div')||{}).textContent;
 return o;});
  if (process.env.VERBOSE) console.log(r);
  check('historial compartit llegit', /^3 teamRec Zaahen \{"w":3,"l":0\}/.test(r.hist), r.hist);
  check('parella Kai\'Sa+Pyke 3-0', r.duo === '{"w":3,"l":0}', r.duo);
  check('bonus de parella a la recomanació', /parella amb .* 3V-0D/.test(r.pyke), r.pyke);
  check('Orianna contra Zed és línia difícil (WR real)', r.mid === 'bad', r.mid);
  check('Discord inclou teamfights i objectius', /TEAMFIGHTS/.test(r.discord) && /OBJECTIUS/.test(r.discord), r.discord.slice(0, 200));
  check('historial mostra les compartides', /3 compartides/.test(r.histTxt || ''), r.histTxt);
  check('sense errors de pàgina', errors.length === 0, errors);
  await browser.close();
  done('aprenentatge');
})();
