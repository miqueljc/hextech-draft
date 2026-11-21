// ===== Pantalla: opgg-equip (separat del motor) =====
function renderPlayerSheets() {
  const el = document.getElementById('playerSheets');
  if (!el) return;
  el.innerHTML = `<div class="panel-header"><span>📊 Fitxes dels jugadors (op.gg, ${OPGG_SNAPSHOT_DATE})</span></div>
    <p style="font-size:0.76rem;color:var(--text-muted);margin-bottom:8px;">Dades de la temporada 2026 (solo + flex + 5s). La valoració de cada campió combina winrate suavitzat i volum de partides: pocs partits no inflen un 100%. Els campions amb historial negatiu es penalitzen a recomanacions i assignació; un jugador en mala ratxa (últimes 20 partides ≥8 punts per sota de la temporada) prioritza els seus picks de comfort.</p>
    <div style="overflow-x:auto;"><table><thead><tr><th>Jugador</th><th>Fitxa</th></tr></thead><tbody>${ROSTER.map((pl, pi) => `<tr><td style="white-space:nowrap;"><strong>${escapeHtml(shortName(pi))}</strong><br><span class="role-tag">${pl.role.toUpperCase()}</span></td><td>${playerCardHtml(pi)}</td></tr>`).join('')}</tbody></table></div>
    <div style="margin-top:12px;">${duoHtml('🤝 Millors dúos Bot + Support segons dades', 'Bot', 'Sup')}${duoHtml('🌲 Millors dúos Jungla + Mid segons dades', 'Jg', 'Mid')}</div>`;
}
