// ================= PREDICCIÓ DE PICKS DEL RIVAL =================
function predictEnemy(ctx) {
  const enemy = ctx.enemyPicks, ours = ctx.ourPicks;
  const eSide = state.ourSide === 'BLUE' ? 'RED' : 'BLUE';
  const unavailable = getUnavailableChamps(eSide);
  const eProf = teamProfile(enemy);
  const baseCover = maxRoleMatching(enemy);
  const out = [];
  ALL_CHAMPS.forEach(c => {
    if (unavailable.has(c) || !CHAMP_DATA[c]) return;
    let score = 0;
    const why = [];
    const add = (p, t) => { score += p; why.push({ pts: p, txt: t }); };
    const bt = bestTier(c), pch = PATCH_CHANGES[c];
    if (bt) add(TIER_PTS[bt], `${bt} al meta`);
    if (pch) add(pch.delta, pch.delta > 0 ? 'buff al 26.23' : 'nerf al 26.23');
    if (state.enemyOtps.includes(c)) add(12, 'main conegut del rival');
    const cd = roleDistOfChamp(c);
    ours.forEach(p => {
      if ((LANE_COUNTERS[c] || []).includes(p)) {
        const ov = distOverlap(cd, roleDistOfChamp(p));
        if (ov > 0.1) add(Math.round(9 * Math.min(1, ov + 0.3)), `counteja el vostre ${p}`);
      }
    });
    if (maxRoleMatching([...enemy, c]) > baseCover) add(5, 'cobreix un rol seu pendent');
    else if (enemy.length >= 1) add(-20, 'no els cabria en cap rol');
    if (eProf.n >= 2) {
      if (eProf.front === 0 && hasTag(c, 'front')) add(6, 'els falta frontline');
      if (eProf.eng === 0 && hasTag(c, 'eng')) add(4, 'els falta engage');
      if (eProf.ap === 0 && hasTag(c, 'ap')) add(5, 'els falta dany AP');
      if (eProf.ad === 0 && hasTag(c, 'ad')) add(5, 'els falta dany AD');
    }
    enemy.forEach(e => SYNERGY_PAIRS.forEach(([a, b, w]) => { if ((a === e && b === c) || (b === e && a === c)) add(Math.min(8, w), `sinergia amb ${e}`); }));
    if (champRoles(c).length >= 2) add(2, 'flex');
    out.push({ champ: c, score, why });
  });
  out.sort((a, b) => b.score - a.score);
  const top = out.slice(0, 12);
  const z = top.reduce((s, x) => s + Math.exp(x.score / 7), 0);
  top.forEach(x => { x.prob = Math.exp(x.score / 7) / z; });
  return top;
}
function ourAnswersTo(enemyChamp, ctx) {
  const pool = [...new Set(ROSTER.flatMap(p => p.pool))];
  return pool.filter(c => !ctx.unavailable.has(c) && (LANE_COUNTERS[c] || []).includes(enemyChamp)).slice(0, 2);
}
function predictionHtml(ctx, max = 4) {
  const pr = predictEnemy(ctx).slice(0, max);
  if (!pr.length) return '';
  const line = pr.map(x => {
    const ans = ourAnswersTo(x.champ, ctx);
    return `<strong>${escapeHtml(x.champ)}</strong> ${Math.round(x.prob * 100)}%${ans.length ? ` <span style="color:var(--text-muted);">(guardeu ${ans.map(escapeHtml).join('/')})</span>` : ''}`;
  }).join(' · ');
  return `<br><span style="color:var(--gold);">🔮 Pròxim pick rival més probable:</span> ${line}`;
}

