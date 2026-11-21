// ===== Pla de partida detallat =====
function wNames(list) { return list.length ? list.join(', ') : '—'; }
function compIdentity(P) {
  if (!P.n) return { id: 'pendent', txt: 'pendent' };
  const s = [['engage', P.eng * 1.2 + P.combo], ['pick', (P.assn + P.dive) * 0.8 + (P.eng && P.mob ? 0.5 : 0)], ['protegir el carry', P.peel * 1.1 + (P.scale && P.rng ? 0.5 : 0)], ['poke i setge', P.poke * 1.3], ['split', P.split * 1.2]].sort((a, b) => b[1] - a[1]);
  return { id: s[0][0], second: s[1][1] >= 2 ? s[1][0] : null };
}
function engagersOf(lanes) {
  const pr = { Sup: 0, Jg: 1, Top: 2, Mid: 3, Bot: 4 };
  return lanes.filter(l => l.champ && hasTag(l.champ, 'eng')).sort((a, b) => (hasTag(b.champ, 'front') - hasTag(a.champ, 'front')) || pr[a.role] - pr[b.role]).map(l => l.champ);
}
function mainCarry(lanes) {
  const score = l => !l.champ ? -9 : (hasTag(l.champ, 'scale') ? 2 : 0) + (hasTag(l.champ, 'rng') ? 1.5 : 0) + (l.role === 'Bot' ? 1.5 : l.role === 'Mid' ? 1 : 0) - (hasTag(l.champ, 'front') ? 3 : 0) - (l.role === 'Sup' ? 4 : 0);
  return lanes.slice().sort((a, b) => score(b) - score(a))[0];
}
function enemyCarry(list) {
  let info = null; try { info = enemyRoleInfo(); } catch (e) {}
  const roleW = c => info && info.dist && info.dist[c] ? info.dist[c][3] * 2 + info.dist[c][2] * 1 : 0;
  const sc = c => roleW(c) + (hasTag(c, 'scale') ? 2 : 0) + (hasTag(c, 'rng') ? 1.5 : 0) - (hasTag(c, 'front') ? 3 : 0) + (hasTag(c, 'assn') ? 0.5 : 0) - (['TS', 'EN'].includes((ARCH[c] || {}).code) ? 3 : 0);
  return list.slice().sort((a, b) => sc(b) - sc(a))[0];
}
function threatAdvice(e, s, carry) {
  const A = s.A, ours = s.lanes.filter(l => l.champ);
  const peelers = ours.filter(l => hasTag(l.champ, 'peel')).map(l => l.champ);
  const engagers = ours.filter(l => hasTag(l.champ, 'eng')).map(l => l.champ);
  const c = carry && carry.champ;
  const out = [];
  if (hasTag(e, 'assn')) out.push(`assassí: ${c ? c + ' ha de jugar darrere la frontline i amb Flash disponible' : 'el carry no pot anar sol'}; ${peelers.length ? peelers.join('/') + ' guarda el CC per quan entri' : 'sense peel: ward als flancs i agrupeu-vos'}. Si apareix a una línia sense visió, retireu-vos.`);
  else if (hasTag(e, 'dive')) out.push(`dive: no us separeu del grup; ${peelers.length ? peelers.join('/') + ' el castiga quan salti' : 'feu-li focus quan entri, no abans'}.`);
  if (hasTag(e, 'eng')) out.push(`engage: respecteu-ne el rang i no us agrupeu en passadissos estrets; ${engagers.length ? 'si falla la iniciació, ' + engagers.join('/') + ' contraataca' : 'castigueu-lo quan hagi gastat la iniciació'}.`);
  if (hasTag(e, 'poke')) out.push(`poke: no seieu a l'objectiu esperant; ${engagers.length ? 'forceu la lluita amb ' + engagers.join('/') + ' abans que us desgasti' : 'netegeu l\'onada i rotau abans que us desgasti'}.`);
  if (hasTag(e, 'split')) out.push(`split: ${ours.find(l => l.role === 'Top') ? ours.find(l => l.role === 'Top').champ + ' el contesta a la línia lateral' : 'responeu-hi amb un sol jugador'} mentre els altres 4 forcen un objectiu al costat contrari.`);
  if (hasTag(e, 'scale') && !hasTag(e, 'front')) out.push(`escala: cada minut el fa més perillós; treu-li or amb ganks i invasions abans dels seus 3 objectes.`);
  if (hasTag(e, 'front') && !out.length) out.push(`frontline: no gasteu els cooldowns en ell; esquiveu-lo i aneu al dany del darrere.`);
  if (!out.length) out.push('vigileu-ne els timings forts i jugueu al voltant del seu cooldown principal.');
  return out.join(' ').replace(/\.+$/, '');
}
function objectivePlan(s) {
  const L = Object.fromEntries(s.lanes.map(l => [l.role, l]));
  const v = r => L[r] ? L[r].verdict : 'unknown', pts = r => v(r) === 'good' ? 1 : v(r) === 'bad' ? -1 : 0;
  const bot = pts('Bot') + pts('Sup') * 0.5 + pts('Mid') * 0.5, top = pts('Top') + pts('Mid') * 0.5;
  const scaleDiff = s.A.scale - s.B.scale, earlyDiff = s.A.early - s.B.early;
  const items = [];
  if (bot > top + 0.4) items.push('Prioritat al costat del Drac: la vostra línia inferior guanya; el jungla comença dalt i acaba a baix per arribar al primer Drac (5:00) amb prioritat. Cediu els Grubs si cal.');
  else if (top > bot + 0.4) items.push('Prioritat al costat de Grubs/Herald: el top guanya; jugueu els Grubs (8:00) i el Herald (15:00) i cediu el primer Drac si el bot no té prioritat.');
  else items.push('Cap costat clarament guanyador: decideix el jungla segons on hi hagi prioritat a cada moment; no forceu objectius en desavantatge numèric.');
  if (scaleDiff >= 1) items.push('Dracs: jugueu per l\'ànima a llarg termini; no cal guanyar cada Drac early si us costa morts.');
  else if (scaleDiff <= -1) items.push('Dracs i torres: necessiteu convertir cada avantatge en estructures abans del 25:00; el Baró (20:00) és el vostre objectiu per tancar.');
  if (earlyDiff >= 1) items.push('Invasió o contra-jungla possible al nivell 1-3 si les línies us acompanyen (més early que ells).');
  if (earlyDiff <= -1) items.push('No inicieu baralles de nivell 1-3: ward a la jungla pròpia i jugueu a contrarestar el jungla rival.');
  return items;
}
function teamfightPlan(s) {
  const lanes = s.lanes.filter(l => l.champ), B = s.B;
  const carry = mainCarry(s.lanes), eCarry = enemyCarry(B.list);
  const eng = engagersOf(lanes);
  const follow = lanes.filter(l => hasTag(l.champ, 'combo') && !eng.includes(l.champ)).map(l => l.champ);
  const peel = lanes.filter(l => hasTag(l.champ, 'peel')).map(l => l.champ);
  const diveUs = lanes.filter(l => hasTag(l.champ, 'dive') || hasTag(l.champ, 'assn')).map(l => l.champ);
  const front = lanes.filter(l => hasTag(l.champ, 'front')).map(l => l.champ);
  const eFront = B.list.filter(c => hasTag(c, 'front')), eThreat = B.list.filter(c => hasTag(c, 'assn') || hasTag(c, 'dive'));
  const id = compIdentity(s.A), eid = compIdentity(B);
  const pts = [];
  const de = x => (/^[aeiouh]/i.test(x) ? "d'" : 'de ') + x;
  pts.push(`Identitat: la vostra comp és ${de(id.id)}${id.second ? ' (amb opció ' + de(id.second) + ')' : ''}; la rival és ${de(eid.id)}${eid.second ? ' (i ' + eid.second + ')' : ''}.`);
  if (eng.length) pts.push(`Qui inicia: ${eng.slice(0, 2).join(' o ')}${eng.length > 2 ? ' (' + eng.slice(2).join('/') + ' encadenen el CC després)' : ''}${follow.length ? ', i ' + follow.join('/') + ' segueix amb el dany en àrea' : ''}. Inicieu quan ${eCarry ? eCarry : 'el seu carry'} estigui a l'abast o quan hagin gastat Flash.`);
  else pts.push(`No teniu iniciació clara: lluiteu a la defensiva, deixeu que entrin ells i contraataqueu${peel.length ? ' amb el peel de ' + peel.join('/') : ''}.`);
  if (carry && carry.champ) pts.push(`El vostre carry és ${carry.champ}: ${front.length ? 'juga darrere ' + front.join('/') : 'sense frontline, juga al límit del rang'}${peel.length ? ' i ' + peel.join('/') + ' es queda al seu costat' : ''}. Si mor ell, la lluita està perduda: no el feu entrar primer.`);
  if (eCarry) {
    const reach = diveUs.length || eFront.length === 0;
    pts.push(`Focus: ${reach ? `${eCarry} és l'objectiu (${diveUs.length ? diveUs.join('/') + ' hi pot arribar' : 'no té frontline que el tapi'})` : `pegueu al que tingueu més a prop (${eFront.join('/')} fan de mur); ${eCarry} només si queda exposat`}.`);
  }
  if (eThreat.length) pts.push(`Amenaça al vostre backline: ${eThreat.join(', ')}. Guardeu ${peel.length ? 'el CC de ' + peel.join('/') : 'Flash i el CC'} per quan entrin, no per iniciar.`);
  if (s.A.front - B.front >= 2) pts.push('Teniu més frontline: lluites llargues front-to-back us afavoreixen.');
  else if (B.front - s.A.front >= 2) pts.push('Ells tenen més frontline: eviteu lluites llargues de cara; busqueu flancs, picks o lluitar quan el seu tanc no hi sigui.');
  return pts;
}
function laneDetail(l, s) {
  if (!l.champ) return null;
  const info = enemyRoleInfo(), i = ROLE_ORDER.indexOf(l.role);
  const opps = info.champs.map(e => ({ e, p: info.dist[e][i] })).filter(x => x.p >= 0.3).sort((a, b) => b.p - a.p);
  const bits = [];
  if (l.role === 'Jg') {
    const ej = opps[0] && opps[0].e;
    bits.push(ej ? `${ej} és el jungla rival${hasTag(ej, 'early') ? ' (fort early: no l\'enfrontis als nivells 2-4 sense línies amb prioritat)' : ''}${!hasTag(ej, 'early') && hasTag(l.champ, 'early') ? '; tu ets més fort early: invadeix si les línies t\'acompanyen' : ''}.` : 'Jungla rival per confirmar.');
    if (l.build && l.build.notes && /^Ruta:/.test(l.build.notes[0])) bits.push(l.build.notes[0]);
  } else opps.slice(0, 2).forEach(o => {
    const m = muScore(l.champ, o.e);
    const pre = opps.length > 1 ? `Si et toca ${o.e}: ` : `Contra ${o.e}: `;
    let t = m.real ? `${m.wr}% de victòries en ${m.g} partides reals` : m.adv !== 0 ? 'sense prou partides reals; segons les llistes de counters' : 'sense dades del matchup';
    t += m.adv >= 2 ? ' — favorable: juga agressiu als nivells 2-3 i força el teu pic.' : m.adv <= -2 ? ' — difícil: farmeja segur, demana visió i espera el jungla o el teu pic d\'objectes.' : ' — igualat: el control d\'onades i el jungla decideixen.';
    if (m.adv < 2 && hasTag(o.e, 'early') && !hasTag(l.champ, 'early')) t += ` ${o.e} és fort early: no acceptis intercanvis llargs fins al teu primer objecte.`;
    if (m.adv > -2 && hasTag(l.champ, 'early') && !hasTag(o.e, 'early')) t += ` Tu ets més fort early: castiga'l abans que escali.`;
    bits.push(pre + t);
  });
  const b = l.build;
  if (b && b.order && b.order[0]) bits.push(`Pic de poder: ${b.order[0].item}${b.order[1] ? ' + ' + b.order[1].item : ''}.`);
  return bits.join(' ');
}
function roleJob(l, s, carry, eng) {
  const c = l.champ; if (!c) return '';
  if (carry && l === carry) return 'Teamfight: ets el dany principal; posa\'t on puguis pegar sense ser el primer objectiu.';
  if (hasTag(c, 'eng') && eng && eng.indexOf(c) >= 2) return `Teamfight: no inicies tu; encadena el teu CC just després de ${eng.slice(0, 2).join(' o ')}.`;
  if (hasTag(c, 'eng')) return 'Teamfight: tu decideixes quan es lluita; comunica abans d\'iniciar (cooldowns i Flash rivals).';
  if (hasTag(c, 'peel')) return `Teamfight: queda't amb ${carry && carry.champ ? carry.champ : 'el carry'} i fes servir el CC contra qui l'ataqui.`;
  if (hasTag(c, 'assn') || hasTag(c, 'dive')) return `Teamfight: entra després de l'iniciació, pel flanc, i busca ${enemyCarry(s.B.list) || 'el seu carry'}.`;
  if (hasTag(c, 'split')) return 'Mid game: pressiona la línia lateral i només uneix-te a la lluita amb TP o quan l\'objectiu estigui decidit.';
  if (hasTag(c, 'front')) return 'Teamfight: fes de mur davant el teu carry i absorbeix els cooldowns rivals.';
  return 'Teamfight: segueix l\'iniciació i aporta el dany des de la segona línia.';
}
// Frase de la comp de referència només si no anomena campions que no teniu
function onlyOurChamps(t, ours) {
  if (!t) return '';
  const esc = c => c.replace(/[.*+?^${}()|[\]\\']/g, '.');
  return String(t).split(/(?<=\.)\s+/).filter(sen => !ALL_CHAMPS.some(c => c.length > 2 && !ours.has(c) && new RegExp('\\b' + esc(c) + '\\b').test(sen))).join(' ');
}
function compLineFor(s, l) {
  return onlyOurChamps((s.comp.plan.individual || {})[l.role] || '', new Set(s.lanes.map(z => z.champ).filter(Boolean)));
}
function groupedThreats(s, carry) {
  const by = new Map();
  s.B.list.forEach(e => { const t = threatAdvice(e, s, carry); if (!by.has(t)) by.set(t, []); by.get(t).push(e); });
  const score = list => list.reduce((a, e) => a + (hasTag(e, 'assn') ? 3 : 0) + (hasTag(e, 'eng') ? 2 : 0) + (hasTag(e, 'dive') ? 2 : 0) + (hasTag(e, 'poke') ? 1 : 0) + (hasTag(e, 'scale') ? 1 : 0), 0);
  return [...by.entries()].sort((a, b) => score(b[1]) - score(a[1])).map(([t, list]) => ({ champ: list.join(', '), txt: escapeHtml(t) }));
}
function buildStrategy() {
  const s = analyzeDraft();
  try {
    const carry = mainCarry(s.lanes);
    s.deep = { tf: teamfightPlan(s), obj: objectivePlan(s), lanes: s.lanes.map(l => ({ l, txt: laneDetail(l, s), job: roleJob(l, s, carry, engagersOf(s.lanes)) })).filter(x => x.txt), carry };
    s.threats = groupedThreats(s, carry);
    const ours = new Set(s.lanes.map(z => z.champ).filter(Boolean));
    const pl = s.comp.plan || {};
    s.comp = { ...s.comp, plan: { ...pl, early: onlyOurChamps(pl.early, ours) || '—', mid: onlyOurChamps(pl.mid, ours) || '—', late: onlyOurChamps(pl.late, ours) || '—' } };
    s.individual = s.lanes.map(l => {
      const d = s.deep.lanes.find(x => x.l === l);
      return { role: l.role, lane: l, text: [d ? d.txt : '', d ? d.job : '', compLineFor(s, l)].filter(Boolean).join(' ') };
    });
  } catch (e) { console.warn('deepPlan', e); }
  return s;
}
function deepPlanHtml(s) {
  if (!s.deep) return '';
  return `<div class="strat-card" data-keep-open="1" style="grid-column: 1 / -1;">
    <h4>📋 Com jugar aquesta partida</h4>
    <div class="dp-grid">
      <div><strong>Teamfights</strong><ul>${s.deep.tf.map(t => `<li>${escapeHtml(t)}</li>`).join('')}</ul></div>
      <div><strong>Objectius</strong><ul>${s.deep.obj.map(t => `<li>${escapeHtml(t)}</li>`).join('')}</ul></div>
    </div>
    <p class="dp-src">Els winrates de línia són de partides reals (Metabot, Emerald+). La resta són regles a partir de les etiquetes dels campions; feu-les servir com a punt de partida, no com a veritat absoluta.</p>
  </div>`;
}
const _copyDiscordPlanBaseW = typeof copyDiscordPlan === 'function' ? copyDiscordPlan : null;
(function wStyles() {
  const css = `.dp-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; font-size:0.8rem; }
  .dp-grid ul { margin:4px 0 0 18px; padding:0; line-height:1.45; }
  .dp-grid li { margin-bottom:4px; }
  .dp-src { color:var(--text-muted); font-size:0.72rem; margin-top:6px; }
  @media (max-width: 700px) { .dp-grid { grid-template-columns:1fr; } }`;
  try { const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st); } catch (e) {}
})();

