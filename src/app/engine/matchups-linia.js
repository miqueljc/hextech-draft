// ---- Matchups de línia i tooltips amb WR real ----
function laneMatchupRules(c, e, role) {
  let score = 0;
  const notes = [];
  const m = muScore(c, e);
  if (Math.abs(m.adv) >= 1.5) {
    const s = Math.max(-4, Math.min(4, Math.round(m.adv / 2))) || Math.sign(m.adv);
    score += s;
    notes.push(m.adv > 0 ? `${c} guanya ${e} (${muText(m)})` : `${e} counteja ${c} (${muText(m)})`);
  }
  if (role === 'Top' || role === 'Mid') {
    if (hasTag(c, 'rng') && !hasTag(e, 'rng')) { score += 1; notes.push('avantatge de rang'); }
    if (!hasTag(c, 'rng') && hasTag(e, 'rng')) { score -= 1; notes.push('desavantatge de rang'); }
  }
  if (role === 'Sup') {
    if (hasTag(c, 'eng') && hasTag(e, 'peel') && !hasTag(e, 'eng')) { score += 1; notes.push('engage contra enchanter/peel'); }
    if (hasTag(e, 'eng') && hasTag(c, 'peel') && !hasTag(c, 'eng')) { score -= 1; notes.push('el seu engage contra el vostre peel'); }
  }
  const ce = hasTag(c, 'early'), ee = hasTag(e, 'early');
  if (ce && !ee) { score += 1; notes.push('més pic early'); }
  if (!ce && ee) { score -= 1; notes.push('menys pic early'); }
  const tc = tierPts(c, role), tt = tierPts(e, role);
  if (tc - tt >= 6) { score += 1; notes.push(`meta ${PATCH_META.tierSource || PATCH_META.patch}: ${c} ${tierIn(c, role) || '—'} vs ${e} ${tierIn(e, role) || '—'}`); }
  if (tt - tc >= 6) { score -= 1; notes.push(`meta ${PATCH_META.tierSource || PATCH_META.patch}: ${e} ${tierIn(e, role) || '—'} vs ${c} ${tierIn(c, role) || '—'}`); }
  return { score, notes };
}
function counterCandidates(e, max = 3) {
  const unavail = getUnavailableChamps();
  const info = enemyRoleInfo();
  const dist = ((info.dist && info.dist[e]) || roleDistOfChamp(e)).slice();
  dist[3] = dist[4] = Math.max(dist[3], dist[4]);
  const poolBy = new Map();
  ROSTER.forEach((pl, pi) => playerRoles(pi).forEach(r => poolOf(pi, r).forEach(c => { if (!poolBy.has(c)) poolBy.set(c, new Set()); poolBy.get(c).add(pi); })));
  const out = [];
  ALL_CHAMPS.forEach(c => {
    if (c === e || !CHAMP_DATA[c] || unavail.has(c)) return;
    const ov = distOverlap(roleDistOfChamp(c), dist);
    if (ov < 0.2) return;
    let pts = 0, why = [], src = null;
    const m = muScore(c, e);
    if (m.adv >= 2) { pts += Math.round(m.adv * 2.4); why.push(m.real ? `guanya la línia: ${m.wr}% (${m.g} partides)` : 'counter segons llistes'); src = m.real ? REAL_SRC : (EXT_SRC[e] || 'dades externes'); }
    else if (m.adv <= -2) pts -= 14;
    let st = 0; const sw = [];
    STRUCT_RULES.forEach(([fe, fc, p, txt]) => { if (fe(e) && fc(c)) { st += p; sw.push(txt); } });
    st = Math.min(st, 7);
    if (st) { pts += st; if (!src) why.push(...sw.slice(0, 2)); }
    if (pts < 4) return;
    const bt = bestTier(c); if (bt === 'S+') pts += 2; else if (bt === 'S') pts += 1;
    if (PATCH_CHANGES[c] && PATCH_CHANGES[c].delta < 0) pts -= 1;
    const who = poolBy.get(c);
    if (who) pts += 3;
    out.push({ champ: c, pts: Math.round(pts * (0.6 + 0.4 * Math.min(1, ov))), why, src, who: who ? [...who].map(shortName) : [] });
  });
  return out.sort((a, b) => b.pts - a.pts).slice(0, max);
}
function realMatchupNote(c, e) {
  const m = muScore(c, e);
  if (m.adv <= -2) return m.real ? `${e} et counteja: teniu ${m.wr}% en ${m.g} partides` : `${e} et counteja segons les llistes`;
  if (m.adv >= 2) return m.real ? `tu counteges ${e}: ${m.wr}% en ${m.g} partides` : `tu counteges ${e} segons les llistes`;
  return '';
}
// --- 3. Veredicte de línia: un winrate real clar mana sobre les regles generals ---
function laneMatchup(c, e, role) {
  const r = laneMatchupRules(c, e, role);
  try {
    const m = muScore(c, e);
    if (!m.real || Math.abs(m.adv) < 2.5) return r;
    // part del resultat que ve del winrate real (mateixa fórmula que el bloc N)
    const realPart = Math.max(-4, Math.min(4, Math.round(m.adv / 2))) || Math.sign(m.adv);
    const rest = r.score - realPart;
    // amb un winrate real clar (≥2,5 punts ajustats), les regles generals només poden matisar ±1
    const capped = realPart + Math.max(-1, Math.min(1, rest));
    const sign = Math.sign(m.adv);
    const score = sign > 0 ? Math.max(capped, 2) : Math.min(capped, -2);
    return { score, notes: r.notes };
  } catch (err) { return r; }
}
