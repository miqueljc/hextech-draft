// ================= PLA PER FASES AMB TIMINGS I WIN CONDITIONS =================
// Timings d'objectius de la temporada 2026 (nerfplz.com, 08/2026): Drac 5:00, Void Grubs 8:00 (fins 14:45), Herald 15:00 (fins 19:45), Baró 20:00 (respawn 6:00), Elder després del 4t drac.
function buildPhasePlan(x) {
  const { A, B, lanes, comp, earlyDiff, scaleDiff, ourInit, theirInit, ourPicks, enemyPicks } = x;
  const nm = (L, tag) => L.filter(c => hasTag(c, tag));
  const fmt = a => a.length ? a.join(', ') : '—';
  const good = lanes.filter(l => l.verdict === 'good'), bad = lanes.filter(l => l.verdict === 'bad');
  const lead = earlyDiff >= 1 || good.length > bad.length;
  const behind = earlyDiff <= -1 || bad.length > good.length;
  const phases = [];
  phases.push({ time: '0:00 – 5:00', title: 'Línies i nivells 1-3', text:
    (good.length ? `Pressioneu ${good.map(l => l.role).join('/')} (avantatge de matchup): feu servir el primer reset per fer push i convertir-lo en prioritat. ` : '') +
    (bad.length ? `Cediu terreny a ${bad.map(l => l.role).join('/')}: farmeu sota torre i demaneu visió del jungla abans del nivell 3. ` : '') +
    (earlyDiff >= 1 ? `Teniu més early (${fmt(nm(A.list, 'early'))}): una invasió o gank nivell 2-3 pot donar el primer avantatge. ` : earlyDiff <= -1 ? `El rival és més fort early (${fmt(nm(B.list, 'early'))}): ward profund i no accepteu 2v2 forçats. ` : 'Early igualat: guanyeu amb visió i control d\'ones. ') });
  phases.push({ time: '5:00', title: 'Primer Drac', text: lead ? 'Contesteu-lo amb prioritat de línies i visió prèvia; si el guanyeu, convertiu-lo en torre.' : behind ? 'No el forceu sense prioritat: cediu-lo i agafeu una altra cosa (torre, Grubs) a canvi.' : 'Recurs de visió i jungla decideixen: arribeu 30-45 s abans i només lluiteu amb numèrics.' });
  const spikes = lanes.filter(l => l.champ && (hasTag(l.champ, 'early') || hasTag(l.champ, 'scale')));
  phases.push({ time: '6:00 – 8:00', title: 'Nivell 6 i primers pics de poder', text:
    (spikes.length ? spikes.map(l => `${l.champ} (${l.role}): ${hasTag(l.champ, 'early') ? 'pic al nivell 2-3 i 6' : 'pic amb 2-3 ítems'}`).join(' · ') + '. ' : '') +
    (B.list.some(c => hasTag(c, 'early')) ? `Vigileu els pics rivals: ${fmt(nm(B.list, 'early'))}.` : '') });
  phases.push({ time: '8:00 – 14:45', title: 'Void Grubs', text: (A.poke + A.dive + A.split >= 2 || lead) ? 'Prioritzeu els Grubs: vostre comp pot convertir-los en pressió de torres. Aneu-hi amb visió i el jungla amb prioritat.' : behind ? 'No els peleu si no teniu prioritat: guanyeu temps a una altra línia i cediu només els Grubs.' : 'Valoreu-los segons la prioritat de línies; no pagueu una mort per 1-2 Grubs.' });
  phases.push({ time: '15:00 – 19:45', title: 'Rift Herald', text: (A.dive + A.eng + A.assn >= 2) ? 'La vostra comp té iniciació/dive: feu servir el Herald per obrir una torre o plat i forçar al rival a respondre.' : 'Si no teniu engage clar, agafeu-lo només si el rival ja ha rotat; el Herald ajuda a tombar una línia, no a lluitar 5v5.' });
  phases.push({ time: '20:00 (Baró)', title: 'Baró Nashor', text: ourInit - theirInit >= 2 ? 'Teniu més iniciació/mobilitat: forceu la zona del Baró amb visió, obligueu-los a lluitar en desavantatge.' : ourInit - theirInit <= -2 ? 'Ells inicien millor: no us agrupeu al Baró sense visió i guardeu CC/Flash pel carry. Si cal, cediu-lo i agafeu torres.' : 'Mid equilibrat: el primer equip amb visió 45 s abans decideix. Preparar abans de la baralla.' });
  phases.push({ time: '25:00+ / Elder', title: 'Late game', text: scaleDiff >= 1 ? `Escaleu millor (${fmt(nm(A.list, 'scale'))}): jugueu segur, eviteu skirmishes i prioritzeu Elder/Baró amb tots els ítems.` : scaleDiff <= -1 ? `El rival escala millor (${fmt(nm(B.list, 'scale'))}): s'ha de tancar abans del 25: feu servir cada objectiu per tombar torres.` : 'Late igualat: un sol error decideix; l\'equip amb visió, CC en cadena i millor posicionament guanya.' });

  const winConds = [];
  if (earlyDiff >= 1) winConds.push(`Snowball early: guanyeu ${good.length ? good.map(l => l.role).join('/') : 'una línia'} i convertiu-ho en Grubs/Herald/torres abans del 20:00.`);
  if (scaleDiff >= 1) winConds.push(`Escalat: arribeu al 25+ amb 3 ítems a ${fmt(nm(A.list, 'scale'))} sense perdre objectius importants.`);
  if (A.eng >= 2 && B.mob <= 1 && B.n >= 3) winConds.push('Engage: rival poc mòbil; una iniciació encertada decideix cada teamfight.');
  if (A.peel >= 2 && B.dive + B.assn >= 2) winConds.push('Peel: protegiu el carry i deixeu que el dive rival es fregeixi.');
  if (A.poke >= 2 && B.eng + B.dive <= 1 && B.n >= 3) winConds.push('Poke/setge: desgasteu abans dels objectius, el rival té poca iniciació per castigar-vos.');
  if (A.split > B.split) winConds.push(`Pressió lateral amb ${fmt(nm(A.list, 'split'))} per obligar el rival a dividir-se.`);
  if (!winConds.length) winConds.push(`Seguiu el pla base de la comp (${comp.style.toLowerCase()}): ordre, visió i objectius.`);
  const loseConds = [];
  if (B.poke >= 2 && A.eng < 1) loseConds.push(`Que us fagin poke i setge (${fmt(nm(B.list, 'poke'))}) sense que pugueu entrar.`);
  if (B.dive + B.assn >= 3) loseConds.push(`Que el seu dive/assassins (${fmt([...new Set([...nm(B.list, 'dive'), ...nm(B.list, 'assn')])])}) trobi el vostre carry sense peel.`);
  if (B.eng >= 2) loseConds.push(`Que el seu engage (${fmt(nm(B.list, 'eng'))}) iniciï quan esteu fora de posició.`);
  if (scaleDiff <= -1) loseConds.push('Que la partida s\'allargui més enllà del 25:00.');
  if (earlyDiff <= -1) loseConds.push('Que us snowballin early: eviteu morts a ' + (bad.length ? bad.map(l => l.role).join('/') : 'les línies') + '.');
  if (A.n >= 4 && (A.ap === 0 || A.ad === 0)) loseConds.push(`Que stackegin ${A.ap === 0 ? 'armadura' : 'resistència màgica'} perquè feu un sol tipus de dany.`);
  if (!loseConds.length) loseConds.push('Cap patró de derrota clar: eviteu errors de visió i morts evitables.');
  return { phases, winConds, loseConds };
}
function phasePlanHtml(p) {
  return `<div class="strat-card" style="grid-column: 1 / -1;">
    <h4>🗺️ Pla per fases amb timings d'objectius</h4>
    <div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:0.8rem;">
      <tbody>${p.phases.map(f => `<tr><td style="padding:5px 8px;border-bottom:1px solid rgba(255,255,255,0.06);white-space:nowrap;color:var(--gold);vertical-align:top;"><strong>${escapeHtml(f.time)}</strong></td><td style="padding:5px 8px;border-bottom:1px solid rgba(255,255,255,0.06);vertical-align:top;"><strong>${escapeHtml(f.title)}</strong><br><span>${escapeHtml(f.text)}</span></td></tr>`).join('')}</tbody>
    </table></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:10px;">
      <div><strong style="color:var(--green);">🏆 Condicions de victòria</strong><ul style="margin-top:4px;">${p.winConds.map(t => `<li>${escapeHtml(t)}</li>`).join('')}</ul></div>
      <div><strong style="color:#FF8A9B;">⚠️ Com ens poden guanyar</strong><ul style="margin-top:4px;">${p.loseConds.map(t => `<li>${escapeHtml(t)}</li>`).join('')}</ul></div>
    </div>
    <div style="color:var(--text-muted);font-size:0.72rem;margin-top:6px;">Temps d'objectius de la temporada 2026 segons <a href="https://www.nerfplz.com/2026/08/every-summoners-rift-objective.html" target="_blank" rel="noopener" style="color:var(--blue);">nerfplz.com</a> (Drac 5:00, Grubs 8:00, Herald 15:00, Baró 20:00); comprova-ho si el 26.23 els ha canviat.</div>
  </div>`;
}
function phasePlanDiscord(p) {
  let t = `\n🗺️ **PLA PER FASES:**\n`;
  p.phases.forEach(f => { t += `• **${f.time} — ${f.title}:** ${f.text}\n`; });
  t += `🏆 **Win conditions:** ${p.winConds.join(' | ')}\n⚠️ **Com ens poden guanyar:** ${p.loseConds.join(' | ')}\n`;
  return t;
}

