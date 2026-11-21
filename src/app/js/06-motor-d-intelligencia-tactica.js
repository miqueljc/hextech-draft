// ================= MOTOR D'INTEL·LIGÈNCIA TÀCTICA =================
function evaluateComps() {
  const ourPicks = getOurPicks().filter(Boolean);
  const enemyPicks = getEnemyPicks().filter(Boolean);
  const enemyProf = teamProfile(enemyPicks);
  const allBans = [...state.blueBans, ...state.redBans].filter(Boolean);

  return COMPS.map(comp => {
    let score = 50;
    const reasons = [];

    // 1. Encaix dels nostres picks (sense mirar rol ni jugador)
    ourPicks.forEach(pick => {
      if (Object.values(comp.roles).some(list => list.includes(pick))) {
        score += 18;
        reasons.push(`✅ ${pick} encaixa`);
      } else score -= 12;
    });

    // 2. Bonus OP.GG / winrates reals disponibles
    ROSTER.forEach((player, pi) => {
      const roleChamps = ROLE_ORDER.filter(rr => playsRole(pi, rr)).flatMap(rr => (comp.roles[rr] || []).filter(c => poolOf(pi, rr).includes(c)));
      player.opggHighlights.forEach(h => {
        if (roleChamps.includes(h.champ) && !allBans.includes(h.champ)) {
          score += Math.round(h.bonus * 0.5);
          if (!reasons.some(r => r.includes(h.champ))) reasons.push(`🔥 ${h.champ} disponible (${h.wr})`);
        }
      });
    });

    // 3. Opcions banejades / robades
    Object.entries(comp.roles).forEach(([role, champs]) => {
      const available = champs.filter(c => !allBans.includes(c) && !enemyPicks.includes(c));
      if (available.length === 0) {
        score -= 25;
        reasons.push(`⚠️ Sense opcions a ${role}`);
      }
    });

    // 4. Matchup contra el draft rival (campions i arquetips)
    comp.goodAgainst.forEach(g => {
      const r = entryHit(g, enemyProf);
      if (!r.hit) return;
      score += r.kind === 'champ' ? 14 : 10;
      reasons.push(r.kind === 'champ' ? `💪 Forta contra ${g}` : `💪 Forta contra el seu ${g}`);
    });
    comp.badAgainst.forEach(b => {
      const r = entryHit(b, enemyProf);
      if (!r.hit) return;
      score -= r.kind === 'champ' ? 16 : 12;
      reasons.push(r.kind === 'champ' ? `❌ Sofreix contra ${b}` : `❌ Sofreix contra el seu ${b}`);
    });

    // 5. Meta del parc: força dels millors picks disponibles de la comp (tier 26.22 + canvis 26.23)
    let metaSum = 0, metaN = 0;
    Object.entries(comp.roles).forEach(([role, champs]) => {
      const avail = champs.filter(c => !allBans.includes(c) && !enemyPicks.includes(c));
      if (!avail.length) return;
      metaSum += Math.max(...avail.map(c => tierPts(c, role) + ((PATCH_CHANGES[c] || {}).delta || 0)));
      metaN++;
    });
    if (metaN) {
      const mp = Math.round(metaSum / metaN * 0.6);
      if (mp >= 3) { score += mp; reasons.push(`📈 Picks forts al meta del parc (+${mp})`); }
    }

    score = Math.max(5, Math.min(99, score));
    return { ...comp, score, reasons };
  }).sort((a, b) => b.score - a.score);
}

function buildCtx() {
  const ranked = evaluateComps();
  return {
    ranked,
    comp: pickComp(ranked),
    ourPicks: getOurPicks().filter(Boolean),
    enemyPicks: getEnemyPicks().filter(Boolean),
    unavailable: getUnavailableChamps()
  };
}

// ---- Recomanació de campions: només depèn dels picks aliats i enemics ----
function recommendChamps(ctx, excludeIdx) {
  ctx = ctx || buildCtx();
  const slots = getOurPicks();
  const ally = slots.filter((c, i) => c && i !== excludeIdx);
  const allyProf = teamProfile(ally);
  const enemyProf = teamProfile(ctx.enemyPicks);
  const info = enemyRoleInfo();

  const poolUnion = new Map();
  ROSTER.forEach((pl, pi) => pl.pool.forEach(c => {
    if (!poolUnion.has(c)) poolUnion.set(c, []);
    poolUnion.get(c).push(pi);
  }));
  const cands = new Set(poolUnion.keys());
  Object.values(ctx.comp.roles).flat().forEach(c => cands.add(c));
  const covered = new Set();
  ally.forEach(c => champRoles(c).forEach(r => covered.add(r)));

  const out = [];
  cands.forEach(c => {
    if (ctx.unavailable.has(c) || !CHAMP_DATA[c]) return;
    let score = 0;
    const why = [];
    const add = (pts, txt, style) => { score += pts; why.push({ pts, txt, style }); };
    const t = tag => hasTag(c, tag);

    // Disponibilitat a l'equip (qualsevol jugador, sense fixar rol)
    const who = poolUnion.get(c) || [];
    if (who.length) {
      const names = who.slice(0, 2).map(pi => ROSTER[pi].name.split('#')[0]).join('/');
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
    } else add(-14, 'ningú de l\'equip el té al pool');

    // Comp objectiu
    if (Object.values(ctx.comp.roles).some(l => l.includes(c))) add(14, `encaixa a ${ctx.comp.name.split(':')[0]}`);

    // Valor del pick al parc: meta 26.22 + canvis 26.23
    const bt = bestTier(c);
    if (bt) add(TIER_PTS[bt], `${bt} al meta del ${PATCH_META.tierSource}`);
    const pch = PATCH_CHANGES[c];
    if (pch) add(pch.delta, `${pch.delta > 0 ? 'buff' : 'nerf'} al 26.23`);

    // Draft professional: flex, informació i seguretat a cegues (pesa més als primers picks)
    const k = ally.length, W = PHASE_W[Math.min(k, 4)];
    const myRoles = ourRolesFor(c), pubRoles = champRoles(c);
    if (W > 0) {
      if (myRoles.length >= 2) add(Math.round(W * (4 + 4 * Math.min(myRoles.length - 1, 2))), `flex real (${myRoles.join('/')}): el rival no sap on anirà`);
      else if (myRoles.length === 1 && pubRoles.length <= 1 && W >= 0.5) add(-Math.round(W * 5), `només ${myRoles[0]}: revela rol i jugador massa aviat`);
      if (pubRoles.length >= 2 && myRoles.length < 2) add(Math.round(W * 3), `flex públic (${pubRoles.join('/')})`);
      const weak = blindWeakness(c);
      if (weak >= 1) add(-Math.round(W * Math.min(8, weak * 3)), `counterejable a cegues (${weak} counters coneguts)`);
      else if (bt === 'S+' || bt === 'S') add(Math.round(W * 4), 'segur a cegues i fort al parc');
      if (isReactive(c) && myRoles.length < 2 && W >= 0.5) add(-Math.round(W * 5), 'pick reactiu: guarda\'l per respondre al final');
      if (bt === 'S+') add(Math.round(W * 4), 'alta prioritat: neguem el pick al rival');
    }
    if (state.enemyOtps.includes(c)) add(8, 'nega el main d\'un rival');
    if (state.fearless) { const dp = fearlessDepth(c); if (dp !== Infinity && dp <= 4) add(dp <= 2 ? -8 : -4, `Fearless: només us queden ${dp} campions al pool d'aquest rol`); }
    if (who.length && k >= 2 && feasibleCount([...ally, c]) < feasibleCount(ally) + 1) add(-10, 'cap jugador el pot jugar sense trencar els altres picks');

    // Cobertura de rols (flexible, sense assignar encara)
    const m = maxRoleMatching([...ally, c]);
    if (m <= maxRoleMatching(ally)) add(-25, 'no aporta cap rol nou: no quedarien rols per a tots els picks');
    else {
      if (champRoles(c).some(r => !covered.has(r))) add(8, 'cobreix un rol encara per cobrir');
      if (ally.length >= 3 && who.length && feasibleCount([...ally, c]) === feasibleCount(ally) + 1) add(6, 'omple un rol amb jugador disponible');
    }

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

    // Draft enemic: counters de lane ponderats per la probabilitat que coincideixin de rol
    const cd = roleDistOfChamp(c);
    const lateMul = k >= 3 ? 1.4 : 1;
    ctx.enemyPicks.forEach(e => {
      const ov = distOverlap(cd, info.dist[e] || roleDistOfChamp(e));
      if (ov < 0.15) return;
      const cond = ov < 0.9 ? ` (si coincideixen de rol, ${Math.round(ov * 100)}%)` : '';
      if ((LANE_COUNTERS[c] || []).includes(e)) add(Math.max(3, Math.round(14 * ov * lateMul)), `counter de lane contra ${e}${cond}`);
      if ((LANE_COUNTERS[e] || []).includes(c)) add(-Math.max(3, Math.round(14 * ov * lateMul)), `${e} el counteja a la lane${cond}`);
      if ((EXT_COUNTERS[e] || []).includes(c)) add(Math.max(4, Math.round(12 * ov * lateMul)), `counter segons dades externes contra ${e}${cond}`, 'vs');
      if ((EXT_COUNTERS[c] || []).includes(e)) add(-Math.max(3, Math.round(10 * ov * lateMul)), `${e} el counteja segons dades externes${cond}`);
    });

    // Draft enemic: identitat de l'equip
    if (enemyProf.dive + enemyProf.assn >= 2) {
      if (t('peel')) add(6, 'peel contra el seu dive/assassins');
      if (t('front')) add(4, 'absorbeix el seu dive');
    }
    if (enemyProf.poke >= 2) {
      if (t('eng')) add(8, 'engage contra el seu poke');
      if (t('dive')) add(4, 'dive contra el seu poke');
      if (t('poke') && !t('eng')) add(-4, 'perd el duel de poke');
    }
    if (enemyProf.eng >= 2) {
      if (t('peel')) add(6, 'peel contra el seu engage');
      if (t('mob')) add(3, 'mobilitat per esquivar el seu engage');
    }
    if (enemyProf.n >= 3 && enemyProf.mob <= 1) {
      if (t('eng')) add(5, 'rival sense mobilitat: engage');
      if (t('combo')) add(5, 'rival sense mobilitat: combo AoE');
    }
    if (enemyProf.n >= 3 && enemyProf.front === 0) {
      if (t('dive') || t('assn')) add(5, 'rival sense frontline: accés al backline');
    }

    styleRules(c, ally, allyProf, enemyProf, add);
    styleRules2(c, ally, allyProf, enemyProf, add);
    out.push({ champ: c, score, why });
  });
  return out.sort((a, b) => b.score - a.score);
}

function getActiveRecs(ctx) {
  const { type, side, index } = state.activeSlot;
  if (type !== 'PICK' || side !== state.ourSide) return [];
  return recommendChamps(ctx || buildCtx(), index);
}

function recReasons(r, max = 3) {
  const pos = r.why.filter(w => w.pts > 0).sort((a, b) => b.pts - a.pts).slice(0, max).map(w => w.txt);
  const neg = r.why.filter(w => w.pts < 0).sort((a, b) => a.pts - b.pts)[0];
  return pos.join(', ') + (neg ? ` <span style="color:#FF8A9B;">(⚠️ ${neg.txt})</span>` : '');
}

function draftSnapshotText(A, B, ourChamps) {
  const needs = [];
  if (A.n >= 1) {
    if (A.front === 0) needs.push('frontline');
    if (A.eng === 0) needs.push('engage');
    if (A.n >= 3 && A.peel === 0) needs.push('peel');
    if (A.n >= 3 && A.ap === 0) needs.push('dany AP');
    if (A.n >= 3 && A.ad === 0) needs.push('dany AD');
  }
  const en = [];
  if (B.poke >= 2) en.push(`poke ×${B.poke}`);
  if (B.dive + B.assn >= 2) en.push(`dive/assassins ×${B.dive + B.assn}`);
  if (B.eng >= 2) en.push(`engage ×${B.eng}`);
  if (B.peel >= 2) en.push(`peel ×${B.peel}`);
  if (B.front >= 2) en.push(`frontline ×${B.front}`);
  if (B.n >= 3 && B.mob <= 1) en.push('poca mobilitat');
  if (B.n >= 3 && B.front === 0) en.push('sense frontline');
  const parts = [];
  if (needs.length) parts.push(`Al vostre draft us falta: <strong>${needs.join(', ')}</strong>.`);
  if (en.length) parts.push(`El rival mostra: <strong>${en.join(', ')}</strong>.`);
  if (ourChamps.length >= 2 && maxRoleMatching(ourChamps) < ourChamps.length) {
    parts.push(`<span style="color:var(--orange);">⚠️ Els vostres picks no poden cobrir 5 rols diferents.</span>`);
  }
  return parts.length ? `<br><span style="color:var(--text-muted);">${parts.join(' ')}</span>` : '';
}

function getLiveAdvice(rankedComps) {
  const ctx = buildCtx();
  ctx.ranked = rankedComps;
  ctx.comp = pickComp(rankedComps);
  const unavailable = ctx.unavailable, topComp = ctx.comp;
  const A = teamProfile(ctx.ourPicks), B = teamProfile(ctx.enemyPicks);
  const snap = draftSnapshotText(A, B, ctx.ourPicks);
  const { type, side, index } = state.activeSlot;
  const isOurTurn = side === state.ourSide;

  if (type === 'BAN') {
    const phase2 = ctx.ourPicks.length + ctx.enemyPicks.length > 0;
    if (isOurTurn) {
      const lines = recommendBans(ctx).slice(0, 4).map((b, k) => `<br>${k + 1}. <strong>${escapeHtml(b.champ)}</strong> <span style="color:var(--gold);">(${b.score} pts)</span> — ${recReasons(b)}`).join('');
      return `<strong>Torn de BAN nostre</strong> <span style="color:var(--text-muted);">(${phase2 ? 'ronda 2: respon als seus picks, als rols que els falten i a les sinergies' : 'ronda 1: força al meta, OTPs i flex; poc counter concret per no revelar el pla'}):</span>${lines}${snap}`;
    }
    const all = recommendChamps(ctx, -1);
    const risk = all.slice(0, 3).map(r => r.champ);
    const backup = all.slice(3).find(r => !risk.includes(r.champ));
    return `<strong>Torn de BAN rival:</strong> els vostres millors candidats ara són <strong>${risk.map(escapeHtml).join(', ') || '—'}</strong> i els poden banejar.${backup ? ` Pla B ja preparat: <strong>${escapeHtml(backup.champ)}</strong>.` : ''} Si cauen, pivota cap a <strong>${escapeHtml(rankedComps[1].name)}</strong>.${snap}`;
  }

  const recs = recommendChamps(ctx, isOurTurn ? index : -1);
  const line = (r, k) => `<br>${k + 1}. <strong>${escapeHtml(r.champ)}</strong> <span style="color:var(--gold);">(${r.score} pts)</span> — ${recReasons(r)}`;
  if (isOurTurn) {
    const html = recs.length
      ? recs.slice(0, 4).map(line).join('')
      : ' cap candidat disponible.';
    return `<strong>Torn de PICK nostre</strong> <span style="color:var(--text-muted);">(sense mirar jugador ni rol; l'assignació va després):</span>${html}${snap}${phaseAdviceHtml(ctx.ourPicks.filter((c, i) => i !== index && getOurPicks()[i]).length)}${predictionHtml(ctx, 3)}<br><span style="color:var(--text-muted);">Comp objectiu: ${escapeHtml(topComp.name)} (${topComp.score}%).</span>`;
  }
  const prev = recs.slice(0, 3).map(r => `<strong>${escapeHtml(r.champ)}</strong>`).join(', ');
  return `<strong>Torn de PICK rival:</strong> si us toqués ara, les millors respostes serien → ${prev || '—'}. Es reavaluarà quan triïn.${snap}${predictionHtml(ctx, 4)}`;
}

