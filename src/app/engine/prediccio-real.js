// ---- Predicció del rival ----
function predictEnemy(ctx) {
  const enemy = ctx.enemyPicks, ours = ctx.ourPicks;
  const eSide = state.ourSide === 'BLUE' ? 'RED' : 'BLUE';
  const unavailable = getUnavailableChamps(eSide);
  const eProf = teamProfile(enemy), info = enemyRoleInfo(), miss = enemyMiss(info, enemy), sp = scoutPool();
  const baseCover = maxRoleMatching(enemy);
  const out = [];
  ALL_CHAMPS.forEach(c => {
    if (unavailable.has(c) || !CHAMP_DATA[c]) return;
    let score = 0;
    const why = [];
    const add = (p, t) => { if (!p) return; score += p; why.push({ pts: p, txt: t }); };
    const sh = roleDistOfChamp(c), pch = PATCH_CHANGES[c];
    const te = tierExpected(c, sh, miss);
    if (te.pts > 0 && te.best) add(Math.round(te.pts), `${te.best.t} a ${te.best.role} (meta)`);
    if (pch) add(pch.delta, pch.delta > 0 ? 'buff al 26.23' : 'nerf al 26.23');
    if (enemy.length >= 1) { if (te.fit < 0.08) add(-14, 'no li queda cap rol on es jugui'); else add(Math.round(6 * Math.min(1, te.fit * 1.4)), 'encaixa en un rol que els falta'); }
    if (state.enemyOtps.includes(c)) add(12, 'main conegut del rival');
    const sc = sp.get(c);
    if (sc) { const ri = ROLE_ORDER.indexOf(sc.role); add(Math.round(14 * sc.comfort * (0.25 + 0.75 * (miss[ri] || 0))), `pool de ${scoutText(sc)}`); }
    ours.forEach(p => {
      const m = muScore(c, p), ov = distOverlap(sh, ourDistPicked(p));
      if (m.adv >= 2 && ov > 0.1) add(Math.round(m.adv * 1.6 * Math.min(1, ov + 0.3)), `counteja el vostre ${p}`);
    });
    if (enemy.length >= 1 && maxRoleMatching([...enemy, c]) <= baseCover) add(-10, 'no els cabria en cap rol natural');
    if (eProf.n >= 2) {
      if (eProf.front === 0 && hasTag(c, 'front')) add(6, 'els falta frontline');
      if (eProf.eng === 0 && hasTag(c, 'eng')) add(4, 'els falta engage');
      if (eProf.ap === 0 && hasTag(c, 'ap')) add(5, 'els falta dany AP');
      if (eProf.ad === 0 && hasTag(c, 'ad')) add(5, 'els falta dany AD');
    }
    enemy.forEach(e => { const s = synScore(e, c); if (s && s.pts >= 1) add(Math.min(8, Math.round(s.pts * 1.5)), `sinergia amb ${e}`); });
    if (!enemy.length && champRoles(c).length >= 2) add(2, 'flex');
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
  return pool.filter(c => !ctx.unavailable.has(c)).map(c => ({ c, a: muScore(c, enemyChamp).adv })).filter(x => x.a >= 2.5 && distOverlap(roleDistOfChamp(x.c), roleDistOfChamp(enemyChamp)) > 0.15).sort((a, b) => b.a - a.a).slice(0, 2).map(x => x.c);
}

