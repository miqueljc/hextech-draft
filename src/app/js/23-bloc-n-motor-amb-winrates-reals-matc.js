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
function afterDataChange__n() { loadRealData(); afterDataChange__base(); }
function clearCaches() { clearCaches__base(); _cby = new Map(); }

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

// ---- Posició real dins l'ordre de torneig ----
function draftPos() {
  const { type, side, index } = state.activeSlot;
  const eSide = state.ourSide === 'BLUE' ? 'RED' : 'BLUE';
  const ePicks = eSide === 'BLUE' ? state.bluePicks : state.redPicks;
  const i = TOURNAMENT_ORDER.findIndex(s => s.type === type && s.side === side && s.index === index);
  if (state.draftMode === 'FREE' || i < 0) return { enemyAfter: 5 - ePicks.filter(Boolean).length, nextOurs: false, nextIdx: -1 };
  const rest = TOURNAMENT_ORDER.slice(i + 1);
  const enemyAfter = rest.filter(s => s.type === 'PICK' && s.side === eSide && !ePicks[s.index]).length;
  const nx = TOURNAMENT_ORDER[i + 1];
  const ours = type === 'PICK' && side === state.ourSide;
  const nextOurs = Boolean(ours && nx && nx.type === 'PICK' && nx.side === state.ourSide && !getOurPicks()[nx.index] && !getOurPicks()[index]);
  return { enemyAfter, nextOurs, nextIdx: nextOurs ? nx.index : -1 };
}
function phaseAdviceHtml(k) {
  const pos = draftPos();
  if (pos.enemyAfter === 0) return `<br><span style="color:var(--gold);">🧠 Últim pick:</span> el rival ja no pot respondre → counter-pick lliure i omple el rol que falta.`;
  if (k >= 3) return `<br><span style="color:var(--gold);">🧠 Pick final vostre, però el rival encara en té ${pos.enemyAfter}:</span> us pot respondre. Eviteu picks que tinguin counters disponibles al rol que li falta i guardeu el counter-pick per a l'últim slot si en teniu.`;
  return phaseAdviceHtml__base(k);
}

// ---- Fitxa del rival (scouting) ----
const SCOUT_KEY = 'hextech_enemyscout_v1';
function loadScout() {
  let s = null; try { s = JSON.parse(localStorage.getItem(SCOUT_KEY) || 'null'); } catch (e) {}
  if (!s || !Array.isArray(s.players)) s = { team: '', otps: '', players: ROLE_ORDER.map(r => ({ name: '', role: r, text: '', champs: [] })) };
  return s;
}
state.scout = loadScout();
function saveScout() { try { localStorage.setItem(SCOUT_KEY, JSON.stringify(state.scout)); } catch (e) {} }
function scoutComfort(g, wr) {
  const base = Math.min(1, Math.log(1 + g) / Math.log(31));
  const mult = wr >= 58 ? 1.25 : wr >= 53 ? 1.1 : wr < 45 ? 0.7 : 1;
  return Math.min(1.25, base * mult);
}
function parseScoutText(text) {
  let list = parseOpgg(text).map(o => ({ champ: o.champ, wr: o.wrNum, games: o.gamesKnown ? o.games : 10 }));
  if (!list.length) {
    const seen = new Set();
    list = String(text || '').split(/[,;\n]+/).map(s => canonChamp(s.trim())).filter(c => c && !seen.has(c) && seen.add(c)).map(c => ({ champ: c, wr: 50, games: 10 }));
  }
  return list.sort((a, b) => b.games - a.games).slice(0, 10);
}
let _scoutCache = null;
function scoutPool() {
  if (_scoutCache) return _scoutCache;
  const m = new Map();
  (state.scout.players || []).forEach(p => (p.champs || []).forEach(o => {
    const c = scoutComfort(o.games, o.wr), cur = m.get(o.champ);
    if (!cur || cur.comfort < c) m.set(o.champ, { comfort: c, who: p.name || p.role, role: p.role, wr: o.wr, games: o.games });
  }));
  _scoutCache = m; return m;
}
function scoutText(s) { return `${s.who}: ${s.games} partides${s.wr && s.wr !== 50 ? ', ' + s.wr + '%' : ''}`; }
function scoutAnalyze__base() {
  state.scout.team = (document.getElementById('scoutTeam') || {}).value || '';
  state.scout.players.forEach((p, i) => {
    const n = document.getElementById('scoutName_' + i), t = document.getElementById('scoutText_' + i), r = document.getElementById('scoutRole_' + i);
    if (n) p.name = n.value.trim();
    if (r) p.role = r.value;
    if (t) { p.text = t.value; p.champs = parseScoutText(t.value); }
  });
  _scoutCache = null; saveScout(); renderScout(); renderAll();
}
function scoutClear() {
  state.scout = { team: '', otps: '', players: ROLE_ORDER.map(r => ({ name: '', role: r, text: '', champs: [] })) };
  const inp = document.getElementById('enemyOtpInput'); if (inp) inp.value = '';
  state.enemyOtps = [];
  _scoutCache = null; saveScout(); renderScout(); updateEnemyOtps();
}
let _scoutOpen = false;
function toggleScout() { _scoutOpen = !_scoutOpen; renderScout(); }
function renderScout__base() {
  const el = document.getElementById('scoutPanel'); if (!el) return;
  const s = state.scout, n = s.players.filter(p => p.champs.length).length;
  const summary = n
    ? s.players.filter(p => p.champs.length).map(p => `<div style="font-size:0.72rem;margin-top:3px;"><strong>${escapeHtml(p.role)}</strong> ${escapeHtml(p.name || '')}: ${p.champs.slice(0, 5).map(o => escapeHtml(o.champ) + (o.games !== 10 || o.wr !== 50 ? ` <span style="color:var(--text-muted);">${o.games}p${o.wr !== 50 ? ' ' + o.wr + '%' : ''}</span>` : '')).join(', ')}</div>`).join('')
    : '<div style="font-size:0.72rem;color:var(--text-muted);margin-top:4px;">Sense fitxa: la predicció i els bans usen només el meta. Pega l\'op.gg dels rivals per apuntar al seu equip.</div>';
  const form = _scoutOpen ? `<div style="margin-top:8px;">
      <input type="text" id="scoutTeam" placeholder="Nom de l'equip rival" value="${escapeHtml(s.team || '')}" style="width:100%;margin-bottom:6px;">
      ${s.players.map((p, i) => `<div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:6px;margin-top:6px;">
        <div style="display:flex;gap:6px;margin-bottom:4px;"><select id="scoutRole_${i}">${ROLE_ORDER.map(r => `<option value="${r}" ${p.role === r ? 'selected' : ''}>${r}</option>`).join('')}</select>
        <input type="text" id="scoutName_${i}" placeholder="Jugador (Nom#TAG)" value="${escapeHtml(p.name || '')}" style="flex:1;min-width:0;"></div>
        <textarea id="scoutText_${i}" rows="3" style="width:100%;" placeholder="Pega la secció de campions de l'op.gg (amb % i partides) o escriu campions separats per comes">${escapeHtml(p.text || '')}</textarea></div>`).join('')}
      <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;"><button class="btn" onclick="scoutAnalyze()">✅ Analitza i desa</button><button class="btn" onclick="scoutClear()">🗑️ Nova fitxa (buida)</button></div>
    </div>` : '';
  el.innerHTML = `<style>#scoutPanel input,#scoutPanel textarea,#scoutPanel select{background:#050B14;border:1px solid var(--border-gold);color:var(--text-main);border-radius:6px;padding:6px 8px;font-family:inherit;font-size:0.8rem;box-sizing:border-box}</style><div style="margin-top:10px;display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap;">
      <div style="font-size:0.8rem;font-weight:700;color:#FF8A9B;">📋 Fitxa del rival${s.team ? ': ' + escapeHtml(s.team) : ''}</div>
      <button class="btn" onclick="toggleScout()">${_scoutOpen ? 'Tanca' : (n ? '✏️ Edita' : '➕ Omple')}</button></div>${summary}${form}`;
}
function updateEnemyOtps() {
  updateEnemyOtps__base();
  const inp = document.getElementById('enemyOtpInput');
  if (inp && state.scout) { state.scout.otps = inp.value; saveScout(); }
}
(function restoreOtps() { const inp = document.getElementById('enemyOtpInput'); if (inp) inp.value = (state.scout && state.scout.otps) || ''; })();

// ---- Historial de drafts propis (resultat) ----
const HIST_KEY = 'hextech_drafthist_v1';
function loadHist() { try { const h = JSON.parse(localStorage.getItem(HIST_KEY) || '[]'); return Array.isArray(h) ? h : []; } catch (e) { return []; } }
let DRAFT_HIST = loadHist(), _teamRec = null;
function saveHist__base() { try { localStorage.setItem(HIST_KEY, JSON.stringify(DRAFT_HIST)); } catch (e) {} _teamRec = null; _assignCache.clear(); }
function teamRecBonus(p, c) { const r = teamRec(p, c); if (!r || r.w + r.l < 2) return 0; return Math.round(((r.w + 3) / (r.w + r.l + 6) - 0.5) * 30); }
function playerChampFit(p, r, c) { return playerChampFit__base(p, r, c) + teamRecBonus(p, c); }
function recordDraft(result) {
  const us = getOurPicks().filter(Boolean);
  if (!us.length) return false;
  const a = getAssignment();
  DRAFT_HIST.push({
    date: new Date().toISOString().slice(0, 10), side: state.ourSide, result, rival: (state.scout && state.scout.team) || '',
    us, enemy: getEnemyPicks().filter(Boolean), bans: { blue: state.blueBans.filter(Boolean), red: state.redBans.filter(Boolean) },
    roles: ROLE_ORDER.map((r, i) => ({ role: r, player: ROSTER[a.rolePlayer[i]].name, champ: a.roleChamp[i] }))
  });
  saveHist(); renderHistory(); return true;
}
function saveDraftResult(result) { if (recordDraft(result)) { const el = document.getElementById('histSaved'); if (el) el.textContent = `✅ Desat (${result === 'W' ? 'victòria' : 'derrota'}). Total: ${DRAFT_HIST.length} drafts.`; } }
function closeGame(result) { recordDraft(result); closeGame__base(result); }
function deleteHist(i) { DRAFT_HIST.splice(i, 1); saveHist(); renderHistory(); renderAll(); }
function clearHist() { if (!DRAFT_HIST.length) return; DRAFT_HIST = []; saveHist(); renderHistory(); renderAll(); }
function exportHist() {
  const t = JSON.stringify(DRAFT_HIST, null, 1);
  const done = () => { const el = document.getElementById('histMsg'); if (el) el.textContent = '📋 Historial copiat (JSON). Envia-me\'l si vols que el publiqui a les dades compartides.'; };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done, done); else done();
}
function renderHistory__base() {
  let el = document.getElementById('histPanel');
  if (!el) { const tab = document.getElementById('tab-data'); if (!tab) return; el = document.createElement('div'); el.id = 'histPanel'; el.className = 'panel'; el.style.marginTop = '12px'; tab.appendChild(el); }
  const w = DRAFT_HIST.filter(h => h.result === 'W').length, n = DRAFT_HIST.length;
  const rows = DRAFT_HIST.slice(-10).reverse().map((h, k) => {
    const i = n - 1 - k;
    return `<div style="font-size:0.74rem;margin-top:4px;display:flex;gap:6px;align-items:flex-start;"><span>${h.result === 'W' ? '✅' : '❌'}</span><span style="flex:1;">${escapeHtml(h.date)} · ${h.side === 'BLUE' ? 'blau' : 'vermell'}${h.rival ? ' vs ' + escapeHtml(h.rival) : ''} — ${h.roles.filter(x => x.champ).map(x => escapeHtml(x.champ)).join(', ')} <span style="color:var(--text-muted);">vs ${h.enemy.map(escapeHtml).join(', ')}</span></span><button class="btn" style="min-height:0;padding:2px 8px;" onclick="deleteHist(${i})">✕</button></div>`;
  }).join('');
  el.innerHTML = `<div class="panel-title">📒 Historial de drafts de l'equip</div>
    <div style="font-size:0.78rem;">${n ? `${n} drafts desats · ${w}V-${n - w}D. Amb 2+ partides d'un jugador amb un campió, el motor suma o resta segons el resultat (amb mostra encongida).` : 'Encara no hi ha drafts desats. En acabar un draft, desa el resultat des del quadre de consells.'}</div>
    ${rows}
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;"><button class="btn" onclick="exportHist()">📋 Copia l'historial</button><button class="btn" onclick="clearHist()">🗑️ Esborra'l tot</button></div>
    <div id="histMsg" style="font-size:0.72rem;color:var(--text-muted);margin-top:4px;"></div>`;
}

// ---- Recomanació de picks (substitueix l'anterior) ----
function recommendChamps__n(ctx, excludeIdx) {
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

// ---- Predicció del rival ----
function predictEnemy(ctx) {
  const enemy = ctx.enemyPicks, ours = ctx.ourPicks;
  const eSide = state.ourSide === 'BLUE' ? 'RED' : 'BLUE';
  const unavailable = getUnavailableChamps(eSide);
  const eProf = teamProfile(enemy), info = enemyRoleInfo(), miss = enemyMiss(info, enemy), sp = scoutPool();
  const baseCover = maxRoleMatching(enemy);
  const out = [];
  ALL_CHAMPS.forEach(c => {
    if (unavailable.has(c) || !CHAMP_DATA[c]) return;
    let score = 0;
    const why = [];
    const add = (p, t) => { if (!p) return; score += p; why.push({ pts: p, txt: t }); };
    const sh = roleDistOfChamp(c), pch = PATCH_CHANGES[c];
    const te = tierExpected(c, sh, miss);
    if (te.pts > 0 && te.best) add(Math.round(te.pts), `${te.best.t} a ${te.best.role} (meta)`);
    if (pch) add(pch.delta, pch.delta > 0 ? 'buff al 26.23' : 'nerf al 26.23');
    if (enemy.length >= 1) { if (te.fit < 0.08) add(-14, 'no li queda cap rol on es jugui'); else add(Math.round(6 * Math.min(1, te.fit * 1.4)), 'encaixa en un rol que els falta'); }
    if (state.enemyOtps.includes(c)) add(12, 'main conegut del rival');
    const sc = sp.get(c);
    if (sc) { const ri = ROLE_ORDER.indexOf(sc.role); add(Math.round(14 * sc.comfort * (0.25 + 0.75 * (miss[ri] || 0))), `pool de ${scoutText(sc)}`); }
    ours.forEach(p => {
      const m = muScore(c, p), ov = distOverlap(sh, ourDistPicked(p));
      if (m.adv >= 2 && ov > 0.1) add(Math.round(m.adv * 1.6 * Math.min(1, ov + 0.3)), `counteja el vostre ${p}`);
    });
    if (enemy.length >= 1 && maxRoleMatching([...enemy, c]) <= baseCover) add(-10, 'no els cabria en cap rol natural');
    if (eProf.n >= 2) {
      if (eProf.front === 0 && hasTag(c, 'front')) add(6, 'els falta frontline');
      if (eProf.eng === 0 && hasTag(c, 'eng')) add(4, 'els falta engage');
      if (eProf.ap === 0 && hasTag(c, 'ap')) add(5, 'els falta dany AP');
      if (eProf.ad === 0 && hasTag(c, 'ad')) add(5, 'els falta dany AD');
    }
    enemy.forEach(e => { const s = synScore(e, c); if (s && s.pts >= 1) add(Math.min(8, Math.round(s.pts * 1.5)), `sinergia amb ${e}`); });
    if (!enemy.length && champRoles(c).length >= 2) add(2, 'flex');
    out.push({ champ: c, score, why });
  });
  out.sort((a, b) => b.score - a.score);
  const top = out.slice(0, 12);
  const z = top.reduce((s, x) => s + Math.exp(x.score / 7), 0);
  top.forEach(x => { x.prob = Math.exp(x.score / 7) / z; });
  return top;
}
function ourAnswersTo(enemyChamp, ctx) {
  const pool = [...new Set(ROSTER.flatMap(p => p.pool))];
  return pool.filter(c => !ctx.unavailable.has(c)).map(c => ({ c, a: muScore(c, enemyChamp).adv })).filter(x => x.a >= 2.5 && distOverlap(roleDistOfChamp(x.c), roleDistOfChamp(enemyChamp)) > 0.15).sort((a, b) => b.a - a.a).slice(0, 2).map(x => x.c);
}

// ---- Matchups de línia i tooltips amb WR real ----
function laneMatchup__n(c, e, role) {
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
function getLiveAdvice__n(ranked) {
  let h = getLiveAdvice__base(ranked);
  try { h += pairAdviceHtml() + saveResultHtml(); } catch (e) { console.warn('pairAdvice', e); }
  return h;
}

function predictionHtml(ctx, max) { if (draftPos().enemyAfter === 0 || ctx.enemyPicks.length >= 5) return ''; return predictionHtml__base(ctx, max); }
// ---- Notes del parc: ja oficials ----
PATCH_META.note = 'Notes oficials del 26.23 (Riot, 17/11/2026): els canvis aplicats coincideixen amb la versió final.';
loadRealData();
setTimeout(() => { try { renderScout(); renderHistory(); } catch (e) { console.warn(e); } }, 0);

