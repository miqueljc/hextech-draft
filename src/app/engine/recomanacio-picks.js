// ---- Recomanació de picks (substitueix l'anterior) ----
function scoreChampions(ctx, excludeIdx) {
  ctx = ctx || buildCtx();
  const slots = getOurPicks();
  const ally = slots.filter((c, i) => c && i !== excludeIdx);
  const allyProf = teamProfile(ally);
  const enemyProf = teamProfile(ctx.enemyPicks);
  const info = enemyRoleInfo();
  const miss = enemyMiss(info, ctx.enemyPicks);
  const open = ourOpenRoles(ally);
  const asg = ally.length ? autoAssign(ally) : null;
  const pos = draftPos();
  const sp = scoutPool();

  const poolUnion = new Map();
  ROSTER.forEach((pl, pi) => pl.pool.forEach(c => { if (!poolUnion.has(c)) poolUnion.set(c, []); poolUnion.get(c).push(pi); }));
  const cands = new Set(poolUnion.keys());
  Object.values(ctx.comp.roles).flat().forEach(c => cands.add(c));
  const covered = new Set();
  ally.forEach(c => champRoles(c).forEach(r => covered.add(r)));
  const baseFeas = ally.length >= 2 ? feasibleCount(ally) : ally.length;
  const baseMatch = maxRoleMatching(ally);

  const out = [];
  cands.forEach(c => {
    if (ctx.unavailable.has(c) || !CHAMP_DATA[c]) return;
    let score = 0;
    const why = [];
    const add = (pts, txt, style) => { if (!pts) return; score += pts; why.push({ pts, txt, style }); };
    const t = tag => hasTag(c, tag);
    const cd = ourDist(c, open);
    const myRole = ROLE_ORDER[cd.indexOf(Math.max(...cd))];

    // Disponibilitat a l'equip
    const who = poolUnion.get(c) || [];
    if (who.length) {
      const names = who.slice(0, 2).map(pi => shortName(pi)).join('/');
      add(16, `al pool de ${names}${who.length > 2 ? '…' : ''}`);
      let bonus = 0, bestP = -1, bestR = -99;
      who.forEach(pi => {
        const pl = ROSTER[pi];
        let b = pl.excelMains.includes(c) ? 8 : 0;
        const h = pl.opggHighlights.find(x => x.champ === c);
        const hasStat = Boolean(champStat(pi, c));
        if (hasStat) b = Math.max(b, Math.round(champRating(pi, c) * 0.7 * formMul(pi)));
        else if (h) b = Math.max(b, Math.round(h.bonus * 0.6));
        if (hasStat && champRating(pi, c) > bestR) { bestR = champRating(pi, c); bestP = pi; }
        bonus = Math.max(bonus, b);
      });
      if (bonus > 0) add(bonus, bestP >= 0 && bestR >= 4 ? `bon historial: ${shortName(bestP)} ${statText(bestP, c)}` : 'main / bon WR real');
      if (bestP >= 0 && bestR <= -6 && who.every(pi => !champStat(pi, c) || champRating(pi, c) <= -6)) add(-8, `historial negatiu: ${shortName(bestP)} ${statText(bestP, c)}`);
      let tb = 0, tp = -1;
      who.forEach(pi => { const v = teamRecBonus(pi, c); if (Math.abs(v) > Math.abs(tb)) { tb = v; tp = pi; } });
      if (tb && tp >= 0) { const r = teamRec(tp, c); add(tb, `en partides de l'equip: ${shortName(tp)} ${r.w}V-${r.l}D`); }
    } else add(-14, 'ningú de l\'equip el té al pool');

    if (Object.values(ctx.comp.roles).some(l => l.includes(c))) add(14, `encaixa a ${ctx.comp.name.split(':')[0]}`);

    // Meta per rol (on el jugaríeu), no el millor rol del campió
    const tf = tierForUs(c, open), bt = bestTier(c);
    if (tf) add(TIER_PTS[tf.t], `${tf.t} a ${tf.role} (meta ${PATCH_META.tierSource || PATCH_META.patch})`);
    const pch = PATCH_CHANGES[c];
    if (pch) add(pch.delta, `${pch.delta > 0 ? 'buff' : 'nerf'} al 26.23`);

    // Draft professional: flex, informació i risc de counter segons l'ordre real
    const k = ally.length, W = PHASE_W[Math.min(k, 4)];
    const myRoles = ourRolesFor(c), pubRoles = champRoles(c);
    if (W > 0) {
      if (myRoles.length >= 2) add(Math.round(W * (4 + 4 * Math.min(myRoles.length - 1, 2))), `flex real (${myRoles.join('/')}): el rival no sap on anirà`);
      else if (myRoles.length === 1 && pubRoles.length <= 1 && W >= 0.5) add(-Math.round(W * 5), `només ${myRoles[0]}: revela rol i jugador massa aviat`);
      if (pubRoles.length >= 2 && myRoles.length < 2) add(Math.round(W * 3), `flex públic (${pubRoles.join('/')})`);
      if (isReactive(c) && myRoles.length < 2 && W >= 0.5) add(-Math.round(W * 5), 'pick reactiu: guarda\'l per respondre al final');
      if (bt === 'S+') add(Math.round(W * 4), 'alta prioritat: neguem el pick al rival');
    }
    const Wb = pos.enemyAfter === 0 ? 0 : Math.max(W, 0.35);
    if (Wb > 0) {
      const thr = counteredBy(c).filter(e => !ctx.unavailable.has(e) && distOverlap(cd.map((x, i) => x * miss[i]), roleDistOfChamp(e)) >= 0.2);
      if (thr.length) add(-Math.round(Wb * Math.min(8, thr.length * 2)), `counterejable: ${thr.slice(0, 3).join(', ')} encara disponibles`);
      else if (tf && (tf.t === 'S+' || tf.t === 'S') && W > 0) add(Math.round(W * 4), 'segur a cegues i fort al parc');
      // Risc concret segons la fitxa del rival
      let risk = 0; const rw = [];
      sp.forEach((s, e) => {
        if (ctx.unavailable.has(e)) return;
        const ri = ROLE_ORDER.indexOf(s.role); if (ri < 0 || miss[ri] < 0.3 || cd[ri] < 0.3) return;
        const m = muScore(c, e); if (m.adv > -3) return;
        risk += (-m.adv) * 1.2 * s.comfort * miss[ri]; rw.push(`${s.who} té ${e} (${m.real ? m.wr + '% per a vosaltres' : 'counter'})`);
      });
      if (risk >= 2) add(-Math.round(Math.min(10, risk)), `risc: ${rw.slice(0, 2).join('; ')}`);
    }
    if (state.enemyOtps.includes(c)) add(8, 'nega el main d\'un rival');
    const sc = sp.get(c);
    if (sc && sc.comfort >= 0.6) add(Math.round(5 * sc.comfort), `nega un pick del pool rival (${scoutText(sc)})`);
    if (state.fearless) { const dp = fearlessDepth(c); if (dp !== Infinity && dp <= 4) add(dp <= 2 ? -8 : -4, `Fearless: només us queden ${dp} campions al pool d'aquest rol`); }
    const feas = who.length && k >= 2 ? feasibleCount([...ally, c]) : null;
    if (feas !== null && feas < baseFeas + 1) add(-10, 'cap jugador el pot jugar sense trencar els altres picks');

    const m2 = maxRoleMatching([...ally, c]);
    if (m2 <= baseMatch) {
      const busy = viableRoles(c).map(r => { const i = ROLE_ORDER.indexOf(r), a = asg && asg.roleChamp[i]; return a ? `${r} (${a})` : r; });
      add(-70, `rol ja cobert: ${busy.join(', ')}; no quedaria rol per a tots els picks`);
    }
    else {
      if (champRoles(c).some(r => !covered.has(r))) add(8, 'cobreix un rol encara per cobrir');
      if (ally.length >= 3 && who.length && feas === baseFeas + 1) add(6, 'omple un rol amb jugador disponible');
    }

    // Sinergies amb els aliats (duos reals primer)
    ally.forEach(a => {
      const s = synScore(a, c); if (!s || s.pts < 1) return;
      const ra = asg ? ROLE_ORDER[asg.roleChamp.indexOf(a)] : null;
      const pair = [ra, myRole].sort().join('+');
      const lane = (pair === 'Bot+Sup' || ra === 'Jg' || myRole === 'Jg') ? 1 : 0.6;
      const pts = Math.min(12, Math.round(s.pts * 2 * lane));
      if (pts >= 2) add(pts, s.real ? `sinergia real amb ${a}: ${s.wr}% en ${s.g} partides` : `parella amb sinergia amb ${a}`, 'own');
    });
    ctx.enemyPicks.forEach(e => { const s = synScore(e, c); if (s && s.real && s.pts >= 2) add(Math.min(5, Math.round(s.pts * 0.8)), `els treu la sinergia amb ${e} (${s.wr}%)`); });

    // Necessitats del draft aliat
    if (allyProf.front === 0 && t('front')) add(10, 'aporta la frontline que falta');
    if (allyProf.front >= 3 && t('front')) add(-5, 'ja teniu prou frontline');
    if (allyProf.eng === 0 && t('eng')) add(8, 'aporta engage');
    if (allyProf.peel === 0 && allyProf.n >= 3 && t('peel')) add(5, 'aporta peel pel carry');
    if (allyProf.eng >= 1 && t('combo')) add(4, 'combo AoE amb el vostre engage');
    if (allyProf.ad >= 2 && allyProf.ap === 0 && t('ap')) add(8, 'equilibra el dany (falta AP)');
    if (allyProf.ap >= 2 && allyProf.ad === 0 && t('ad')) add(8, 'equilibra el dany (falta AD)');
    if (allyProf.ad >= 3 && allyProf.ap === 0 && t('ad') && !t('ap')) add(-8, 'massa dany AD');
    if (allyProf.ap >= 3 && allyProf.ad === 0 && t('ap') && !t('ad')) add(-8, 'massa dany AP');

    // Matchups reals contra els picks rivals (una sola font: WR real si n'hi ha)
    const lateMul = k >= 3 ? 1.4 : 1;
    ctx.enemyPicks.forEach(e => {
      const ov = distOverlap(cd, info.dist[e] || roleDistOfChamp(e));
      if (ov < 0.15) return;
      const m = muScore(c, e);
      if (Math.abs(m.adv) < 1.5) return;
      const cond = ov < 0.9 ? ` (si coincideixen de rol, ${Math.round(ov * 100)}%)` : '';
      const pts = Math.min(22, Math.max(3, Math.round(Math.abs(m.adv) * 2.6 * ov * lateMul)));
      if (m.adv > 0) add(pts, `guanya ${e} a la línia (${muText(m)})${cond}`, 'vs');
      else add(-pts, `${e} el counteja (${muText(m)})${cond}`);
    });

    // Identitat de l'equip rival
    if (enemyProf.dive + enemyProf.assn >= 2) { if (t('peel')) add(6, 'peel contra el seu dive/assassins'); if (t('front')) add(4, 'absorbeix el seu dive'); }
    if (enemyProf.poke >= 2) { if (t('eng')) add(8, 'engage contra el seu poke'); if (t('dive')) add(4, 'dive contra el seu poke'); if (t('poke') && !t('eng')) add(-4, 'perd el duel de poke'); }
    if (enemyProf.eng >= 2) { if (t('peel')) add(6, 'peel contra el seu engage'); if (t('mob')) add(3, 'mobilitat per esquivar el seu engage'); }
    if (enemyProf.n >= 3 && enemyProf.mob <= 1) { if (t('eng')) add(5, 'rival sense mobilitat: engage'); if (t('combo')) add(5, 'rival sense mobilitat: combo AoE'); }
    if (enemyProf.n >= 3 && enemyProf.front === 0) { if (t('dive') || t('assn')) add(5, 'rival sense frontline: accés al backline'); }

    styleRules(c, ally, allyProf, enemyProf, add);
    styleRules2(c, ally, allyProf, enemyProf, add);
    out.push({ champ: c, score, why });
  });
  return out.sort((a, b) => b.score - a.score);
}
// Recomanació de picks: puntuació base (motor amb winrates reals) + OP del parc i counters del pool + parelles de l'historial
function recommendChamps(ctx, excludeIdx) {
  ctx = ctx || buildCtx();
  const out = scoreChampions(ctx, excludeIdx);
  addOpAndCounterBonus(out, ctx, excludeIdx);
  addDuoHistoryBonus(out, excludeIdx);
  return out;
}
