// ===== Bloc N: motor amb winrates reals (matchups, duos, rols), fitxa del rival, ordre real del draft i historial =====
const REAL_SRC = 'metabot.gg 26.19–26.22';
let MATCHUPS = MATCHUPS_DEFAULT, DUO_WR = DUOWR_DEFAULT, ROLE_RATES = ROLE_RATES_DEFAULT;
let _cby = new Map(), _reactive = null;
function loadRealData() {
  const m = lsGet('hextech_matchups_v1'), d = lsGet('hextech_duowr_v1'), r = lsGet('hextech_rolerates_v1');
  MATCHUPS = (m && typeof m === 'object') ? m : MATCHUPS_DEFAULT;
  DUO_WR = (d && typeof d === 'object') ? d : DUOWR_DEFAULT;
  ROLE_RATES = (r && typeof r === 'object') ? r : ROLE_RATES_DEFAULT;
  _cby = new Map();
}

function adjWR(wr, g, k) { return 50 + (wr - 50) * g / (g + (k || 60)); }
// Avantatge de c contra e a la línia, en punts de WR (ajustat per mostra). real=true si ve de winrates reals.
function muScore(c, e) {
  const r = MATCHUPS[c] && MATCHUPS[c][e];
  if (r && r[1] >= 30) return { adv: adjWR(r[0], r[1]) - 50, wr: r[0], g: r[1], real: true };
  const a = (LANE_COUNTERS[c] || []).includes(e) || (EXT_COUNTERS[e] || []).includes(c);
  const b = (LANE_COUNTERS[e] || []).includes(c) || (EXT_COUNTERS[c] || []).includes(e);
  return { adv: a === b ? 0 : (a ? 3 : -3), real: false };
}
function muText(m) { return m.real ? `${m.wr}% en ${m.g} partides` : 'segons llistes de counters'; }
function counteredBy(c) {
  if (_cby.has(c)) return _cby.get(c);
  const s = new Set();
  Object.keys(MATCHUPS[c] || {}).forEach(e => { if (muScore(c, e).adv <= -2.5) s.add(e); });
  (EXT_COUNTERS[c] || []).forEach(e => { if (muScore(c, e).adv <= -2.5) s.add(e); });
  Object.keys(LANE_COUNTERS).forEach(e => { if (LANE_COUNTERS[e].includes(c) && muScore(c, e).adv <= -2.5) s.add(e); });
  const a = [...s]; _cby.set(c, a); return a;
}
// Sinergia: duo real (WR amb mostra encongida) o parella recomanada
function synScore(a, b) {
  const d = DUO_WR[[a, b].sort().join('|')];
  if (d && d[1] >= 40) { const adv = adjWR(d[0], d[1], 200) - 50; return adv > 0 ? { pts: adv, wr: d[0], g: d[1], real: true } : null; }
  const w = synergyOf(a, b);
  return w ? { pts: w * 0.6, real: false } : null;
}

// Reactius de veritat: la llista curada original (Malphite, Poppy, Pyke...), no tots els campions amb dades
function blindWeakness(c) { const un = getUnavailableChamps(); return counteredBy(c).filter(e => !un.has(e)).length; }
function isReactive(c) {
  if (!_reactive) _reactive = new Set(Object.keys((DEFAULTS && DEFAULTS.counters) || {}));
  return _reactive.has(c);
}

// Repartiment de rols segons la taxa de pick real per rol (metabot.gg)
function roleDistOfChamp(c) {
  const r = ROLE_RATES[c], rs = champRoles(c);
  if (r) {
    const v = r.map((x, i) => Math.max(x || 0, rs.includes(ROLE_ORDER[i]) ? 0.05 : 0));
    const s = v.reduce((a, b) => a + b, 0);
    if (s > 0) return v.map(x => x / s);
  }
  const d = [0, 0, 0, 0, 0];
  rs.forEach(x => { d[ROLE_ORDER.indexOf(x)] += 1 / rs.length; });
  return d;
}
function enemyRoleInfo() {
  const champs = getEnemyPicks().filter(Boolean), locks = state.enemyLocks || {};
  const key = 'N|' + champs.map(c => c + ':' + (locks[c] || '')).join('|');
  if (_enemyCache.has(key)) return _enemyCache.get(key);
  function run(useLocks) {
    const P = champs.map(c => { const s = roleDistOfChamp(c); return ROLE_ORDER.map((r, i) => (useLocks && locks[c]) ? (locks[c] === r ? 1 : 0) : Math.max(s[i], 0.002)); });
    const dist = {}; champs.forEach(c => { dist[c] = [0, 0, 0, 0, 0]; });
    let tot = 0, count = 0; const taken = [0, 0, 0, 0, 0], cur = [];
    (function rec(i, w) {
      if (w === 0) return;
      if (i === champs.length) { tot += w; count++; cur.forEach((r, j) => { dist[champs[j]][r] += w; }); return; }
      for (let r = 0; r < 5; r++) { if (taken[r]) continue; taken[r] = 1; cur[i] = r; rec(i + 1, w * P[i][r]); taken[r] = 0; }
    })(0, 1);
    if (tot > 0) champs.forEach(c => { dist[c] = dist[c].map(x => x / tot); });
    return { tot, count, dist };
  }
  let res = run(true);
  if (!(res.tot > 0)) res = run(false);
  const info = { champs, count: res.count, dist: res.dist, ambiguous: champs.some(c => res.dist[c].filter(x => x > 0.15).length > 1) };
  _enemyCache.set(key, info);
  return info;
}
// Probabilitat que cada rol del rival encara estigui per cobrir
function enemyMiss(info, enemy) {
  const m = [1, 1, 1, 1, 1];
  (enemy || []).forEach(c => { const d = (info.dist && info.dist[c]) || roleDistOfChamp(c); d.forEach((x, i) => { m[i] -= x; }); });
  return m.map(x => Math.max(0, Math.min(1, x)));
}
function tierExpected(c, share, w) {
  let s = 0, z = 0, best = null, bestV = -1;
  ROLE_ORDER.forEach((r, i) => {
    const k = share[i] * w[i]; if (k <= 0) return;
    const t = tierIn(c, r), p = t ? TIER_PTS[t] : 0;
    s += k * p; z += k;
    if (t && k * (p + 1) > bestV) { bestV = k * (p + 1); best = { t, role: r }; }
  });
  return { pts: z ? s / z : 0, fit: z, best };
}
function ourOpenRoles(ally) {
  if (!ally.length) return ROLE_ORDER.slice();
  const a = autoAssign(ally);
  return ROLE_ORDER.filter((r, i) => !a.roleChamp[i]);
}
function ourDist(c, open) {
  let rs = ourRolesFor(c).filter(r => open.includes(r));
  if (!rs.length) rs = champRoles(c).filter(r => open.includes(r));
  if (!rs.length) return roleDistOfChamp(c);
  const sh = roleDistOfChamp(c), v = ROLE_ORDER.map((r, i) => rs.includes(r) ? 0.3 + sh[i] : 0), s = v.reduce((a, b) => a + b, 0);
  return v.map(x => x / s);
}
function tierForUs(c, open) {
  let rs = ourRolesFor(c).filter(r => open.includes(r));
  if (!rs.length) rs = champRoles(c).filter(r => open.includes(r));
  if (!rs.length) rs = champRoles(c);
  let best = null;
  rs.forEach(r => { const t = tierIn(c, r); if (t && (!best || TIER_PTS[t] > TIER_PTS[best.t])) best = { t, role: r }; });
  return best;
}
function ourDistPicked(p) {
  const a = getAssignment(), i = a.roleChamp.indexOf(p);
  if (i >= 0) { const d = [0, 0, 0, 0, 0]; d[i] = 1; return d; }
  return roleDistOfChamp(p);
}

