// ===== Pantalla: arquetips-i-plantilles (separat del motor) =====
// ---- Pestanya amb el context del parc ----
function renderPatchTab() {
  const el = document.getElementById('patchContent');
  if (!el) return;
  const chg = Object.entries(PATCH_CHANGES).sort((a, b) => b[1].delta - a[1].delta);
  const tierRows = [['Top', 'T'], ['Jungle', 'J'], ['Mid', 'M'], ['ADC', 'B'], ['Support', 'S']].map(([label, k]) => {
    const t = TIER_RAW[k];
    return `<tr><td><strong>${label}</strong></td><td style="color:var(--gold);">${t['S+'].join(', ')}</td><td>${t['S'].join(', ')}</td><td style="color:var(--text-muted);">${t['A'].join(', ')}</td></tr>`;
  }).join('');
  el.innerHTML = `
    <div class="panel-header"><span>📈 Context del parc ${PATCH_META.patch} (${PATCH_META.date})</span></div>
    <p style="font-size:0.8rem;color:var(--orange);margin-bottom:10px;">${PATCH_META.note}</p>
    <h4 style="color:var(--gold);margin:8px 0;">Canvis de campions</h4>
    <table class="data-table"><thead><tr><th>Campió</th><th>Efecte</th><th>Detall</th></tr></thead><tbody>
    ${chg.map(([c, v]) => `<tr><td><strong>${escapeHtml(c)}</strong></td><td style="color:${v.delta > 0 ? 'var(--green)' : '#FF8A9B'};">${v.delta > 0 ? '▲ buff' : '▼ nerf'}</td><td style="font-size:0.78rem;">${escapeHtml(v.note)}</td></tr>`).join('')}
    </tbody></table>
    <h4 style="color:var(--gold);margin:14px 0 8px;">Objectes, runes i sistemes</h4>
    <ul style="font-size:0.8rem;padding-left:18px;">${PATCH_ITEM_NOTES.map(n => `<li style="margin-bottom:4px;">${escapeHtml(n)}</li>`).join('')}</ul>
    <h4 style="color:var(--gold);margin:14px 0 4px;">Meta per rol (tier list 26.23, Skill Capped)</h4>
    <p style="font-size:0.74rem;color:var(--text-muted);margin-bottom:6px;">${PATCH_META.tierNote} Puntuació usada: S+ = +10, S = +6, A = +2 a les recomanacions.</p>
    <table class="data-table"><thead><tr><th>Rol</th><th>S+</th><th>S</th><th>A</th></tr></thead><tbody>${tierRows}</tbody></table>
    <h4 style="color:var(--gold);margin:14px 0 4px;">Fonts</h4>
    <ul style="font-size:0.76rem;padding-left:18px;">
      <li><a style="color:var(--blue);" target="_blank" rel="noopener" href="https://www.leagueoflegends.com/en-us/news/game-updates/league-of-legends-patch-26-23-notes/">Notes oficials del 26.23 (Riot)</a>, <a style="color:var(--blue);" target="_blank" rel="noopener" href="https://gameriv.com/league-of-legends-patch-26-23-preview/">preview (GameRiv)</a> i <a style="color:var(--blue);" target="_blank" rel="noopener" href="https://draftcoach.gg/patch-notes/26-23/">DraftCoach</a></li>
      <li><a style="color:var(--blue);" target="_blank" rel="noopener" href="https://www.skill-capped.com/lol/guides/stats">Tier list 26.23 (Skill Capped, Emerald+)</a></li>
      <li><a style="color:var(--blue);" target="_blank" rel="noopener" href="https://leagueoflegends.com/en-us/news/game-updates/league-of-legends-patch-26-9-notes">Notes oficials 26.9: runes, botes i objectes de la Season 2</a></li>
      <li><a style="color:var(--blue);" target="_blank" rel="noopener" href="https://wecoach.gg/blog/article/every-new-item-in-lol-season-2026">Objectes nous de la temporada 2026 (WeCoach)</a></li>
    </ul>`;
}
function renderPatchNotesHtml(s) {
  if (!s.patchNotes.length) {
    return `<div class="strat-card"><h4>📈 Canvis del 26.23 als vostres picks</h4><p>Cap dels campions d'aquest draft té canvis anunciats al 26.23.</p></div>`;
  }
  return `<div class="strat-card"><h4>📈 Canvis del 26.23 en aquest draft</h4>
    <ul>${s.patchNotes.map(p => `<li><strong>${escapeHtml(p.champ)}</strong> (${p.team}) <span style="color:${p.delta > 0 ? 'var(--green)' : '#FF8A9B'};">${p.delta > 0 ? '▲ buff' : '▼ nerf'}</span>: ${escapeHtml(p.note)}</li>`).join('')}</ul>
    <p style="color:var(--text-muted);font-size:0.72rem;margin-top:4px;">Preview oficial: els valors poden variar a les notes finals.</p></div>`;
}
