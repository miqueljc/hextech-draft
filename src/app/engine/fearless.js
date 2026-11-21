// ================= FEARLESS REAL (SÈRIE DE PARTIDES) =================
state.fearlessRule = state.fearlessRule || 'BOTH'; // BOTH: tots els picks de partides anteriors queden bloquejats | OWN: només per l'equip que els va jugar
state.series = state.series || { games: [] };
function fearlessBlocked(side) {
  const out = new Set();
  if (!state.fearless) return out;
  const actingUs = (side || state.activeSlot.side) === state.ourSide;
  state.series.games.forEach(g => {
    if (state.fearlessRule === 'BOTH') { g.us.forEach(c => out.add(c)); g.enemy.forEach(c => out.add(c)); }
    else (actingUs ? g.us : g.enemy).forEach(c => out.add(c));
  });
  return out;
}
function fearlessRemaining(p, role) { const b = fearlessBlocked(state.ourSide); return poolOf(p, role).filter(c => !b.has(c)); }
function fearlessDepth(c) {
  // mínim de campions restants dels pools (jugador, rol) on apareix c
  let min = Infinity;
  ROSTER.forEach((pl, p) => ROLE_ORDER.forEach(r => { if (poolOf(p, r).includes(c)) min = Math.min(min, fearlessRemaining(p, r).length); }));
  return min;
}
function closeGame(result) {
  recordDraft(result);
  state.series.games.push({
    n: state.series.games.length + 1, ourSide: state.ourSide, result,
    us: getOurPicks().filter(Boolean), enemy: getEnemyPicks().filter(Boolean)
  });
  resetDraft();
}
function newSeries() { state.series = { games: [] }; renderAll(); }
function setFearlessRule(v) { state.fearlessRule = v; renderAll(); }

