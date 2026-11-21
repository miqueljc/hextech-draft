// ===== Pantalla: rivals-compartits (separat del motor) =====
// En editar la fitxa a mà deixa de seguir la versió compartida
(function sStyles() {
  const css = `.rv-box{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:6px}
  .rv-box select{background:#050B14;border:1px solid var(--border-gold);color:var(--text-main);border-radius:6px;padding:5px 8px;font-size:0.78rem;max-width:100%}
  .rv-meta{font-size:0.66rem;color:var(--text-muted);width:100%}`;
  try { const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); } catch (e) {}
})();
function sharedRivalsHtml() {
  const teams = sharedRivals(); if (!teams.length) return '';
  const cur = state.scout && state.scout.sharedId;
  return `<div class="rv-box"><span style="font-size:0.72rem;color:var(--text-muted);">📥 Rivals preparats:</span>
    <select id="rvSel" onchange="if(this.value)loadSharedRival(this.value)"><option value="">Tria un rival…</option>${teams.map(t => `<option value="${escapeHtml(t.id)}" ${t.id === cur ? 'selected' : ''}>${escapeHtml(t.name || t.id)} (${escapeHtml(t.updated || '')})</option>`).join('')}</select>
    ${cur ? `<span class="rv-meta">Carregat: ${escapeHtml(state.scout.team)} · ${escapeHtml(state.scout.updated || '')}${state.scout.source ? ' · ' + escapeHtml(state.scout.source) : ''}</span>` : ''}</div>`;
}
