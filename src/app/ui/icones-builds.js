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
function renderBuildsHtml(s) {
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
}
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

