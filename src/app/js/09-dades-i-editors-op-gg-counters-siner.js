// ================= DADES I EDITORS (op.gg, counters, sinergies, tier list, etiquetes) =================
const LS = { opgg: 'hextech_opgg_v1', counters: 'hextech_counters_v1', syn: 'hextech_synergy_v1', tier: 'hextech_tier_v1', tags: 'hextech_tags_v1', ext: 'hextech_extcounters_v1' };
var SHARED = null, SHARED_META = null;
function lsGet(k) { if (SHARED && SHARED[k] !== undefined) return SHARED[k]; try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
function lsSet(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
function clearCaches() { _assignCache.clear(); _enemyCache.clear(); }
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
function analyzeOpgg(pi) {
  const el = document.getElementById('opggText_' + pi);
  if (el) opggDraft[pi] = el.value;
  opggPreview[pi] = parseOpgg(el ? el.value : '');
  renderOpggImport();
}
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
function renderOpggImport() {
  const el = document.getElementById('opggImport');
  if (!el) return;
  el.innerHTML = `<p style="font-size:0.78rem;color:var(--text-muted);margin-bottom:8px;">Obre el perfil/campions de cada jugador a op.gg, copia la taula de campions (Ctrl+C) i enganxa-la aquí. L'analitzador busca cada campió amb el seu winrate i nombre de partides; <strong>revisa la vista prèvia abans d'aplicar</strong>. Només s'usen campions amb ≥8 partides i bonus ≥6. Aplicar substitueix els WR destacats d'aquest jugador.</p>` +
    ROSTER.map((pl, pi) => {
      const prev = opggPreview[pi];
      const prevHtml = prev ? (prev.length
        ? `<table style="margin-top:6px;"><thead><tr><th>Campió</th><th>WR</th><th>Partides</th><th>Bonus</th><th>S'usarà</th></tr></thead><tbody>${prev.map(o => `<tr><td>${escapeHtml(o.champ)}</td><td>${o.wrNum}%</td><td>${o.games}${o.gamesKnown ? '' : ' (estimat)'}</td><td>${o.bonus}</td><td>${o.bonus >= 6 && o.games >= 8 ? '✅' : '—'}</td></tr>`).join('')}</tbody></table>
           <button class="btn btn-primary" style="margin-top:6px;" onclick="applyOpgg(${pi})">✔ Aplica a ${escapeHtml(shortName(pi))}</button>`
        : '<div style="color:var(--orange);font-size:0.78rem;margin-top:6px;">No s\'ha reconegut cap campió amb winrate. Comprova que has copiat la taula amb els percentatges.</div>') : '';
      return `<div style="border:1px solid var(--border,#2a3a4a);border-radius:8px;padding:8px;margin-bottom:8px;">
        <strong>${escapeHtml(shortName(pi))}</strong> <span style="font-size:0.72rem;color:var(--text-muted);">${pl.opggCustom ? '· WR importats' : '· WR per defecte'}: ${pl.opggHighlights.map(h => escapeHtml(h.champ)).join(', ') || '—'}</span>
        <textarea id="opggText_${pi}" class="search-bar" style="width:100%;min-height:70px;margin-top:6px;" placeholder="Enganxa aquí el text d'op.gg..." oninput="opggDraft[${pi}]=this.value">${escapeHtml(opggDraft[pi] || '')}</textarea>
        <div style="display:flex;gap:6px;margin-top:4px;"><button class="btn" onclick="analyzeOpgg(${pi})">🔍 Analitza</button>${pl.opggCustom ? `<button class="btn" onclick="resetOpgg(${pi})">↺ Torna al per defecte</button>` : ''}</div>${prevHtml}
      </div>`;
    }).join('');
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
function setMsg(id, txt) { const el = document.getElementById(id); if (el) el.textContent = txt; }
function saveCounters() {
  const { out, bad } = parseCounters(document.getElementById('countersText').value);
  lsSet(LS.counters, out);
  afterDataChange();
  setMsg('countersMsg', bad.length ? `Desat. Ignorat (no reconegut): ${bad.join(' · ')}` : `Desat: ${Object.keys(out).length} campions amb counters.`);
}
function resetCounters() { lsSet(LS.counters, null); afterDataChange(); setMsg('countersMsg', 'Restaurat al per defecte.'); }
function saveSynergy() {
  const { out, bad } = parseSynergy(document.getElementById('synergyText').value);
  lsSet(LS.syn, out);
  afterDataChange();
  setMsg('synergyMsg', bad.length ? `Desat. Ignorat: ${bad.join(' · ')}` : `Desat: ${out.length} parelles. S'han regenerat les comps.`);
}
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
function saveTier() {
  const src = (document.getElementById('tierSource').value || '').trim() || 'manual';
  const { raw, bad, n } = parseTier(document.getElementById('tierText').value);
  if (n < 20) { setMsg('tierMsg', `No desat: només s'han reconegut ${n} campions. Format: "Top S+: Darius, Sett" (una línia per rol i tier).`); return; }
  lsSet(LS.tier, { source: src, raw });
  afterDataChange();
  setMsg('tierMsg', `Desat com a tier list del parc ${src} (${n} entrades).` + (bad.length ? ` Ignorat: ${bad.slice(0, 8).join(' · ')}` : ''));
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
function renderPatchBanner() {
  const el = document.getElementById('patchBanner');
  if (!el) return;
  const msgs = [];
  if (PATCH_META.tierSource !== PATCH_META.patch) msgs.push(`La tier list és del parc <strong>${escapeHtml(PATCH_META.tierSource)}</strong> i el parc actual és el <strong>${PATCH_META.patch}</strong>.`);
  const d = parseEsDate(PATCH_META.date);
  if (d && Date.now() > d.getTime() + 14 * 86400000) msgs.push(`Han passat més de 14 dies des del ${PATCH_META.date}: pot haver sortit un parc nou.`);
  el.style.display = msgs.length ? 'block' : 'none';
  el.innerHTML = msgs.length ? `⚠️ ${msgs.join(' ')} Actualitza-la a <a href="#" onclick="openDataTab();return false;" style="color:var(--blue);">Dades i Editors</a>.` : '';
}
function openDataTab() {
  document.querySelectorAll('.tab-content').forEach(e => e.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(e => e.classList.remove('active'));
  const t = document.getElementById('tab-data'); if (t) t.classList.add('active');
  const b = document.getElementById('btnTabData'); if (b) b.classList.add('active');
}

// ---- 4. Editor d'etiquetes i rols dels campions ----
function applyTagOverrides() {
  Object.keys(CHAMP_DATA).forEach(c => { if (DEFAULTS.tags[c]) CHAMP_DATA[c] = { roles: [...DEFAULTS.tags[c].roles], tags: new Set(DEFAULTS.tags[c].tags) }; });
  const o = lsGet(LS.tags) || {};
  Object.entries(o).forEach(([c, d]) => {
    if (!CHAMP_SET.has(c) || !d || !Array.isArray(d.roles) || !d.roles.length) return;
    CHAMP_DATA[c] = { roles: d.roles.filter(r => 'TJMBS'.includes(r)), tags: new Set((d.tags || []).filter(t => TAG_LIST.includes(t))) };
  });
}
function loadTagChamp() {
  const c = canonChamp(document.getElementById('tagChamp').value);
  const box = document.getElementById('tagBoxes');
  if (!c) { box.innerHTML = '<span style="color:var(--text-muted);font-size:0.78rem;">Escriu o tria un campió.</span>'; return; }
  const d = CHAMP_DATA[c];
  box.innerHTML = `<div style="margin:6px 0;"><strong>${escapeHtml(c)}</strong> ${DEFAULTS.tags[c] && JSON.stringify([...DEFAULTS.tags[c].roles]) !== JSON.stringify(d.roles) || JSON.stringify([...(DEFAULTS.tags[c] || { tags: [] }).tags].sort()) !== JSON.stringify([...d.tags].sort()) ? '<span class="badge-pool">editat</span>' : ''}</div>
    <div style="font-size:0.76rem;color:var(--text-muted);">Rols (el primer marcat és el rol principal)</div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:6px;">${Object.entries(TIER_ROLE_NAMES).map(([L, n]) => `<label><input type="checkbox" id="tr_${L}" ${d.roles.includes(L) ? 'checked' : ''}> ${n}</label>`).join('')}</div>
    <div style="font-size:0.76rem;color:var(--text-muted);">Etiquetes</div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:6px;">${TAG_LIST.map(t => `<label><input type="checkbox" id="tt_${t}" ${d.tags.has(t) ? 'checked' : ''}> ${TAG_LABEL[t]}</label>`).join('')}</div>
    <button class="btn btn-primary" onclick="saveTagChamp('${c.replace(/'/g, "\\'")}')">💾 Desa ${escapeHtml(c)}</button>
    <button class="btn" onclick="resetTagChamp('${c.replace(/'/g, "\\'")}')">↺ Per defecte</button>`;
}
function saveTagChamp(c) {
  const keep = (CHAMP_DATA[c] ? CHAMP_DATA[c].roles : []);
  const checked = Object.keys(TIER_ROLE_NAMES).filter(L => document.getElementById('tr_' + L).checked);
  if (!checked.length) { setMsg('tagMsg', 'Cal marcar almenys un rol.'); return; }
  const roles = [...keep.filter(r => checked.includes(r)), ...checked.filter(r => !keep.includes(r))];
  const tags = TAG_LIST.filter(t => document.getElementById('tt_' + t).checked);
  const o = lsGet(LS.tags) || {};
  o[c] = { roles, tags };
  lsSet(LS.tags, o);
  afterDataChange();
  setMsg('tagMsg', `Desat ${c}. Les comps i recomanacions s'han recalculat.`);
  loadTagChamp();
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

function renderDataTab() {
  renderOpggImport();
  const set = (id, v) => { const el = document.getElementById(id); if (el && document.activeElement !== el) el.value = v; };
  set('countersText', countersToText());
  set('extText', extToText());
  set('synergyText', synergyToText());
  set('tierText', tierToText());
  set('tierSource', PATCH_META.tierSource);
  const dl = document.getElementById('champList');
  if (dl && !dl.childElementCount) dl.innerHTML = ALL_CHAMPS.map(c => `<option value="${escapeHtml(c)}">`).join('');
  const o = lsGet(LS.tags) || {};
  const ov = document.getElementById('tagOverrides');
  if (ov) ov.innerHTML = Object.keys(o).length ? `Campions editats: ${Object.keys(o).map(c => `<a href="#" onclick="document.getElementById('tagChamp').value='${c.replace(/'/g, "\\'")}';loadTagChamp();return false;" style="color:var(--blue);">${escapeHtml(c)}</a>`).join(', ')} · <a href="#" onclick="resetAllTags();return false;" style="color:#FF8A9B;">restaura-ho tot</a>` : 'Cap campió editat.';
}

function afterDataChange() {
  clearCaches();
  applyTagOverrides();
  applyCounterOverrides();
  applyTierOverride();
  applyRolePools();
  applyOpggOverrides();
  generateComps();
  state.assign.manual = false;
  renderRosterTable();
  renderCompsTable();
  renderProTab();
  if (typeof renderPatchTab === 'function') renderPatchTab();
  renderDataTab();
  renderPatchBanner();
  renderAll();
}

