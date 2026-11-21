// ================= ANÀLISI DE MATCHUP (amb rols assignats) =================

function analyzeDraft() {
  const ranked = evaluateComps();
  const comp = pickComp(ranked);
  const asg = getAssignment();
  const info = enemyRoleInfo();
  const ourPicks = getOurPicks().filter(Boolean);
  const enemyPicks = getEnemyPicks().filter(Boolean);
  const A = teamProfile(ourPicks);
  const B = teamProfile(enemyPicks);
  const unassigned = ourPicks.filter(c => !asg.roleChamp.includes(c));

  const lanes = ROLE_ORDER.map((role, r) => {
    const pl = ROSTER[asg.rolePlayer[r]];
    const c = asg.roleChamp[r];
    const cands = info.champs.map(e => ({ champ: e, prob: info.dist[e][r] })).filter(x => x.prob > 0.001).sort((a, b) => b.prob - a.prob);
    const mass = cands.reduce((s, x) => s + x.prob, 0);
    let verdict = 'unknown', notes = [], score = 0;
    if (c && mass > 0) {
      const parts = [];
      cands.forEach(x => {
        const m = laneMatchup(c, x.champ, role);
        score += m.score * x.prob / mass;
        m.notes.forEach(n => parts.push(x.prob < 0.999 ? `${n} (${Math.round(x.prob * 100)}%)` : n));
      });
      notes = [...new Set(parts)];
      verdict = score >= 1.5 ? 'good' : score <= -1.5 ? 'bad' : 'even';
    }
    const pIdx = asg.rolePlayer[r];
    if (c && champStat(pIdx, c)) notes = [...notes, `historial ${shortName(pIdx)}: ${statText(pIdx, c)}`];
    const enemyText = cands.length
      ? cands.map(x => x.prob >= 0.999 ? x.champ : `${x.champ} ${Math.round(x.prob * 100)}%`).join(' / ')
      : '—';
    const flags = [];
    if (!playsRole(asg.rolePlayer[r], role)) flags.push(`${pl.name.split('#')[0]} juga fora de rol (${pl.role})`);
    if (c && !champRoles(c).includes(role)) flags.push(`${c} no és habitual de ${role}`);
    if (c && !poolOf(asg.rolePlayer[r], role).includes(c)) flags.push(`${c} fora del pool de ${pl.name.split('#')[0]}`);
    if (c && champStat(asg.rolePlayer[r], c) && champRating(asg.rolePlayer[r], c) <= -6) flags.push(`historial dolent de ${pl.name.split('#')[0]} amb ${c} (${statText(asg.rolePlayer[r], c)})`);
    if (playerSlump(asg.rolePlayer[r])) flags.push(`${pl.name.split('#')[0]} en mala ratxa (${pl.recent}% últimes 20): jugueu-li un pick de comfort i protegiu la seva línia`);
    let tip;
    if (verdict === 'good') tip = 'Aprofita la línia: demana prioritat i busca jugades agressives als nivells 2-3 i 6.';
    else if (verdict === 'bad') tip = 'Joc segur: farmeja, ward profund i demana ajuda al jungla; no forcis duels 1v1.';
    else if (verdict === 'even') tip = 'Línia igualada: guanya amb control d\'ones i suport de l\'equip.';
    else tip = !c ? 'Cap campió assignat a aquest rol.' : 'Rival per determinar: reavalua quan el tingueu.';
    if (cands.length > 1 && mass > 0) tip += ` Rival incert (${enemyText}): confirma qui t'arriba abans de fer jugades.`;
    return { role, player: pl, champ: c, enemyText, verdict, notes, flags, tip, uncertain: cands.length > 1 };
  });

  const metrics = [
    ['Frontline', 'front'], ['Engage', 'eng'], ['Peel', 'peel'], ['Poke', 'poke'],
    ['Dive / Assassins', p => p.dive + p.assn], ['Mobilitat', 'mob'],
    ['Poder early', 'early'], ['Escalat (late)', 'scale'], ['Splitpush', 'split']
  ].map(([label, k]) => {
    const a = typeof k === 'function' ? k(A) : A[k];
    const b = typeof k === 'function' ? k(B) : B[k];
    return { label, a, b, verdict: a - b >= 1 ? 'good' : a - b <= -1 ? 'bad' : 'even' };
  });

  const namesWith = (champs, tag) => champs.filter(c => hasTag(c, tag));
  const fmt = arr => arr.length ? arr.join(', ') : '—';
  const complete = A.n === 5 && B.n === 5;

  const earlyDiff = A.early - B.early, scaleDiff = A.scale - B.scale;
  const early = earlyDiff >= 1
    ? `Teniu més pic early (${fmt(namesWith(A.list, 'early'))}) que ells (${fmt(namesWith(B.list, 'early'))}): ataqueu primer, forceu prioritat i objectius primerencs (Herald/Grubs).`
    : earlyDiff <= -1
      ? `El rival és més fort early (${fmt(namesWith(B.list, 'early'))}): jugueu segur, ward profund i cediu objectius petits fins al vostre power spike.`
      : `Early igualat: ningú té un avantatge clar; guanyeu amb visió, cangrejos i prioritat de jungla.`;
  const ourInit = A.eng + A.dive + A.mob, theirInit = B.eng + B.dive + B.mob;
  const mid = ourInit - theirInit >= 2
    ? `Teniu més iniciació i mobilitat que ells: forceu skirmishes i objectius (Drac/Baró) amb visió prèvia.`
    : ourInit - theirInit <= -2
      ? `Ells tenen més iniciació/mobilitat: no us moveu sols fora de visió, agrupeu-vos als objectius i guardeu els CC defensius.`
      : `Mid game equilibrat: l'equip que prepari visió 45 segons abans dels objectius tindrà l'avantatge.`;
  const late = scaleDiff >= 1
    ? `Escaleu millor (${fmt(namesWith(A.list, 'scale'))}): allargueu la partida, eviteu skirmishes innecessaris i protegiu els carries.`
    : scaleDiff <= -1
      ? `El rival escala millor (${fmt(namesWith(B.list, 'scale'))}): heu de tancar abans del minut 25, forçant Dracs, Baró i torres.`
      : `Late game parell: les teamfights decidiran; no inicieu sense CC en cadena.`;

  // Línies que decideixen la partida (segons els veredictes per rol)
  const goodLanes = lanes.filter(l => l.verdict === 'good').map(l => l.role);
  const badLanes = lanes.filter(l => l.verdict === 'bad').map(l => l.role);
  const laneSummary = [];
  if (goodLanes.length) laneSummary.push(`Teniu avantatge a ${goodLanes.join(', ')}: feu-ne servir per generar prioritat i ajudes cap a les altres línies.`);
  if (badLanes.length) laneSummary.push(`Sofriu a ${badLanes.join(', ')}: protegiu aquestes línies amb ganks/visió del jungla i no hi gasteu recursos.`);
  const jgIdx = ROLE_ORDER.indexOf('Jg'), jgChamp = asg.roleChamp[jgIdx];
  if (jgChamp && (goodLanes.length || badLanes.length)) {
    const side = goodLanes.filter(x => x !== 'Jg')[0] || badLanes.filter(x => x !== 'Jg')[0];
    if (side) laneSummary.push(`El jungla (${jgChamp}) hauria de prioritzar ${goodLanes.includes(side) ? side + ' (snowball)' : side + ' (assegurar-la)'}.`);
  }

  const tf = [];
  if (B.poke >= 2 && A.eng < 1) tf.push(`El rival us pot pokejar (${fmt(namesWith(B.list, 'poke'))}) i vosaltres no teniu engage clar: eviteu assetjaments llargs i busqueu fer waveclear + rotar.`);
  if (B.poke >= 2 && A.eng >= 1) tf.push(`Contra el seu poke (${fmt(namesWith(B.list, 'poke'))}) obligueu l'engage de ${fmt(namesWith(A.list, 'eng'))} abans que us desgastin.`);
  if (A.poke >= 2 && B.eng >= 1) tf.push(`El vostre poke és bo però ells tenen engage (${fmt(namesWith(B.list, 'eng'))}): controleu la visió i no us deixeu sorprendre.`);
  if (B.eng >= 2 && A.peel >= 1) tf.push(`Contra el seu engage (${fmt(namesWith(B.list, 'eng'))}) guardeu el peel de ${fmt(namesWith(A.list, 'peel'))} exclusivament pel carry.`);
  if (B.eng >= 2 && A.peel === 0 && A.n >= 3) tf.push(`Sense peel contra el seu engage: no us agrupeu en camp obert ni en passadissos estrets.`);
  if (A.eng >= 2 && B.peel >= 2) tf.push(`El rival té peel (${fmt(namesWith(B.list, 'peel'))}): busqueu picks i flancs; no inicieu sense CC en cadena.`);
  if (A.front - B.front >= 2) tf.push(`La vostra frontline és superior: lluiteu front-to-back i obligueu-los a entrar.`);
  if (B.front - A.front >= 2) tf.push(`El rival té molta més frontline: eviteu front-to-back llargs i busqueu flancs o escalat.`);
  if (B.dive + B.assn >= 3) tf.push(`El rival té molt dive/assassins (${fmt([...namesWith(B.list, 'dive'), ...namesWith(B.list, 'assn')].filter((v, k, a) => a.indexOf(v) === k))}): mantingueu visió als flancs i guardeu Flash/CC pels carries.`);
  if (A.dive + A.assn >= 2 && B.n >= 3 && B.front === 0) tf.push(`El rival no té frontline: aprofiteu el vostre dive per anar directes al backline.`);
  if (B.ap >= 4 && B.ad <= 1) tf.push(`El rival és gairebé tot AP: prioritzeu resistència màgica.`);
  if (B.ad >= 4 && B.ap <= 1) tf.push(`El rival és gairebé tot AD: prioritzeu armadura.`);
  if (A.n >= 4 && (A.ap === 0 || A.ad === 0)) tf.push(`El vostre equip fa quasi un sol tipus de dany: el rival pot stackejar ${A.ap === 0 ? 'armadura' : 'resistència màgica'}.`);
  if (!tf.length) tf.push(`Cap desequilibri clar: guanyeu amb millor visió, timing d'objectius i execució de teamfights.`);

  const win = [];
  if (scaleDiff >= 1 && earlyDiff <= 0) win.push('Sobreviu al mid game i guanya al late.');
  if (earlyDiff >= 1 && scaleDiff <= 0) win.push('Snowball d\'early game: tanqueu abans que ells escalin.');
  if (earlyDiff >= 1 && scaleDiff >= 1) win.push('Teniu bon early i bon late: jugueu a controlar tota la partida.');
  if (A.split > B.split) win.push(`Splitpush amb ${fmt(namesWith(A.list, 'split'))} per crear 1-3-1.`);
  if (A.eng >= 2 && B.mob <= 1 && B.n >= 3) win.push('Rival poc mòbil: una iniciació encertada decideix la teamfight.');
  if (!win.length) win.push('Pla base de la composició seleccionada (veure timings).');

  const prio = [['assn', 'assassí: guardeu peel/visió als flancs'], ['eng', 'engage: no us agrupeu fora de visió, guardeu CC/Flash'],
    ['dive', 'dive: protegiu el backline'], ['poke', 'poke: forceu engage o rotació'], ['split', 'splitpusher: tingueu TP/resposta preparada'],
    ['scale', 'escala: tanqueu la partida abans']];
  const threats = [];
  B.list.forEach(c => {
    const p = prio.find(([tag]) => hasTag(c, tag));
    if (p) threats.push({ champ: c, txt: p[1] });
  });

  // Runes i build per rol segons la composició dels dos equips
  const bctx = makeBuildCtx(ourPicks, enemyPicks);
  lanes.forEach(l => { l.build = l.champ ? adviseBuild(l.champ, l.role, bctx) : null; });

  // Força al meta (tier 26.22) de cada equip, amb els rols assignats / probables
  const metaOur = lanes.reduce((sum, l) => sum + (l.champ ? tierPts(l.champ, l.role) : 0), 0);
  const metaEnemy = Math.round(info.champs.reduce((sum, e) => sum + ROLE_ORDER.reduce((a, role, r) => a + info.dist[e][r] * tierPts(e, role), 0), 0));
  metrics.push({ label: 'Força al meta (tier del parc)', a: metaOur, b: metaEnemy, verdict: metaOur - metaEnemy >= 6 ? 'good' : metaOur - metaEnemy <= -6 ? 'bad' : 'even' });

  const patchNotes = [];
  asg.roleChamp.filter(Boolean).forEach(c => { if (PATCH_CHANGES[c]) patchNotes.push({ champ: c, team: 'nosaltres', ...PATCH_CHANGES[c] }); });
  enemyPicks.forEach(c => { if (PATCH_CHANGES[c]) patchNotes.push({ champ: c, team: 'rival', ...PATCH_CHANGES[c] }); });

  applyLanePlans(lanes, info);
  const individual = lanes.map(l => ({
    role: l.role,
    text: `${comp.plan.individual[l.role] || ''} Davant teu: ${l.enemyText} — ${l.tip}`,
    lane: l
  }));

  const phasePlan = buildPhasePlan({ A, B, lanes, comp, earlyDiff, scaleDiff, ourInit, theirInit, ourPicks, enemyPicks });

  return { phasePlan, comp, A, B, lanes, metrics, patchNotes, early, mid, late, tf, win, laneSummary, threats: threats.slice(0, 5), individual, complete, unassigned, manual: asg.manual, ambiguous: info.ambiguous, enemyCount: info.count };
}

const VERDICT_UI = {
  good: { icon: '✅', color: 'var(--green)', label: 'Avantatge' },
  bad: { icon: '❌', color: '#FF8A9B', label: 'Desavantatge' },
  even: { icon: '➖', color: 'var(--text-muted)', label: 'Igualat' },
  unknown: { icon: '⏳', color: 'var(--text-muted)', label: 'Pendent' }
};





function afterRosterChange() { afterDataChange(); }




