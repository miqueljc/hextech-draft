// ---- Bans ----
function recommendBans(ctx) {
  const ours = ctx.ourPicks, enemy = ctx.enemyPicks;
  const info = enemyRoleInfo(), miss = enemyMiss(info, enemy);
  const phase2 = ours.length + enemy.length > 0;
  const keyChamps = ROLE_ORDER.map(r => ctx.comp.roles[r][0]);
  const myPool = new Set(ROSTER.flatMap(p => p.pool));
  const eProf = teamProfile(enemy), sp = scoutPool();
  let ourTop = [];
  try { ourTop = recommendChamps(ctx, -1).slice(0, 4).map(r => r.champ); } catch (e) {}
  const out = [];
  ALL_CHAMPS.forEach(c => {
    if (ctx.unavailable.has(c) || !CHAMP_DATA[c] || myPool.has(c)) return;
    let score = 0;
    const why = [];
    const add = (p, t) => { if (!p) return; score += p; why.push({ pts: p, txt: t }); };
    const sh = roleDistOfChamp(c), pch = PATCH_CHANGES[c], pub = champRoles(c);
    const te = tierExpected(c, sh, enemy.length ? miss : [1, 1, 1, 1, 1]);
    const fitF = enemy.length ? 0.3 + 0.7 * Math.min(1, te.fit * 1.4) : 1;
    if (te.pts > 0 && te.best) add(Math.round(te.pts * 0.9 * fitF), `${te.best.t} a ${te.best.role} (meta)`);
    if (enemy.length >= 1 && te.fit < 0.08) add(-12, 'el rival ja té cobert el seu rol');
    if (pch && pch.delta > 0) add(Math.round(pch.delta * fitF), 'buff al 26.23');
    if (state.enemyOtps.includes(c)) add(Math.round(16 * fitF), 'main/OTP conegut del rival');
    const sc = sp.get(c);
    if (sc) { const ri = ROLE_ORDER.indexOf(sc.role), f = enemy.length ? 0.15 + 0.85 * (miss[ri] || 0) : 1; add(Math.round(15 * sc.comfort * f), `pool rival (${scoutText(sc)})`); }
    ours.forEach(p => {
      const m = muScore(c, p), ov = distOverlap(sh, ourDistPicked(p));
      if (m.adv >= 2 && ov > 0.1) add(Math.round(m.adv * 2.2 * Math.min(1, ov + 0.3)), `counteja el vostre ${p} (${muText(m)})`);
    });
    ourTop.filter(x => !ours.includes(x)).forEach(x => {
      const m = muScore(c, x);
      if (m.adv >= 2.5 && distOverlap(sh, roleDistOfChamp(x)) > 0.1) add(Math.round(m.adv * (phase2 ? 1.3 : 0.6)), `counteja ${x}, candidat vostre`);
    });
    keyChamps.forEach(x => { const m = muScore(c, x); if (m.adv >= 2.5 && !ourTop.includes(x)) add(phase2 ? 4 : 2, `counteja ${x} (comp objectiu)`); });
    if (!enemy.length && pub.length >= 2 && te.pts) add(3 * (pub.length - 1), `flex (${pub.join('/')}): els treu una opció d'amagar informació`);
    if (phase2 && enemy.length) {
      if (eProf.n >= 2 && eProf.front === 0 && hasTag(c, 'front') && te.fit >= 0.15) add(4, 'els donaria la frontline que no tenen');
      if (eProf.n >= 2 && eProf.eng === 0 && hasTag(c, 'eng') && te.fit >= 0.15) add(3, 'els donaria engage');
      enemy.forEach(e => { const s = synScore(e, c); if (s && s.pts >= 1 && te.fit >= 0.1) add(Math.min(8, Math.round(s.pts * 1.5)), s.real ? `sinergia real amb el seu ${e} (${s.wr}%)` : `sinergia amb el seu ${e}`); });
    }
    out.push({ champ: c, score, why });
  });
  return out.sort((a, b) => b.score - a.score);
}

