// ===== Bloc R: comps flexibles (famílies amb alternatives) + icones de runes, encanteris i objectes =====
// ---------- 1. Famílies de composicions ----------
const COMP_ARCH_KW = [[/anti-dive|peel|protegir|front-to-back/i, 'protect'], [/wombo|engage/i, 'engage'], [/dive|skirmish/i, 'dive'], [/poke|setge/i, 'poke'], [/split/i, 'split'], [/escal/i, 'scale'], [/caçad|pick/i, 'pick']];
function compArchKey(c) {
  if (c.archKey) return c.archKey;
  const hit = COMP_ARCH_KW.find(([re]) => re.test(c.name + ' ' + (c.style || '')));
  if (hit) return hit[1];
  let best = null, bv = -1;
  GEN_ARCH.forEach(a => { const v = ROLE_ORDER.reduce((s, r) => s + Object.entries(a.w).reduce((t, [tg, w]) => t + (hasTag(c.roles[r][0], tg) ? w : 0), 0), 0); if (v > bv) { bv = v; best = a.key; } });
  return best;
}
// coincidència de rols comparant només les alineacions principals (2 primeres opcions)
function compOverlap(a, b) { return ROLE_ORDER.filter(r => (a[r] || []).slice(0, 2).some(x => (b[r] || []).slice(0, 2).includes(x))).length; }
function archOf(key) { return GEN_ARCH.find(a => a.key === key) || null; }
function archFit(c, arch) { return arch ? Object.entries(arch.w).reduce((s, [t, w]) => s + (hasTag(c, t) ? w : 0), 0) : 0; }
// Substituts funcionals: mateix rol viable, comparteix la funció clau del titular a l'arquetip i el tipus de dany als carries
function compSubstitutes(main, role, arch, exclude) {
  const keyTags = arch ? Object.entries(arch.w).filter(([t]) => hasTag(main, t)).sort((a, b) => b[1] - a[1]) : [];
  const top = keyTags.length ? keyTags[0][0] : null;
  const fm = archFit(main, arch);
  const dmg = ['ap', 'ad'].filter(t => hasTag(main, t));
  const needDmg = (role === 'Mid' || role === 'Bot') && dmg.length === 1 ? dmg[0] : null;
  const ok = c => c !== main && CHAMP_DATA[c] && !exclude.has(c) && viableRoles(c).includes(role)
    && (!top || hasTag(c, top)) && archFit(c, arch) >= fm - 3 && (!needDmg || hasTag(c, needDmg));
  const teamPool = [...new Set(ROSTER.flatMap((pl, p) => playsRole(p, role) ? poolOf(p, role) : []))];
  const rank = c => archFit(c, arch) + tierPts(c, role) * 0.6;
  const pool = teamPool.filter(ok).sort((a, b) => rank(b) - rank(a)).slice(0, 3);
  const meta = ALL_CHAMPS.filter(c => ok(c) && !teamPool.includes(c) && ['S+', 'S', 'A'].includes(tierIn(c, role)) && roleDistOfChamp(c)[ROLE_ORDER.indexOf(role)] >= 0.15).sort((a, b) => rank(b) - rank(a)).slice(0, 3);
  return { pool, meta };
}
function groupComps() {
  COMPS.forEach(c => { if (!c.gen) { if (!c.baseRoles) c.baseRoles = JSON.parse(JSON.stringify(c.roles)); c.roles = JSON.parse(JSON.stringify(c.baseRoles)); c.variants = [c.name]; } });
  const manual = COMPS.filter(c => !c.gen), autos = COMPS.filter(c => c.gen);
  // 1) les auto del mateix arquetip són variants d'una sola comp
  const fams = [];
  autos.forEach(a => {
    const f = fams.find(x => x.archKey === a.archKey);
    if (f) f.members.push(a); else fams.push({ archKey: a.archKey, members: [a] });
  });
  const mergeRoles = (into, list) => ROLE_ORDER.forEach(r => {
    const cnt = new Map();
    list.forEach((m, k) => (m.roles[r] || []).forEach((c, i) => cnt.set(c, (cnt.get(c) || 0) + (k === 0 ? 100 : 0) + 3 - Math.min(i, 2))));
    into.roles[r] = [...cnt.entries()].sort((a, b) => b[1] - a[1]).map(x => x[0]);
  });
  const out = manual.slice();
  fams.forEach(f => {
    const head = { ...f.members[0], roles: JSON.parse(JSON.stringify(f.members[0].roles)) };
    mergeRoles(head, f.members);
    // 2) si s'assembla molt a una comp oficial, s'hi afegeix com a variants
    let best = null, bo = 0;
    manual.forEach(m => {
      const o = Math.max(...f.members.map(x => compOverlap(m.baseRoles || m.roles, x.roles))), same = compArchKey(m) === f.archKey;
      if ((same && o >= 3) || o >= 5) { const v = o + (same ? 0.5 : 0); if (v > bo) { bo = v; best = m; } }
    });
    if (best) {
      mergeRoles(best, [{ roles: best.roles }, head]);
      best.variants.push(...f.members.map(m => m.name));
    } else {
      head.variants = f.members.map(m => m.name);
      head.name = head.name.replace(' (auto)', '') + ' (auto)';
      out.push(head);
    }
  });
  // 3) substituts funcionals per rol (del pool de l'equip i del meta)
  out.forEach(c => {
    const arch = archOf(compArchKey(c));
    c.alt = {};
    ROLE_ORDER.forEach(r => {
      const main = c.roles[r][0]; if (!main) return;
      const s = compSubstitutes(main, r, arch, new Set(c.roles[r]));
      s.pool.forEach(x => { if (!c.roles[r].includes(x)) c.roles[r].push(x); });
      c.alt[r] = s.meta.filter(x => !c.roles[r].includes(x));
    });
  });
  COMPS.length = 0; out.forEach(c => COMPS.push(c));
  if (state.selectedCompId && !COMPS.some(c => c.id === state.selectedCompId)) state.selectedCompId = null;
}
const _generateCompsBaseR = generateComps;
generateComps = function () {
  // restaura les oficials abans de regenerar (les auto es tornen a crear)
  COMPS.forEach(c => { if (!c.gen && c.baseRoles) c.roles = JSON.parse(JSON.stringify(c.baseRoles)); });
  _generateCompsBaseR();
  try { groupComps(); } catch (e) { console.warn('groupComps', e); }
};

// ---------- 2. Finestra de compatibilitats amb icones ----------
function compRoleHtml(comp, r, full) {
  const un = getUnavailableChamps(), ours = getOurPicks().filter(Boolean);
  const list = comp.roles[r] || [], alt = (comp.alt && comp.alt[r]) || [];
  // un pick propi només compta al rol on l'assigneu; als altres rols es mostra la millor opció lliure
  let here = null; try { const a = getAssignment(); here = a.roleChamp[ROLE_ORDER.indexOf(r)]; } catch (e) {}
  const mine = here && list.includes(here) ? here : null;
  const main = mine || list.find(c => !un.has(c)) || list[0];
  const st = c => c === mine ? 'cr-mine' : (un.has(c) || ours.includes(c)) ? 'cr-off' : '';
  const rest = list.filter(c => c !== main);
  const smallN = full ? rest.length : 3;
  const small = rest.slice(0, smallN).map(c => `<span class="cr-alt ${st(c)}" title="${escapeHtml(c)}">${champIcon(c, 0)}</span>`).join('');
  const more = !full && rest.length > 3 ? `<span class="cr-more">+${rest.length - 3}</span>` : '';
  const metaAlt = full && alt.length ? `<div class="cr-meta">${alt.map(c => `<span class="cr-alt cr-out ${st(c)}" title="${escapeHtml(c)} (fora del pool)">${champIcon(c, 0)}</span>`).join('')}</div>` : '';
  return `<div class="cr-col"><div class="cr-role">${r}</div>
    <span class="cr-main ${st(main)}" title="${escapeHtml(main || '')}">${main ? champIcon(main, 0) : ''}</span>
    ${full ? `<div class="cr-name">${escapeHtml(main || '')}</div>` : ''}
    <div class="cr-alts">${small}${more}</div>${metaAlt}</div>`;
}
renderCompsRanking = function (ranked) {
  const LIMIT = 8;
  const list = state.showAllComps ? ranked : ranked.slice(0, LIMIT);
  const sel = state.selectedCompId && !list.some(c => c.id === state.selectedCompId) ? ranked.find(c => c.id === state.selectedCompId) : null;
  if (sel) list.push(sel);
  const cards = list.map(comp => {
    const isSel = state.selectedCompId === comp.id;
    const nv = (comp.variants || []).length;
    return `<div class="comp-card ${isSel ? 'selected-comp' : ''}" onclick="toggleSelectComp(${comp.id})">
      <div class="comp-top">
        <strong style="font-size:0.84rem;color:var(--gold-light);">${escapeHtml(comp.name)}${nv > 1 ? ` <span class="cr-var">${nv} variants</span>` : ''}</strong>
        <span class="score-pill">${comp.score}% Match</span>
      </div>
      <div class="cr-grid">${ROLE_ORDER.map(r => compRoleHtml(comp, r, isSel)).join('')}</div>
      ${isSel ? `<div class="cr-legend">Icona gran: opció principal disponible · petites: alternatives del vostre pool (vàlides per a la mateixa comp) · amb vora discontínua: alternatives del meta fora del pool · daurat: ja triat · gris: banejat o agafat.${nv > 1 ? ' Agrupa: ' + comp.variants.map(escapeHtml).join(', ') + '.' : ''}</div>` : ''}
      <div class="comp-meta">${comp.reasons.slice(0, 3).join(' • ') || escapeHtml(comp.style)}</div>
    </div>`;
  }).join('');
  const more = ranked.length > LIMIT
    ? `<div style="text-align:center;margin-top:6px;"><button class="btn" onclick="state.showAllComps=!state.showAllComps;renderAll()">${state.showAllComps ? 'Mostra\'n menys' : `Mostra totes (${ranked.length})`}</button></div>` : '';
  document.getElementById('compsRanking').innerHTML = cards + more;
};

// ---------- 3. Icones de runes, encanteris i objectes (catàleg oficial de Data Dragon) ----------
// Catàleg oficial verificat (Data Dragon 16.23.1) inclòs a l'app; s'actualitza sol quan surt una versió nova
const DD_CAT_KEY = 'hextech_ddcat_v2';
let DD_CAT = DD_CAT_DEFAULT;
try { const c = JSON.parse(localStorage.getItem(DD_CAT_KEY) || 'null'); if (c && c.items && c.spells && Object.keys(c.spells).length) DD_CAT = c; } catch (e) {}
function ddNorm(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]/g, ''); }
const ITEM_ALIAS = { ludensecho: ['ludenscompanion', 'ludensecho'], objectedesuport: ['worldatlas', 'runiccompass', 'bountyofworlds'], pociodevida: ['healthpotion'], botesdetier3delaquestdemid: [] };
const SHARD_ICON = { adaptiveforce: 'StatModsAdaptiveForceIcon', attackspeed: 'StatModsAttackSpeedIcon', abilityhaste: 'StatModsCDRScalingIcon', healthscaling: 'StatModsHealthScalingIcon', tenacityandslowresist: 'StatModsTenacityIcon', health: 'StatModsHealthPlusIcon', movespeed: 'StatModsMovementSpeedIcon' };
let _ddCatLoading = false;
function ddLoadCatalog(force) {
  if (_ddCatLoading || (DD_CAT && DD_CAT.ver === DD_VER && !force)) return;
  if (typeof fetch !== 'function') return;
  _ddCatLoading = true;
  const base = `https://ddragon.leagueoflegends.com/cdn/${DD_VER}/data/en_US/`;
  Promise.all(['item.json', 'runesReforged.json', 'summoner.json'].map(f => fetch(base + f).then(r => r.ok ? r.json() : null).catch(() => null))).then(([it, ru, su]) => {
    _ddCatLoading = false;
    if (!it && !ru && !su) return;
    const cat = { ver: DD_VER, items: {}, runes: {}, trees: {}, spells: {} };
    if (it && it.data) {
      Object.entries(it.data).forEach(([id, d]) => {
        const k = ddNorm(d.name); if (!k) return;
        const sr = !d.maps || d.maps['11'] !== false;
        const prev = cat.items[k];
        if (!prev || (sr && !prev.sr) || (sr === prev.sr && +id < +prev.id)) cat.items[k] = { id, sr };
      });
      Object.keys(cat.items).forEach(k => { cat.items[k] = cat.items[k].id; });
    }
    if (Array.isArray(ru)) ru.forEach(t => {
      cat.trees[ddNorm(t.name)] = t.icon;
      (t.slots || []).forEach(s => (s.runes || []).forEach(x => { cat.runes[ddNorm(x.name)] = x.icon; }));
    });
    // només la versió de la Grieta (CLASSIC): hi ha duplicats d'altres modes amb el mateix nom
    if (su && su.data) Object.values(su.data).forEach(s => { if ((s.modes || []).includes('CLASSIC') && s.image) cat.spells[ddNorm(s.name)] = s.image.full; });
    ['items', 'runes', 'trees', 'spells'].forEach(k => { if (!Object.keys(cat[k]).length) cat[k] = DD_CAT_DEFAULT[k]; });
    DD_CAT = cat;
    try { localStorage.setItem(DD_CAT_KEY, JSON.stringify(cat)); } catch (e) {}
    try { const sec = document.getElementById('strategySection'); if (sec && sec.style.display !== 'none' && typeof generateStrategy === 'function') generateStrategy(); } catch (e) {}
  });
}
function itemUrl(name) {
  if (!DD_CAT) return null;
  const k = ddNorm(name), keys = ITEM_ALIAS[k] || [k];
  for (const kk of keys) { const id = DD_CAT.items[kk]; if (id) return `https://ddragon.leagueoflegends.com/cdn/${DD_CAT.ver}/img/item/${id}.png`; }
  return null;
}
function runeUrl(name) { const p = DD_CAT && (DD_CAT.runes[ddNorm(name)] || DD_CAT.trees[ddNorm(name)]); return p ? `https://ddragon.leagueoflegends.com/cdn/img/${p}` : null; }
function spellUrl(name) { const f = DD_CAT && DD_CAT.spells[ddNorm(name)]; return f ? `https://ddragon.leagueoflegends.com/cdn/${DD_CAT.ver}/img/spell/${f}` : null; }
function shardUrl(name) { const f = SHARD_ICON[ddNorm(name)]; return f ? `https://ddragon.leagueoflegends.com/cdn/img/perk-images/StatMods/${f}.png` : null; }
// Icona genèrica: si no hi ha imatge, xip de text
function gIcon(url, label, size, why, cls) {
  const t = escapeHtml(label + (why ? ' — ' + why : ''));
  const short = escapeHtml(label.length > 14 ? label.slice(0, 13) + '…' : label);
  return url
    ? `<span class="gi ${cls || ''}" style="width:${size}px;height:${size}px;" title="${t}" data-n="${t}"><img src="${url}" alt="" loading="lazy" onerror="this.parentNode.classList.add('gi-fail')"><i>${short}</i></span>`
    : `<span class="gi gi-txt ${cls || ''}" title="${t}" data-n="${t}"><i>${short}</i></span>`;
}
// "A / B", "A o B", "A → B", "A + B" amb notes entre parèntesis
function itemTokens(str) {
  const notes = []; const clean = String(str || '').replace(/\(([^)]*)\)/g, (_, n) => { notes.push(n); return ''; }).trim();
  const parts = clean.split(/\s+(\/|o|→|\+)\s+/);
  const out = [];
  for (let i = 0; i < parts.length; i += 2) out.push({ name: parts[i].trim(), sep: parts[i + 1] || '' });
  return { list: out.filter(x => x.name), note: notes.join('; ') };
}
function itemsHtml(str, size, why) {
  const { list, note } = itemTokens(str);
  const w = [why, note].filter(Boolean).join(' · ');
  return list.map(x => {
    const nm = /^poció de vida$/i.test(x.name) ? 'Health Potion' : /^objecte de suport/i.test(x.name) ? 'objecte de suport' : x.name;
    const lbl = nm === 'objecte de suport' ? 'Objecte de suport' : nm;
    return gIcon(itemUrl(nm), lbl, size, w) + (x.sep ? `<span class="bi-sep">${x.sep === 'o' ? '/' : escapeHtml(x.sep)}</span>` : '');
  }).join('');
}
function treeHtml(str, big) {
  const i = String(str).indexOf(': ');
  const tree = i > 0 ? str.slice(0, i) : str, minors = i > 0 ? str.slice(i + 2).split(' · ') : [];
  // "Last Stand (o Cut Down contra frontline)" / "Font of Life o Demolish": mostra les opcions amb la nota com a motiu
  const one = m => {
    const note = (m.match(/\(([^)]*)\)/) || [])[1] || '';
    const alt = note.match(/^o\s+(.+?)(\s+contra.*)?$/);
    const opts = m.replace(/\([^)]*\)/g, '').split(/\s+o\s+/).map(x => x.trim()).filter(Boolean);
    if (alt) opts.push(alt[1].trim());
    return opts.map(o => gIcon(runeUrl(o), o, 26, note, 'gi-rune')).join('<span class="bi-sep">/</span>');
  };
  return gIcon(runeUrl(tree), tree, big ? 22 : 20, '', 'gi-tree') + minors.map(one).join('');
}
function buildIconsHtml(b, uid) {
  const sums = String(b.summoners).replace(/\(([^)]*)\)/g, '').split('+').map(s => s.trim()).filter(Boolean);
  const sumWhy = (String(b.summoners).match(/\(([^)]*)\)/) || [])[1] || '';
  const shards = String(b.shards).split(' · ').map(s => { const k = s.indexOf(': '); return k > 0 ? s.slice(k + 2) : s; });
  const order = b.order ? b.order.map((o, i) => `<span class="bi-step"><b>${i + 1}</b>${itemsHtml(o.item, 36, o.why)}</span>`).join('')
    : b.core.map((c, i) => `<span class="bi-step"><b>${i + 1}</b>${itemsHtml(c, 36, 'core')}</span>`).join('') + (b.situ.length ? `<span class="bi-sep">|</span>${b.situ.map(z => itemsHtml(z.item, 30, z.why)).join('')}` : '');
  return `<div class="bi-box" data-cap="${uid}">
    <div class="bi-row"><span class="bi-lbl">Runes</span>${gIcon(runeUrl(b.keystone), b.keystone, 38, b.keyWhy, 'gi-key')}${treeHtml(b.primary, true)}<span class="bi-sep">|</span>${treeHtml(b.secondary)}<span class="bi-sep">|</span>${shards.map(s => gIcon(shardUrl(s), s, 20, '', 'gi-shard')).join('')}</div>
    <div class="bi-row"><span class="bi-lbl">Sums</span>${sums.map(s => gIcon(spellUrl(s), s, 30, sumWhy)).join('')}<span class="bi-lbl bi-lbl2">Inici</span>${itemsHtml(b.start, 30)}<span class="bi-lbl bi-lbl2">Botes</span>${itemsHtml(b.boots, 30)}</div>
    <div class="bi-row bi-build"><span class="bi-lbl">Build</span>${order}</div>
    <div class="bi-cap" id="bicap_${uid}"></div>
  </div>`;
}
renderBuildsHtml = function (s) {
  ddLoadCatalog();
  const blocks = s.lanes.filter(l => l.build).map((l, k) => {
    const b = l.build;
    const notes = b.notes.length ? `<div class="bi-notes">${b.notes.map(n => `• ${escapeHtml(n)}`).join('<br>')}</div>` : '';
    return `<div style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.08);font-size:0.8rem;">
      <div style="margin-bottom:4px;display:flex;align-items:center;gap:6px;flex-wrap:wrap;"><span class="role-tag">${l.role.toUpperCase()}</span>${champIcon(l.champ, 26)} <strong>${escapeHtml(l.champ)}</strong>
        <span style="color:var(--text-muted);">· ${escapeHtml(l.player.name.split('#')[0])} · ${escapeHtml(b.label)}</span>
        <a href="${escapeHtml(uggUrl(l.champ, l.role))}" target="_blank" rel="noopener" style="color:var(--blue);font-size:0.74rem;">stats reals (u.gg) ↗</a></div>
      ${buildIconsHtml(b, 'b' + k)}${notes}
    </div>`;
  }).join('');
  return `<div class="strat-card" style="grid-column: 1 / -1;">
    <h4>🛠️ Runes i build recomanades (segons els dos drafts)</h4>
    <p style="color:var(--text-muted);font-size:0.72rem;margin-bottom:4px;">Base: la build més jugada a op.gg (Emerald+, parc 26.23) quan n'hi ha dades; si no, plantilla per arquetip. Després s'ajusta als dos drafts. Toca o passa per sobre d'una icona per veure'n el nom i el motiu. Icones oficials de Riot (Data Dragon); sense connexió es mostra el nom.</p>
    ${blocks || '<p>Assigna campions als rols per veure runes i build.</p>'}
  </div>`;
};
(function biCaption() {
  const show = ev => {
    const g = ev.target.closest && ev.target.closest('.bi-box .gi'); if (!g) return;
    const box = g.closest('.bi-box'), cap = box && document.getElementById('bicap_' + box.dataset.cap);
    if (cap) cap.textContent = g.dataset.n;
  };
  try { document.addEventListener('click', show); document.addEventListener('mouseover', show); } catch (e) {}
})();
(function rStyles() {
  const css = `
  .cr-grid { display:grid; grid-template-columns:repeat(5, 1fr); gap:6px; margin:6px 0 4px; }
  .cr-col { display:flex; flex-direction:column; align-items:center; min-width:0; }
  .cr-role { font-size:0.6rem; color:var(--text-muted); font-weight:700; margin-bottom:2px; }
  .cr-main .ci { width:44px; height:44px; }
  .cr-name { font-size:0.62rem; max-width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; margin-top:2px; }
  .cr-alts, .cr-meta { display:flex; flex-wrap:wrap; justify-content:center; gap:2px; margin-top:3px; }
  .cr-alt .ci { width:20px; height:20px; border-radius:4px; }
  .comp-card.selected-comp .cr-alt .ci { width:26px; height:26px; }
  .cr-out .ci { border-style:dashed; opacity:0.75; }
  .cr-more { font-size:0.6rem; color:var(--text-muted); align-self:center; }
  .cr-mine .ci { border:2px solid var(--gold); box-shadow:0 0 0 1px rgba(200,155,60,0.4); }
  .cr-off .ci { opacity:0.3; } .cr-off .ci img { filter:grayscale(1); }
  .cr-var { font-size:0.62rem; color:var(--blue); font-weight:600; margin-left:4px; }
  .cr-legend { font-size:0.66rem; color:var(--text-muted); margin:4px 0; line-height:1.35; }
  .bi-box { margin:4px 0; }
  .bi-row { display:flex; flex-wrap:wrap; align-items:center; gap:4px; margin:4px 0; }
  .bi-lbl { font-size:0.62rem; font-weight:800; color:var(--gold); text-transform:uppercase; min-width:42px; }
  .bi-lbl2 { min-width:0; margin-left:8px; }
  .bi-sep { color:var(--text-muted); font-size:0.7rem; margin:0 2px; }
  .bi-step { display:inline-flex; align-items:center; gap:2px; margin-right:4px; }
  .bi-step > b { font-size:0.6rem; color:var(--text-muted); }
  .gi { position:relative; display:inline-flex; align-items:center; justify-content:center; border-radius:6px; overflow:hidden; background:#13233D; border:1px solid rgba(200,155,60,0.35); flex:0 0 auto; cursor:help; }
  .gi img { width:100%; height:100%; object-fit:cover; display:block; }
  .gi i { display:none; font-style:normal; font-size:0.58rem; line-height:1.1; padding:2px 4px; text-align:center; color:var(--text-main); }
  .gi.gi-fail img { display:none; } .gi.gi-fail { width:auto !important; height:auto !important; min-height:22px; } .gi.gi-fail i { display:block; }
  .gi.gi-txt { min-height:22px; } .gi.gi-txt i { display:block; }
  .gi-key { border-radius:50%; border-color:var(--gold); background:#0A1428; }
  .gi-rune, .gi-tree, .gi-shard { border-radius:50%; background:#0A1428; }
  .gi-rune img, .gi-tree img, .gi-shard img, .gi-key img { object-fit:contain; padding:2px; box-sizing:border-box; }
  .bi-cap { font-size:0.68rem; color:var(--blue); min-height:1em; }
  .bi-notes { font-size:0.7rem; color:var(--text-muted); margin-top:4px; }
  `;
  try { const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); } catch (e) {}
})();
setTimeout(() => { try { ddLoadCatalog(); } catch (e) {} }, 1500);
