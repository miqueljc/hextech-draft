// ===== fitxa-rival (estat i lògica, separat de ui/fitxa-rival.js) =====
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
let _scoutOpen = false;
