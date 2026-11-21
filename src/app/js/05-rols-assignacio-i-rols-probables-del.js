// ================= ROLS, ASSIGNACIÓ I ROLS PROBABLES DEL RIVAL =================
const LETTER_ROLE = { T: 'Top', J: 'Jg', M: 'Mid', B: 'Bot', S: 'Sup' };

function champRoles(c) {
  const d = CHAMP_DATA[c];
  return d ? d.roles.map(l => LETTER_ROLE[l]) : [];
}
function roleDistOfChamp(c) {
  const rs = champRoles(c), d = [0, 0, 0, 0, 0];
  rs.forEach(r => { d[ROLE_ORDER.indexOf(r)] += 1 / rs.length; });
  return d;
}
function distOverlap(a, b) { return a.reduce((s, x, i) => s + x * b[i], 0); }

// Màxim nombre de campions que es poden col·locar en rols diferents (rols naturals)
function maxRoleMatching(champs) {
  const matchRole = [-1, -1, -1, -1, -1];
  const tryAssign = (i, seen) => {
    for (const rn of champRoles(champs[i])) {
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

function permutations(a) {
  if (a.length <= 1) return [a];
  return a.flatMap((x, i) => permutations([...a.slice(0, i), ...a.slice(i + 1)]).map(p => [x, ...p]));
}
const PLAYER_PERMS = permutations([0, 1, 2, 3, 4]);

// ---- Rival: tots els repartiments de rols que tenen sentit ----
const _enemyCache = new Map();
function enemyRoleInfo() {
  const champs = getEnemyPicks().filter(Boolean);
  const locks = state.enemyLocks || {};
  const key = champs.map(c => c + ':' + (locks[c] || '')).join('|');
  if (_enemyCache.has(key)) return _enemyCache.get(key);

  function enumerate(useLocks) {
    let minCost = Infinity, list = [];
    const taken = [false, false, false, false, false], cur = [];
    (function rec(i, cost) {
      if (cost > minCost) return;
      if (i === champs.length) {
        if (cost < minCost) { minCost = cost; list = []; }
        list.push([...cur]);
        return;
      }
      const c = champs[i], lock = useLocks ? locks[c] : null;
      for (let r = 0; r < 5; r++) {
        if (taken[r]) continue;
        if (lock && ROLE_ORDER[r] !== lock) continue;
        const natural = lock ? true : champRoles(c).includes(ROLE_ORDER[r]);
        taken[r] = true; cur[i] = r;
        rec(i + 1, cost + (natural ? 0 : 1));
        taken[r] = false;
      }
    })(0, 0);
    return list;
  }
  let list = enumerate(true);
  if (!list.length) list = enumerate(false); // locks contradictoris: s'ignoren

  const dist = {};
  champs.forEach((c, i) => {
    const d = [0, 0, 0, 0, 0];
    list.forEach(asg => { d[asg[i]] += 1 / list.length; });
    dist[c] = d;
  });
  const info = { champs, count: list.length, dist, ambiguous: champs.some(c => dist[c].filter(x => x > 0.001).length > 1) };
  _enemyCache.set(key, info);
  return info;
}

// ---- Jugadors multi-rol: cada jugador té un pool de campions per cada rol que pot jugar ----
const ROLEPOOL_LS_KEY = 'hextech_rolepools_v1';
function deriveRolePools(role, pool, pl) {
  const roles = new Set([role]), cnt = {};
  if (pl && pl.roleShare) {
    // Rols reals segons op.gg (≥10% de les partides) a més del rol de torneig
    ROLE_ORDER.forEach(r => { if ((pl.roleShare[r] || 0) >= 10) roles.add(r); });
  } else {
    pool.forEach(c => { champRoles(c).forEach(r => { if (r !== role) cnt[r] = (cnt[r] || 0) + 1; }); });
    Object.entries(cnt).forEach(([r, n]) => { if (n >= 4) roles.add(r); });
  }
  const out = {};
  ROLE_ORDER.forEach(r => { if (roles.has(r)) out[r] = pool.filter(c => champRoles(c).includes(r)); });
  pool.forEach(c => { if (!Object.values(out).some(l => l.includes(c))) out[role].push(c); });
  return out;
}
function sanitizeRolePools(raw) {
  const out = {};
  ROLE_ORDER.forEach(r => {
    if (!raw || !Array.isArray(raw[r])) return;
    out[r] = [...new Set(raw[r].filter(c => CHAMP_SET.has(c)))];
  });
  return out;
}
function applyRolePools() {
  let saved = null;
  saved = lsGet(ROLEPOOL_LS_KEY);
  ROSTER.forEach((pl, i) => {
    if (!pl.basePool) pl.basePool = [...pl.pool];
    const custom = saved && saved[i] ? sanitizeRolePools(saved[i]) : null;
    pl.custom = Boolean(custom && Object.keys(custom).length);
    pl.rolePools = pl.custom ? custom : deriveRolePools(pl.role, pl.basePool, pl);
    if (!pl.rolePools[pl.role]) pl.rolePools[pl.role] = [];
    pl.pool = [...new Set(Object.values(pl.rolePools).flat())];
  });
  _assignCache.clear();
}
function playsRole(p, role) { return Boolean(ROSTER[p].rolePools && ROSTER[p].rolePools[role]); }
function poolOf(p, role) { return (ROSTER[p].rolePools && ROSTER[p].rolePools[role]) || []; }
function playerRoles(p) { return ROLE_ORDER.filter(r => playsRole(p, r)); }
function shortName(p) { return ROSTER[p].name.split('#')[0]; }

// Rols on algú de l'equip pot jugar un campió (flex REAL nostre)
function ourRolesFor(c) {
  const s = new Set();
  ROSTER.forEach((pl, p) => ROLE_ORDER.forEach(r => { if (poolOf(p, r).includes(c)) s.add(r); }));
  return ROLE_ORDER.filter(r => s.has(r));
}
function ourPlayersFor(c) {
  const out = [];
  ROSTER.forEach((pl, p) => ROLE_ORDER.forEach(r => { if (poolOf(p, r).includes(c)) out.push(`${shortName(p)} (${r})`); }));
  return out;
}
// Quants campions es poden col·locar alhora amb jugadors i rols diferents dins del seu pool
function feasibleCount(champs) {
  let best = 0;
  const usedP = [false, false, false, false, false], usedR = [false, false, false, false, false];
  (function rec(i, placed) {
    if (placed + (champs.length - i) <= best) return;
    if (i === champs.length) { best = Math.max(best, placed); return; }
    for (let p = 0; p < 5; p++) {
      if (usedP[p]) continue;
      for (let r = 0; r < 5; r++) {
        if (usedR[r] || !poolOf(p, ROLE_ORDER[r]).includes(champs[i])) continue;
        usedP[p] = usedR[r] = true;
        rec(i + 1, placed + 1);
        usedP[p] = usedR[r] = false;
      }
    }
    rec(i + 1, placed);
  })(0, 0);
  return best;
}

// ---- Lògica de draft professional ----
// Pes de la "informació" segons quants picks nostres ja hi ha (el primer pick revela més que l'últim)
const PHASE_W = [1, 0.8, 0.5, 0.2, 0];
function blindWeakness(c) { return Object.keys(LANE_COUNTERS).filter(e => LANE_COUNTERS[e].includes(c)).length; }
function isReactive(c) { return Object.prototype.hasOwnProperty.call(LANE_COUNTERS, c); }
function flexScoreOf(c) {
  const my = ourRolesFor(c).length, pub = champRoles(c).length, bt = bestTier(c);
  return 9 * Math.max(0, my - 1) + 4 * Math.max(0, pub - 1) + (bt ? TIER_PTS[bt] : 0) - 3 * blindWeakness(c) - (isReactive(c) ? 8 : 0);
}
function phaseOf(c) {
  const my = ourRolesFor(c), pub = champRoles(c).length, bt = bestTier(c);
  if ((isReactive(c) && my.length < 2) || (my.length === 1 && pub <= 1 && bt !== 'S+')) return 3;
  return flexScoreOf(c) >= 12 ? 1 : 2;
}
function phaseAdviceHtml(k) {
  if (k <= 1) return `<br><span style="color:var(--gold);">🧠 Fase 1 (informació mínima):</span> tria <strong>flex</strong> i picks <strong>segurs a cegues</strong>; guarda per al final els picks d'un sol rol i els reactius (Pyke, Malphite, Poppy…). Tot el que triïs ho veurà el rival.`;
  if (k <= 3) return `<br><span style="color:var(--gold);">🧠 Fase 2:</span> ja heu mostrat bastant; completa el que falta (frontline / engage / dany) i comença a respondre als seus picks. Deixa <strong>1-2 rols oberts</strong> per decidir el final.`;
  return `<br><span style="color:var(--gold);">🧠 Últim pick:</span> el rival ja no pot respondre → counter-pick lliure i omple el rol que falta.`;
}

// ---- Aliats: assignació jugador + rol + campió ----
function playerRoleScore(p, r) {
  const role = ROLE_ORDER[r], pl = ROSTER[p];
  if (pl.role === role) return 8;
  if (!playsRole(p, role)) return -8;
  return pl.roleShare && pl.roleShare[role] >= 30 ? 6 : 3;
}
function playerChampFit(p, r, c) {
  const pl = ROSTER[p], role = ROLE_ORDER[r];
  let s = 0;
  if (poolOf(p, role).includes(c)) {
    s += 20;
    if (pl.excelMains.includes(c)) s += 10;
    const h = pl.opggHighlights.find(x => x.champ === c);
    if (champStat(p, c)) s += Math.round(champRating(p, c) * 0.8 * formMul(p));
    else if (h) s += Math.round(h.bonus * 0.6);
  } else if (pl.pool.includes(c)) s += 4 + Math.round(champRating(p, c) * 0.3);
  else s -= 15;
  if (CHAMP_DATA[c]) s += CHAMP_DATA[c].roles.includes(ROLE_LETTER[role]) ? 15 : -10;
  return s;
}

const _assignCache = new Map();
function autoAssign(picks) {
  const key = picks.join('|');
  if (_assignCache.has(key)) return _assignCache.get(key);
  const n = picks.length;
  let best = null;
  const roleOf = new Array(n).fill(-1), taken = [false, false, false, false, false];
  function evaluate() {
    const rc = [null, null, null, null, null];
    roleOf.forEach((r, i) => { rc[r] = picks[i]; });
    PLAYER_PERMS.forEach(perm => {
      let s = 0;
      for (let r = 0; r < 5; r++) {
        s += playerRoleScore(perm[r], r);
        if (rc[r]) s += playerChampFit(perm[r], r, rc[r]);
      }
      if (!best || s > best.score) best = { score: s, rolePlayer: [...perm], roleChamp: rc };
    });
  }
  (function rec(i) {
    if (i === n) { evaluate(); return; }
    for (let r = 0; r < 5; r++) {
      if (taken[r]) continue;
      taken[r] = true; roleOf[i] = r; rec(i + 1); taken[r] = false;
    }
  })(0);
  _assignCache.set(key, best);
  return best;
}

function getAssignment() {
  const picks = getOurPicks().filter(Boolean);
  if (state.assign.manual) {
    return {
      manual: true,
      rolePlayer: state.assign.rolePlayer,
      roleChamp: state.assign.roleChamp.map(c => (c && picks.includes(c)) ? c : null)
    };
  }
  const a = autoAssign(picks);
  return { manual: false, rolePlayer: a.rolePlayer, roleChamp: a.roleChamp };
}

function onAssignChange(r, kind, value) {
  const a = getAssignment();
  pushHistory();
  const rp = [...a.rolePlayer], rc = [...a.roleChamp];
  if (kind === 'player') {
    const p = Number(value), r2 = rp.indexOf(p);
    [rp[r], rp[r2]] = [rp[r2], rp[r]]; // intercanvi de jugadors entre rols
  } else {
    if (value === '') rc[r] = null;
    else {
      const r2 = rc.indexOf(value);
      if (r2 !== -1 && r2 !== r) rc[r2] = rc[r]; // intercanvi de campions entre rols
      rc[r] = value;
    }
  }
  state.assign = { manual: true, rolePlayer: rp, roleChamp: rc };
  renderAll();
}

function autoAssignClick() {
  pushHistory();
  state.assign = { manual: false, rolePlayer: [0, 1, 2, 3, 4], roleChamp: [null, null, null, null, null] };
  renderAll();
}

function onEnemyLock(i, value) {
  const champ = getEnemyPicks().filter(Boolean)[i];
  if (!champ) return;
  pushHistory();
  state.enemyLocks = { ...state.enemyLocks };
  if (value) state.enemyLocks[champ] = value; else delete state.enemyLocks[champ];
  renderAll();
}

