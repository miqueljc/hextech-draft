// ===== Pantalla: fearless (separat del motor) =====
function updateFearlessBtn() {
  const btn = document.getElementById('btnFearless');
  if (!btn) return;
  const n = state.series.games.length;
  btn.textContent = state.fearless ? `⚔️ Fearless: ON (partida ${n + 1})` : '⚔️ Fearless: OFF';
  btn.className = state.fearless ? 'btn btn-active-red' : 'btn';
}
function renderFearlessPanel() {
  updateFearlessBtn();
  const el = document.getElementById('fearlessPanel');
  if (!el) return;
  if (!state.fearless) { el.style.display = 'none'; return; }
  el.style.display = 'block';
  const games = state.series.games;
  const hist = games.length ? games.map(g => `<div style="font-size:0.74rem;margin-top:2px;">Partida ${g.n} (${g.result === 'W' ? '✅ victòria' : '❌ derrota'}) — nosaltres: ${g.us.map(escapeHtml).join(', ')} · rival: ${g.enemy.map(escapeHtml).join(', ')}</div>`).join('') : '<div style="font-size:0.74rem;color:var(--text-muted);">Cap partida jugada encara.</div>';
  const blockedUs = fearlessBlocked(state.ourSide);
  const depth = ROSTER.map((pl, p) => playerRoles(p).map(r => {
    const rem = fearlessRemaining(p, r).length, tot = poolOf(p, r).length;
    const col = rem <= 2 ? '#FF8A9B' : rem <= 4 ? 'var(--orange)' : 'var(--text-muted)';
    return `<span style="color:${col};margin-right:10px;white-space:nowrap;">${escapeHtml(shortName(p))} ${r}: <strong>${rem}/${tot}</strong></span>`;
  }).join('')).join('<br>');
  el.innerHTML = `<div style="background:rgba(255,120,60,0.08);border:1px solid rgba(255,120,60,0.35);border-radius:8px;padding:10px;margin-bottom:12px;font-size:0.8rem;">
    <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;align-items:center;">
      <strong style="color:var(--orange);">⚔️ Sèrie Fearless — partida ${games.length + 1}</strong>
      <span style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
        <select onchange="setFearlessRule(this.value)"><option value="BOTH" ${state.fearlessRule === 'BOTH' ? 'selected' : ''}>Bloqueja els picks dels dos equips</option><option value="OWN" ${state.fearlessRule === 'OWN' ? 'selected' : ''}>Cada equip només perd els seus picks</option></select>
        <button class="btn" onclick="closeGame('W')">✅ Victòria i següent</button>
        <button class="btn" onclick="closeGame('L')">❌ Derrota i següent</button>
        <button class="btn" onclick="newSeries()">↺ Nova sèrie</button>
      </span>
    </div>
    ${hist}
    <div style="margin-top:6px;"><strong>Pool restant (nostre):</strong><br>${depth}</div>
    <div style="margin-top:4px;color:var(--text-muted);font-size:0.74rem;">Bloquejats per a nosaltres: ${blockedUs.size ? [...blockedUs].map(escapeHtml).join(', ') : '—'}. Quan un rol baixa de 4 campions, el motor penalitza gastar-ne un altre.</div>
  </div>`;
}
