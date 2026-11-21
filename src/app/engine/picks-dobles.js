// ---- Picks dobles: millor parella ----
function pairRecs(ctx, i1, i2, n) {
  const arr = getOurPicks(), o1 = arr[i1], o2 = arr[i2], saved = state.assign;
  const first = recommendChamps(ctx, i1).slice(0, 7);
  const out = [];
  try {
    state.assign = { ...state.assign, manual: false };
    first.forEach(r1 => {
      arr[i1] = r1.champ; arr[i2] = null;
      const c2 = buildCtx(); c2.unavailable = new Set([...c2.unavailable, r1.champ]);
      const r2 = recommendChamps(c2, i2)[0];
      if (r2) out.push({ a: r1, b: r2, score: r1.score + r2.score });
    });
  } finally { arr[i1] = o1; arr[i2] = o2; state.assign = saved; }
  const seen = new Set();
  return out.sort((x, y) => y.score - x.score).filter(p => { const k = [p.a.champ, p.b.champ].sort().join('|'); return seen.has(k) ? false : seen.add(k); }).slice(0, n || 3);
}
function pairAdviceHtml() {
  const { type, side, index } = state.activeSlot;
  if (type !== 'PICK' || side !== state.ourSide) return '';
  const pos = draftPos(); if (!pos.nextOurs) return '';
  const pairs = pairRecs(buildCtx(), index, pos.nextIdx, 3);
  if (!pairs.length) return '';
  const syn = p => { const s = synScore(p.a.champ, p.b.champ); return s && s.real ? ` · sinergia ${s.wr}%` : ''; };
  return `<br><span style="color:var(--gold);">👥 Doble pick (aquest i el següent):</span> ${pairs.map(p => `<strong>${escapeHtml(p.a.champ)} + ${escapeHtml(p.b.champ)}</strong> <span style="color:var(--gold);">(${p.score})</span>${syn(p)}`).join(' · ')}`;
}
function saveResultHtml() {
  if (state.fearless) return '';
  const all = [...state.bluePicks, ...state.redPicks].filter(Boolean).length;
  if (all < 10) return '';
  return `<div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap;align-items:center;"><span style="color:var(--text-muted);">💾 Desa el resultat al vostre historial:</span><button class="btn" onclick="saveDraftResult('W')">✅ Victòria</button><button class="btn" onclick="saveDraftResult('L')">❌ Derrota</button><span id="histSaved" style="color:var(--text-muted);"></span></div>`;
}

