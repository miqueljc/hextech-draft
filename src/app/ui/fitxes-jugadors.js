// ===== Pantalla: fitxes de jugadors i duos =====
// ---- Fitxes de jugador, dúos i anàlisi d'equip ----
function playerCardHtml(pi) {
  const pl = ROSTER[pi];
  const share = ROLE_ORDER.filter(r => (pl.roleShare[r] || 0) >= 3).sort((a, b) => pl.roleShare[b] - pl.roleShare[a]).map(r => `${r} ${pl.roleShare[r]}%`).join(' · ');
  const entries = Object.entries(pl.stats || {}).map(([c, s]) => ({ c, g: s.w + s.l, r: champRating(pi, c) }));
  const best = entries.filter(e => e.g >= 6).sort((a, b) => b.r - a.r).slice(0, 5);
  const avoid = entries.filter(e => e.g >= 8 && e.r <= -6).sort((a, b) => a.r - b.r).slice(0, 4);
  const form = pl.recent == null ? '' : playerSlump(pi) ? `<span class="badge-target">mala ratxa: ${pl.recent}% últimes 20 (temporada ${pl.season}%)</span>` : playerHot(pi) ? `<span class="badge-wr">🔥 en ratxa: ${pl.recent}% últimes 20 (temporada ${pl.season}%)</span>` : `<span class="badge-pool">forma estable: ${pl.recent}% últimes 20 (temporada ${pl.season}%)</span>`;
  const mism = pl.roleShare[pl.role] < 30 ? `<div style="color:var(--orange);font-size:0.74rem;margin-top:3px;">⚠️ El seu rol de torneig (${pl.role}) només és el ${pl.roleShare[pl.role]}% de les seves partides a op.gg: poques dades reals a ${pl.role}.</div>` : '';
  return `<div style="font-size:0.78rem;"><strong>${escapeHtml(pl.rank)}</strong><br>Rols a op.gg: ${share}<br>${form}${mism}
    <div style="margin-top:4px;color:var(--green);">✅ Millors: ${best.map(e => `${escapeHtml(e.c)} ${statText(pi, e.c)}`).join(' · ') || '—'}</div>
    ${avoid.length ? `<div style="color:#FF8A9B;">⛔ Evitar: ${avoid.map(e => `${escapeHtml(e.c)} ${statText(pi, e.c)}`).join(' · ')}</div>` : ''}</div>`;
}
function duoHtml(title, rA, rB) {
  const l = duoSuggestions(rA, rB, 6);
  return `<div style="margin-bottom:10px;"><strong style="color:var(--gold);">${title}</strong><ul style="margin-top:4px;font-size:0.78rem;">${l.map(o => `<li><strong>${escapeHtml(o.c1)}</strong> (${escapeHtml(shortName(o.p))}${champStat(o.p, o.c1) ? ' ' + statText(o.p, o.c1) : ''}) + <strong>${escapeHtml(o.c2)}</strong> (${escapeHtml(shortName(o.q))}${champStat(o.q, o.c2) ? ' ' + statText(o.q, o.c2) : ''})${synergyOf(o.c1, o.c2) ? ' · sinergia' : ''}</li>`).join('') || '<li>—</li>'}</ul></div>`;
}
