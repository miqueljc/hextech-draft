// ===== dades-i-editors (estat i lògica, separat de ui/dades-i-editors.js) =====
const LS = { opgg: 'hextech_opgg_v1', counters: 'hextech_counters_v1', syn: 'hextech_synergy_v1', tier: 'hextech_tier_v1', tags: 'hextech_tags_v1', ext: 'hextech_extcounters_v1' };
var SHARED = null, SHARED_META = null;
function lsGet(k) { if (SHARED && SHARED[k] !== undefined) return SHARED[k]; try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
function lsSet(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
function clearCaches() { _assignCache.clear(); _enemyCache.clear(); _cby = new Map(); }
const TAG_LIST = ['front', 'eng', 'peel', 'poke', 'dive', 'assn', 'rng', 'mob', 'combo', 'scale', 'early', 'split', 'ap', 'ad'];
const TAG_LABEL = { front: 'Frontline', eng: 'Engage', peel: 'Peel', poke: 'Poke', dive: 'Dive', assn: 'Assassí', rng: 'A distància', mob: 'Mobilitat', combo: 'Combo AoE', scale: 'Escalat', early: 'Early', split: 'Splitpush', ap: 'Dany AP', ad: 'Dany AD' };
const DEFAULTS = {};
function captureDefaults() {
  if (DEFAULTS.counters) return;
  applyOpggSnapshot();
  DEFAULTS.counters = JSON.parse(JSON.stringify(LANE_COUNTERS));
  DEFAULTS.syn = SYNERGY_PAIRS.map(x => [...x]);
  DEFAULTS.tier = JSON.parse(JSON.stringify(TIER_RAW));
  DEFAULTS.tags = {};
  Object.keys(CHAMP_DATA).forEach(c => { DEFAULTS.tags[c] = { roles: [...CHAMP_DATA[c].roles], tags: [...CHAMP_DATA[c].tags] }; });
  DEFAULTS.highlights = ROSTER.map(p => p.opggHighlights.map(h => ({ ...h })));
  PATCH_META.tierSource = '26.23';
}
// ---- Resolució de noms de campió (tolerant: majúscules, apòstrofs, àlies) ----
let _nameMap = null;
function normName(s) { return String(s).toLowerCase().replace(/[’`]/g, "'").replace(/[^a-z0-9]/g, ''); }
function canonChamp(s) {
  if (!_nameMap) {
    _nameMap = {};
    ALL_CHAMPS.forEach(c => { _nameMap[normName(c)] = c; });
    Object.assign(_nameMap, { nunu: 'Nunu & Willump', mundo: 'Doctor Mundo', renata: 'Renata Glasc', jarvan: 'Jarvan IV', monkeyking: 'Wukong', tf: 'Twisted Fate', asol: 'Aurelion Sol', mf: 'Miss Fortune', drmundo: 'Doctor Mundo', kogmaw: "Kog'Maw", reksai: "Rek'Sai", velkoz: "Vel'Koz", khazix: "Kha'Zix", chogath: "Cho'Gath", ksante: "K'Sante", belveth: "Bel'Veth", leesin: 'Lee Sin', xinzhao: 'Xin Zhao' });
  }
  return _nameMap[normName(s)] || null;
}
// ---- 1. Importador de WR reals (text copiat d'op.gg) ----
function opggBonus(wr, games) { return Math.max(0, Math.min(30, Math.round((wr - 49) * 2.2 + Math.min(games, 120) / 12))); }
function parseOpgg(text) {
  const lines = String(text || '').split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const recs = [];
  lines.forEach(line => {
    const words = line.split(/\s+/);
    let champ = null;
    for (let i = 0; i < words.length && !champ; i++) {
      for (let n = 3; n >= 1 && !champ; n--) {
        if (i + n > words.length) continue;
        const c = canonChamp(words.slice(i, i + n).join(' ').replace(/[,;:()]/g, ''));
        if (c) champ = c;
      }
    }
    if (champ) recs.push({ champ, text: line });
    else if (recs.length) recs[recs.length - 1].text += ' ' + line;
  });
  const out = [];
  recs.forEach(r => {
    const pcts = [...r.text.matchAll(/(\d{1,3}(?:[.,]\d+)?)\s*%/g)].map(m => ({ v: parseFloat(m[1].replace(',', '.')), i: m.index }));
    const wrM = pcts.find(p => p.v >= 35 && p.v <= 85);
    if (!wrM) return;
    let games = null;
    const gm = r.text.match(/(\d{1,4})\s*(?:played|partides|partidas|games|jocs|wins?)/i);
    if (gm) games = parseInt(gm[1], 10);
    else {
      const after = r.text.slice(wrM.i).replace(/\d+[.,]\d+/g, ' ').replace(/\d+\s*%/g, ' ');
      const im = after.match(/\b(\d{2,4})\b/);
      if (im) games = parseInt(im[1], 10);
    }
    const g = games || 25;
    out.push({ champ: r.champ, wrNum: wrM.v, games: g, gamesKnown: Boolean(games), bonus: opggBonus(wrM.v, g) });
  });
  const seen = new Set();
  return out.filter(o => (seen.has(o.champ) ? false : seen.add(o.champ)));
}
const opggPreview = {}, opggDraft = {};
function applyOpgg(pi) {
  const list = (opggPreview[pi] || []).filter(o => o.bonus >= 6 && o.games >= 8)
    .map(o => ({ champ: o.champ, wr: `${o.wrNum}% WR (${o.games} partides${o.gamesKnown ? '' : ', estimat'})`, bonus: o.bonus, g: o.games, wrNum: o.wrNum }));
  const all = lsGet(LS.opgg) || {};
  all[pi] = list;
  lsSet(LS.opgg, all);
  delete opggPreview[pi]; delete opggDraft[pi];
  afterDataChange();
}
function resetOpgg(pi) {
  const all = lsGet(LS.opgg) || {};
  delete all[pi];
  lsSet(LS.opgg, Object.keys(all).length ? all : null);
  delete opggPreview[pi];
  afterDataChange();
}
function applyOpggOverrides() {
  const all = lsGet(LS.opgg) || {};
  ROSTER.forEach((pl, pi) => {
    pl.opggCustom = Array.isArray(all[pi]);
    pl.stats = {}; Object.entries(pl.baseStats || {}).forEach(([c, s]) => { pl.stats[c] = { ...s }; });
    if (pl.opggCustom) all[pi].forEach(h => { if (h.g && h.wrNum && CHAMP_SET.has(h.champ)) { const w = Math.round(h.g * h.wrNum / 100); pl.stats[h.champ] = { w, l: h.g - w }; } });
    pl.opggHighlights = pl.opggCustom ? all[pi].filter(h => CHAMP_SET.has(h.champ)) : DEFAULTS.highlights[pi].map(h => ({ ...h }));
    pl.opggHighlights.forEach(h => {
      if (!pl.pool.includes(h.champ)) {
        const nat = champRoles(h.champ);
        const role = playsRole(pi, pl.role) && nat.includes(pl.role) ? pl.role : (nat.find(r => playsRole(pi, r)) || pl.role);
        (pl.rolePools[role] = pl.rolePools[role] || []).push(h.champ);
        pl.pool.push(h.champ);
      }
    });
  });
}
// ---- 2. Counters i sinergies editables ----
function countersToText() { return Object.entries(LANE_COUNTERS).map(([c, l]) => `${c} > ${l.join(', ')}`).join('\n'); }
function synergyToText() { return SYNERGY_PAIRS.map(([a, b, w]) => `${a} + ${b} : ${w}`).join('\n'); }
function parseCounters(text) {
  const out = {}, bad = [];
  String(text).split(/\r?\n/).forEach(line => {
    if (!line.trim()) return;
    const [l, r] = line.split('>');
    const c = canonChamp((l || '').trim());
    if (!c || r === undefined) { bad.push(line.trim()); return; }
    const list = [];
    r.split(',').map(s => s.trim()).filter(Boolean).forEach(n => { const x = canonChamp(n); if (x) list.push(x); else bad.push(n); });
    if (list.length) out[c] = [...new Set([...(out[c] || []), ...list])];
  });
  return { out, bad };
}
function parseSynergy(text) {
  const out = [], bad = [];
  String(text).split(/\r?\n/).forEach(line => {
    if (!line.trim()) return;
    const m = line.match(/^(.+?)\+(.+?)(?::\s*(\d+(?:\.\d+)?))?$/);
    const a = m && canonChamp(m[1].trim()), b = m && canonChamp(m[2].trim());
    if (!a || !b) { bad.push(line.trim()); return; }
    out.push([a, b, Math.max(1, Math.min(12, m[3] ? parseFloat(m[3]) : 5))]);
  });
  return { out, bad };
}
function resetCounters() { lsSet(LS.counters, null); afterDataChange(); setMsg('countersMsg', 'Restaurat al per defecte.'); }
function resetSynergy() { lsSet(LS.syn, null); afterDataChange(); setMsg('synergyMsg', 'Restaurat al per defecte.'); }
function applyCounterOverrides() {
  const c = lsGet(LS.counters), s = lsGet(LS.syn);
  Object.keys(LANE_COUNTERS).forEach(k => delete LANE_COUNTERS[k]);
  const src = c || DEFAULTS.counters;
  Object.entries(src).forEach(([k, v]) => { LANE_COUNTERS[k] = [...v]; });
  loadExtCounters();
  SYNERGY_PAIRS.length = 0;
  (s || DEFAULTS.syn).forEach(x => SYNERGY_PAIRS.push([...x]));
}
// ---- 3. Tier list actualitzable ----
const TIER_ROLE_NAMES = { T: 'Top', J: 'Jg', M: 'Mid', B: 'Bot', S: 'Sup' };
function tierToText() {
  const lines = [];
  Object.entries(TIER_ROLE_NAMES).forEach(([L, name]) => ['S+', 'S', 'A'].forEach(t => {
    const list = (TIER_RAW[L] && TIER_RAW[L][t]) || [];
    if (list.length) lines.push(`${name} ${t}: ${list.join(', ')}`);
  }));
  return lines.join('\n');
}
function parseTier(text) {
  const raw = { T: {}, J: {}, M: {}, B: {}, S: {} }, bad = [];
  const alias = { top: 'T', jg: 'J', jungle: 'J', mid: 'M', bot: 'B', adc: 'B', sup: 'S', support: 'S' };
  let n = 0;
  String(text).split(/\r?\n/).forEach(line => {
    if (!line.trim()) return;
    const m = line.match(/^\s*(top|jg|jungle|mid|bot|adc|sup|support)\s+(S\+|S|A)\s*:\s*(.*)$/i);
    if (!m) { bad.push(line.trim().slice(0, 40)); return; }
    const L = alias[m[1].toLowerCase()], t = m[2].toUpperCase();
    const list = [];
    m[3].split(',').map(s => s.trim()).filter(Boolean).forEach(x => { const c = canonChamp(x); if (c) list.push(c); else bad.push(x); });
    raw[L][t] = [...new Set([...(raw[L][t] || []), ...list])];
    n += list.length;
  });
  Object.keys(raw).forEach(L => ['S+', 'S', 'A'].forEach(t => { raw[L][t] = raw[L][t] || []; }));
  return { raw, bad, n };
}
function rebuildPatchTier(raw, source) {
  Object.keys(TIER_RAW).forEach(k => delete TIER_RAW[k]);
  Object.assign(TIER_RAW, raw);
  Object.keys(PATCH_TIER).forEach(k => delete PATCH_TIER[k]);
  Object.entries(TIER_RAW).forEach(([letter, tiers]) => Object.entries(tiers).forEach(([tier, list]) => list.forEach(c => {
    const t = (PATCH_TIER[c] = PATCH_TIER[c] || {});
    if (!t[letter]) t[letter] = tier; // si surt a diversos tiers, guanya el més alt (S+ s'itera primer)
  })));
  PATCH_META.tierSource = source;
  PATCH_META.tierNote = source === '26.23'
    ? 'Tier list del 26.23 (Skill Capped, Emerald+): OP → S+, S i A. Els campions que no hi surten són B o inferior.'
    : `Tier list del parc ${source} introduïda manualment. Els campions que no hi surten es consideren B o inferior.`;
}
function resetTier() { lsSet(LS.tier, null); afterDataChange(); setMsg('tierMsg', 'Restaurada la tier list del 26.23.'); }
function applyTierOverride() {
  const t = lsGet(LS.tier);
  if (t && t.raw) {
    const clean = { T: {}, J: {}, M: {}, B: {}, S: {} };
    Object.keys(clean).forEach(L => ['S+', 'S', 'A'].forEach(k => { clean[L][k] = ((t.raw[L] || {})[k] || []).filter(c => CHAMP_SET.has(c)); }));
    rebuildPatchTier(clean, t.source || 'manual');
  } else rebuildPatchTier(JSON.parse(JSON.stringify(DEFAULTS.tier)), '26.23');
}
function parseEsDate(s) { const m = String(s).match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/); return m ? new Date(+m[3], +m[2] - 1, +m[1]) : null; }
// ---- 4. Editor d'etiquetes i rols dels campions ----
function applyTagOverrides() {
  Object.keys(CHAMP_DATA).forEach(c => { if (DEFAULTS.tags[c]) CHAMP_DATA[c] = { roles: [...DEFAULTS.tags[c].roles], tags: new Set(DEFAULTS.tags[c].tags) }; });
  const o = lsGet(LS.tags) || {};
  Object.entries(o).forEach(([c, d]) => {
    if (!CHAMP_SET.has(c) || !d || !Array.isArray(d.roles) || !d.roles.length) return;
    CHAMP_DATA[c] = { roles: d.roles.filter(r => 'TJMBS'.includes(r)), tags: new Set((d.tags || []).filter(t => TAG_LIST.includes(t))) };
  });
}
function resetTagChamp(c) {
  const o = lsGet(LS.tags) || {};
  delete o[c];
  lsSet(LS.tags, Object.keys(o).length ? o : null);
  afterDataChange();
  setMsg('tagMsg', `${c} restaurat.`);
  loadTagChamp();
}
function resetAllTags() { lsSet(LS.tags, null); afterDataChange(); setMsg('tagMsg', 'Totes les etiquetes restaurades.'); loadTagChamp(); }
// Aplica totes les dades (locals i compartides) al motor, sense tocar la pantalla
function applyDataChange() {
  _teamRec = null; _duoRec = null;
  try { _assignCache.clear(); } catch (e) {}
  loadRealBuilds();
  loadOpPicks();
  loadTeamRoles();
  loadRealData();
  clearCaches();
  applyTagOverrides();
  applyCounterOverrides();
  applyTierOverride();
  applyRolePools();
  applyOpggOverrides();
  generateComps();
  state.assign.manual = false;
}
