// ===== Bloc Q: filtres per rol (commutables) i per estil, rols reals dels picks, tooltip amb icones =====
// Rols reals d'un campió: els públics o amb taxa de pick >= 3%. Un pool d'un jugador en un rol on el campió
// no es juga (p. ex. Caitlyn al Top) no el converteix en flex.
// Rols viables: els que tenen almenys un 5% dels picks reals del campió (metabot.gg). Sense dades, els públics.
// + rols propis de l'equip (data.json → hextech_teamroles_v1): combinacions poc habituals que l'equip juga de veritat

function setRoleFilter(role, pill) {
  if (state.roleFilter === role && role !== 'ALL') role = 'ALL';
  state.roleFilter = role;
  const box = document.getElementById('roleFilters');
  if (box) box.querySelectorAll('.pill').forEach(p => p.classList.toggle('active', (p.getAttribute('onclick') || '').includes(`'${role}'`)));
  renderChampGrid();
}
function toggleTagFilter(tag) {
  if (state.tagFilters.has(tag)) state.tagFilters.delete(tag); else state.tagFilters.add(tag);
  renderTagFilters(); renderChampGrid();
}
function clearTagFilters() { state.tagFilters.clear(); renderTagFilters(); renderChampGrid(); }
function renderTagFilters() {
  let el = document.getElementById('tagFilters');
  if (!el) {
    const rf = document.getElementById('roleFilters'); if (!rf) return;
    el = document.createElement('div'); el.className = 'filter-pills tag-pills'; el.id = 'tagFilters';
    rf.parentNode.insertBefore(el, rf.nextSibling);
  }
  el.innerHTML = TAG_FILTERS.map(([t, l]) => `<span class="pill ${state.tagFilters.has(t) ? 'active' : ''}" onclick="toggleTagFilter('${t}')">${l}</span>`).join('')
    + (state.tagFilters.size ? '<span class="pill pill-clear" onclick="clearTagFilters()">✕ Treu estils</span>' : '');
}

// Tooltip net: una fila de 3 icones per a counters i una per a sinergies
function tipCell(c, metric, who) {
  return `<div class="ct-cell">${champIcon(c, 54)}<div class="ct-name">${escapeHtml(c)}</div>${metric ? `<div class="ct-met">${escapeHtml(metric)}</div>` : ''}${who && who.length ? `<div class="ct-who">👤 ${escapeHtml(who.join('/'))}</div>` : ''}</div>`;
}
function counterTipHtml(e) {
  const list = counterCandidates(e, 3);
  const info = enemyRoleInfo(), dist = (info.dist && info.dist[e]) || roleDistOfChamp(e);
  const roles = ROLE_ORDER.filter((r, i) => dist[i] >= 0.25).join('/') || champRoles(e).join('/');
  const cRow = list.length ? `<div class="ct-grid">${list.map(x => { const m = muScore(x.champ, e); return tipCell(x.champ, m.real ? `${m.wr}% vs ${e.split(' ')[0]}` : (x.why[0] || ''), x.who); }).join('')}</div>`
    : '<div class="ct-empty">Cap counter clar disponible.</div>';
  const syn = synergyCandidates(e, 3), enemy = getEnemyPicks().includes(e);
  const sRow = syn.length ? `<div class="ct-grid">${syn.map(s => tipCell(s.champ, s.real ? `duo ${s.real.wr}%` : (s.why[0] || ''), s.who)).join('')}</div>`
    : '<div class="ct-empty">Cap parella clara disponible.</div>';
  return `<div class="ct-head">${champIcon(e, 26)} <strong>${escapeHtml(e)}</strong> <small>${escapeHtml(roles)}</small></div>
    <div class="ct-sec">🛡️ Counters</div>${cRow}
    <div class="ct-sec">🤝 Sinergies${enemy ? ' <small>(les voldran ells)</small>' : ''}</div>${sRow}`;
}
(function qStyles() {
  const css = `
  .tag-pills { margin-top:-4px; }
  .tag-pills .pill { font-size:0.72rem; padding:4px 9px; opacity:0.9; }
  .tag-pills .pill.active { opacity:1; }
  .tag-pills .pill-clear { border-color:rgba(255,138,155,0.5); color:#FF8A9B; }
  #counterTip { max-width:320px !important; width:300px; }
  #counterTip .ct-head { display:flex; align-items:center; gap:6px; }
  #counterTip .ct-sec, #tipBody .ct-sec { font-size:0.72rem; font-weight:700; color:var(--gold); margin:8px 0 4px; }
  .ct-grid { display:grid; grid-template-columns:repeat(3, 1fr); gap:6px; }
  .ct-cell { display:flex; flex-direction:column; align-items:center; text-align:center; min-width:0; }
  .ct-cell .ci { margin-bottom:3px; }
  .ct-name { font-size:0.72rem; font-weight:700; max-width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .ct-met { font-size:0.64rem; color:var(--blue); max-width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .ct-who { font-size:0.6rem; color:var(--text-muted); max-width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .ct-empty { font-size:0.72rem; color:var(--text-muted); }
  `;
  try { const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); } catch (e) {}
})();
setTimeout(() => { try { renderTagFilters(); } catch (e) {} }, 0);

