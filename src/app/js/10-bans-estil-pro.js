// ================= BANS ESTIL PRO =================
function recommendBans(ctx) {
  const ours = ctx.ourPicks, enemy = ctx.enemyPicks;
  const info = enemyRoleInfo();
  const phase2 = ours.length + enemy.length > 0;
  const keyChamps = ROLE_ORDER.map(r => ctx.comp.roles[r][0]);
  const myPool = new Set(ROSTER.flatMap(p => p.pool));
  const eProf = teamProfile(enemy);
  const coveredE = new Set();
  enemy.forEach(c => ROLE_ORDER.forEach((r, i) => { if (info.dist[c] && info.dist[c][i] > 0.5) coveredE.add(r); }));
  const missing = ROLE_ORDER.filter(r => !coveredE.has(r));
  const out = [];
  ALL_CHAMPS.forEach(c => {
    if (ctx.unavailable.has(c) || !CHAMP_DATA[c] || myPool.has(c)) return;
    let score = 0;
    const why = [];
    const add = (p, t) => { score += p; why.push({ pts: p, txt: t }); };
    const bt = bestTier(c), pch = PATCH_CHANGES[c], pub = champRoles(c);
    if (bt) add(Math.round(TIER_PTS[bt] * 0.9), `${bt} al meta`);
    if (pch && pch.delta > 0) add(pch.delta, 'buff al 26.23');
    if (state.enemyOtps.includes(c)) add(16, 'main/OTP conegut del rival');
    const cd = roleDistOfChamp(c);
    ours.forEach(p => {
      if ((LANE_COUNTERS[c] || []).includes(p)) {
        const ov = distOverlap(cd, roleDistOfChamp(p));
        if (ov > 0) add(Math.round(12 * Math.min(1, ov + 0.3)), `counteja el vostre ${p}`);
      }
    });
    keyChamps.forEach(k => {
      if ((LANE_COUNTERS[c] || []).includes(k)) add(phase2 ? 7 : 3, phase2 ? `counteja ${k} (comp objectiu)` : `counteja ${k} (pes reduït: revelaria el pla)`);
    });
    if (pub.length >= 2 && bt) add(3 * (pub.length - 1), `flex (${pub.join('/')}): els treu una opció d'amagar informació`);
    if (phase2) {
      const fills = pub.filter(r => missing.includes(r));
      if (fills.length && bt) add(5, `ompliria el seu ${fills[0]} pendent`);
      if (eProf.n >= 2 && eProf.front === 0 && hasTag(c, 'front')) add(4, 'els donaria la frontline que no tenen');
      if (eProf.n >= 2 && eProf.eng === 0 && hasTag(c, 'eng')) add(3, 'els donaria engage');
      enemy.forEach(e => SYNERGY_PAIRS.forEach(([a, b, w]) => { if ((a === e && b === c) || (b === e && a === c)) add(Math.min(8, w), `sinergia amb el seu ${e}`); }));
    }
    out.push({ champ: c, score, why });
  });
  return out.sort((a, b) => b.score - a.score);
}

