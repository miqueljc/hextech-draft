// ===== rols-viables (estat i lògica, separat de ui/filtres.js) =====
let TEAM_ROLES = {};
function loadTeamRoles() { const t = lsGet('hextech_teamroles_v1'); TEAM_ROLES = (t && typeof t === 'object') ? t : {}; }
loadTeamRoles();
function viableRoles(c) {
  const pub = champRoles(c), extra = (TEAM_ROLES[c] || []).filter(r => ROLE_ORDER.includes(r));
  let v = pub;
  if (ROLE_RATES[c]) { const d = roleDistOfChamp(c), w = ROLE_ORDER.filter((r, i) => d[i] >= 0.05); if (w.length) v = w; }
  return extra.length ? ROLE_ORDER.filter(r => v.includes(r) || extra.includes(r)) : v;
}
// Quants picks poden tenir rol propi alhora, només amb rols viables (Corki, Smolder, Varus... compten com a Bot)
function maxRoleMatching(champs) {
  const matchRole = [-1, -1, -1, -1, -1];
  const roles = champs.map(viableRoles);
  const tryAssign = (i, seen) => {
    for (const rn of roles[i]) {
      const r = ROLE_ORDER.indexOf(rn);
      if (seen[r]) continue;
      seen[r] = true;
      if (matchRole[r] === -1 || tryAssign(matchRole[r], seen)) { matchRole[r] = i; return true; }
    }
    return false;
  };
  let m = 0;
  for (let i = 0; i < champs.length; i++) if (tryAssign(i, [false, false, false, false, false])) m++;
  return m;
}
const TAG_FILTERS = [['eng', 'Engage'], ['poke', 'Poke'], ['scale', 'Escalat'], ['early', 'Early'], ['front', 'Frontline'], ['peel', 'Peel'], ['dive', 'Dive'], ['assn', 'Assassí'], ['combo', 'Combo AoE'], ['split', 'Split'], ['mob', 'Mobilitat'], ['rng', 'Rang'], ['ap', 'AP'], ['ad', 'AD']];
state.tagFilters = new Set();
// Sinergies amb duos reals inclosos
function synergyCandidates(x, max = 3) {
  const unavail = getUnavailableChamps();
  const dx = roleDistOfChamp(x);
  const rx = ROLE_ORDER.filter((r, i) => dx[i] >= 0.3);
  const poolBy = new Map();
  ROSTER.forEach((pl, pi) => playerRoles(pi).forEach(r => poolOf(pi, r).forEach(c => { if (!poolBy.has(c)) poolBy.set(c, new Set()); poolBy.get(c).add(pi); })));
  const out = [];
  ALL_CHAMPS.forEach(c => {
    if (c === x || !CHAMP_DATA[c] || unavail.has(c)) return;
    if (distOverlap(roleDistOfChamp(c), dx) > 0.5) return;
    let pts = 0, why = [], src = null, real = null;
    const d = synScore(x, c);
    if (d && d.real) { pts += d.pts * 2.5; real = d; why.push(`duo real ${d.wr}% (${d.g} partides)`); src = REAL_SRC; }
    const w = synergyOf(x, c);
    if (w && !real) { pts += w * 2; why.push('parella recomanada'); src = SYN_SRC[synKey(x, c)] || 'sinergies editades'; }
    if (ANTI_PAIRS.some(([a, b]) => (a === x && b === c) || (a === c && b === x))) pts -= 20;
    let st = 0; const sw = [];
    STRUCT_SYN.forEach(([fx, fc, p, txt]) => { if (fx(x) && fc(c) && !sw.includes(txt)) { st += p; sw.push(txt); } });
    st = Math.min(st, 6); if (st) { pts += st; if (!src) why.push(...sw.slice(0, 2)); }
    const rc = champRoles(c);
    if (LANE_PAIR.some(([a, b]) => (rx.includes(a) && rc.includes(b)) || (rx.includes(b) && rc.includes(a)))) pts += 1;
    if (pts <= 0) return;
    const bt = bestTier(c); if (bt === 'S+') pts += 1;
    const who = poolBy.get(c); if (who) pts += 2;
    out.push({ champ: c, pts, why, src, real, who: who ? [...who].map(shortName) : [] });
  });
  return out.sort((a, b) => b.pts - a.pts).slice(0, max);
}
