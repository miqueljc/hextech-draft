// ===== Bloc S: fitxes de rivals compartides (data.json → hextech_rivals_v1) =====
// Format: { teams: [ { id, name, updated: 'AAAA-MM-DD', source, players: [ { name: 'Nom#TAG', role, roleAuto, games, champs: [ { champ, games, wr } ] } ] } ] }
function sharedRivals() {
  const r = lsGet('hextech_rivals_v1');
  return r && Array.isArray(r.teams) ? r.teams.filter(t => t && t.id && Array.isArray(t.players)) : [];
}
function rivalToScout(t) {
  const byRole = {};
  t.players.forEach(p => { const r = ROLE_ORDER.includes(p.role) ? p.role : (ROLE_ORDER.includes(p.roleAuto) ? p.roleAuto : null); if (r && !byRole[r]) byRole[r] = p; });
  const rest = t.players.filter(p => !Object.values(byRole).includes(p));
  const players = ROLE_ORDER.map(r => {
    const p = byRole[r] || rest.shift();
    if (!p) return { name: '', role: r, text: '', champs: [] };
    const champs = (p.champs || []).map(o => ({ champ: canonChamp(o.champ) || o.champ, games: +o.games || 0, wr: +o.wr || 50 })).filter(o => CHAMP_DATA[o.champ]).slice(0, 12);
    return { name: p.name || '', role: r, text: champs.map(o => `${o.champ} ${o.wr}% ${o.games} partides`).join('\n'), champs };
  });
  return { team: t.name || t.id, otps: (state.scout && state.scout.otps) || '', sharedId: t.id, updated: t.updated || '', source: t.source || '', players };
}
function loadSharedRival(id) {
  const t = sharedRivals().find(x => x.id === id); if (!t) return;
  state.scout = rivalToScout(t);
  _scoutCache = null; saveScout(); renderScout(); renderAll();
}
// Si la fitxa carregada té una versió més nova a les dades compartides, s'actualitza sola
function refreshSharedRival() {
  const s = state.scout; if (!s || !s.sharedId) return false;
  const t = sharedRivals().find(x => x.id === s.sharedId);
  if (!t || !t.updated || t.updated <= (s.updated || '')) return false;
  state.scout = rivalToScout(t); _scoutCache = null; saveScout(); return true;
}
function sharedRivalsHtml() {
  const teams = sharedRivals(); if (!teams.length) return '';
  const cur = state.scout && state.scout.sharedId;
  return `<div class="rv-box"><span style="font-size:0.72rem;color:var(--text-muted);">📥 Rivals preparats:</span>
    <select id="rvSel" onchange="if(this.value)loadSharedRival(this.value)"><option value="">Tria un rival…</option>${teams.map(t => `<option value="${escapeHtml(t.id)}" ${t.id === cur ? 'selected' : ''}>${escapeHtml(t.name || t.id)} (${escapeHtml(t.updated || '')})</option>`).join('')}</select>
    ${cur ? `<span class="rv-meta">Carregat: ${escapeHtml(state.scout.team)} · ${escapeHtml(state.scout.updated || '')}${state.scout.source ? ' · ' + escapeHtml(state.scout.source) : ''}</span>` : ''}</div>`;
}
// En editar la fitxa a mà deixa de seguir la versió compartida
(function sStyles() {
  const css = `.rv-box{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:6px}
  .rv-box select{background:#050B14;border:1px solid var(--border-gold);color:var(--text-main);border-radius:6px;padding:5px 8px;font-size:0.78rem;max-width:100%}
  .rv-meta{font-size:0.66rem;color:var(--text-muted);width:100%}`;
  try { const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); } catch (e) {}
})();

