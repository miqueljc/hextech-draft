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
function scoutAnalyze() {
  if (state.scout) { state.scout.sharedId = null; }
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
function renderScout() {
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
  const h = sharedRivalsHtml(); if (!h) return;
  const d = document.createElement('div'); d.innerHTML = h; el.insertBefore(d.firstElementChild, el.children[2] || null);
}
(function restoreOtps() { const inp = document.getElementById('enemyOtpInput'); if (inp) inp.value = (state.scout && state.scout.otps) || ''; })();

