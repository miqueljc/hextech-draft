// ================= DADES I EDITORS (op.gg, counters, sinergies, tier list, etiquetes) =================



function analyzeOpgg(pi) {
  const el = document.getElementById('opggText_' + pi);
  if (el) opggDraft[pi] = el.value;
  opggPreview[pi] = parseOpgg(el ? el.value : '');
  renderOpggImport();
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

function setMsg(id, txt) { const el = document.getElementById(id); if (el) el.textContent = txt; }
function saveCounters() {
  const { out, bad } = parseCounters(document.getElementById('countersText').value);
  lsSet(LS.counters, out);
  afterDataChange();
  setMsg('countersMsg', bad.length ? `Desat. Ignorat (no reconegut): ${bad.join(' · ')}` : `Desat: ${Object.keys(out).length} campions amb counters.`);
}
function saveSynergy() {
  const { out, bad } = parseSynergy(document.getElementById('synergyText').value);
  lsSet(LS.syn, out);
  afterDataChange();
  setMsg('synergyMsg', bad.length ? `Desat. Ignorat: ${bad.join(' · ')}` : `Desat: ${out.length} parelles. S'han regenerat les comps.`);
}

function saveTier() {
  const src = (document.getElementById('tierSource').value || '').trim() || 'manual';
  const { raw, bad, n } = parseTier(document.getElementById('tierText').value);
  if (n < 20) { setMsg('tierMsg', `No desat: només s'han reconegut ${n} campions. Format: "Top S+: Darius, Sett" (una línia per rol i tier).`); return; }
  lsSet(LS.tier, { source: src, raw });
  afterDataChange();
  setMsg('tierMsg', `Desat com a tier list del parc ${src} (${n} entrades).` + (bad.length ? ` Ignorat: ${bad.slice(0, 8).join(' · ')}` : ''));
}
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

// Torna a aplicar totes les dades (locals i compartides) al motor i redibuixa totes les pestanyes
function afterDataChange() {
  applyDataChange();
  renderRosterTable();
  renderCompsTable();
  renderProTab();
  if (typeof renderPatchTab === 'function') renderPatchTab();
  renderDataTab();
  renderPatchBanner();
  renderAll();
  try { refreshSharedRival(); renderScout(); } catch (e) { console.warn('rivals', e); }
}

