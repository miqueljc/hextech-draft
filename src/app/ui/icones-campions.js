// ===== Bloc P: icones oficials dels campions (Riot Data Dragon) =====
let DD_VER = DD_VER_DEFAULT;
function champInitials(c) { const w = String(c).replace(/[^A-Za-z ]/g, '').split(' ').filter(Boolean); return (w.length > 1 ? w[0][0] + w[1][0] : String(c).slice(0, 2)).toUpperCase(); }
// size: píxels (0 = s'adapta a l'amplada del contenidor)
function champIcon(c, size, cls) {
  const st = size ? ` style="width:${size}px;height:${size}px;"` : '';
  return `<span class="ci ${cls || ''}"${st}><img src="${champImgUrl(c)}" alt="" loading="lazy" decoding="async" draggable="false" onerror="this.parentNode.classList.add('ci-fail')"><b>${escapeHtml(champInitials(c))}</b></span>`;
}
(function ddLatest() {
  try {
    if (typeof fetch !== 'function' || location.protocol === 'about:') return;
    fetch('https://ddragon.leagueoflegends.com/api/versions.json', { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(v => {
      if (!Array.isArray(v) || !/^\d+\.\d+\.\d+$/.test(v[0]) || v[0] === DD_VER) return;
      DD_VER = v[0];
      try { localStorage.setItem('hextech_ddver_v1', DD_VER); } catch (e) {}
      renderAll();
    }).catch(() => {});
  } catch (e) {}
})();
(function riotNotice() {
  try {
    const txt = 'Hextech Draft no està avalat per Riot Games i no reflecteix les opinions de Riot Games ni de ningú implicat oficialment en la producció o gestió de League of Legends. League of Legends i Riot Games són marques comercials o registrades de Riot Games, Inc. Icones dels campions: Riot Data Dragon.';
    ['tab-draft', 'tab-data'].forEach(id => {
      const t = document.getElementById(id); if (!t) return;
      const d = document.createElement('div'); d.className = 'riot-legal'; d.textContent = txt; t.appendChild(d);
    });
  } catch (e) {}
})();
(function ciStyles() {
  const css = `
  .ci { position:relative; display:inline-flex; align-items:center; justify-content:center; flex:0 0 auto; border-radius:6px; overflow:hidden; background:#13233D; border:1px solid rgba(200,155,60,0.35); vertical-align:middle; }
  .ci img { width:100%; height:100%; object-fit:cover; display:block; transform:scale(1.1); }
  .ci b { display:none; font-size:0.7rem; color:var(--gold); font-weight:800; }
  .ci.ci-fail img { display:none; } .ci.ci-fail b { display:block; }
  .champ-grid { grid-template-columns: repeat(auto-fill, minmax(76px, 1fr)) !important; }
  .champ-chip { padding:4px !important; align-items:stretch; gap:3px !important; min-height:0 !important; }
  .champ-chip .cc-top { position:relative; }
  .champ-chip .ci-grid { width:100%; aspect-ratio:1/1; height:auto; border-radius:5px; }
  .champ-chip .ci-grid b { font-size:1rem; }
  .champ-chip .cc-name { font-size:0.66rem; font-weight:700; text-align:center; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; line-height:1.15; color:var(--text-muted); }
  .champ-chip .badges { justify-content:center; min-height:0; }
  .champ-chip .badges:empty { display:none; }
  .champ-chip .cc-tag { position:absolute; font-size:0.6rem; font-weight:800; padding:0 4px; border-radius:3px; line-height:1.4; background:rgba(5,11,20,0.85); }
  .champ-chip .cc-tier { left:2px; top:2px; color:var(--gold-light); }
  .champ-chip .cc-rec { right:2px; top:2px; color:#050B14; background:var(--gold); }
  .champ-chip .cc-patch { right:2px; bottom:2px; } .champ-chip .cc-patch.up { color:var(--green); } .champ-chip .cc-patch.down { color:#FF8A9B; }
  .champ-chip .cc-pool { left:2px; bottom:2px; color:var(--blue); font-size:0.55rem; }
  .champ-chip .cc-hot { color:inherit; }
  .champ-chip.cc-inpool .ci-grid { border-color:rgba(10,200,185,0.7); }
  .champ-chip.cc-target { border-color:rgba(255,70,85,0.8) !important; box-shadow:inset 0 0 0 1px rgba(255,70,85,0.5); }
  .champ-chip.disabled .ci img { filter:grayscale(1); }
  .champ-chip.disabled { text-decoration:none !important; }
  .champ-chip.disabled .cc-name { text-decoration:line-through; }
  .ban-slot { height:auto !important; min-height:44px; gap:1px; }
  .ban-slot.filled { text-decoration:none !important; }
  .ban-slot .ci-ban img { filter:grayscale(0.85) brightness(0.8); }
  .ban-slot .ci-ban::after { content:''; position:absolute; left:-10%; top:50%; width:120%; height:2px; background:#FF4655; transform:rotate(-40deg); }
  .ban-slot .ban-name { font-size:0.58rem; max-width:100%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; text-decoration:line-through; }
  .ban-slot .ban-x { position:absolute; top:1px; right:3px; font-size:0.62rem; color:#fff; cursor:pointer; }
  .pick-slot .ci-pick { border-radius:8px; }
  #matchMode .mm-cell { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:1px; padding:3px 2px; }
  #matchMode .mm-cell .ci { width:42px; height:42px; }
  #matchMode .mm-cell.mm-bancell .ci { width:28px; height:28px; }
  #matchMode .mm-cell.mm-bancell .ci img { filter:grayscale(0.85) brightness(0.8); }
  #matchMode .mm-cell .mm-cn { font-size:0.56rem; max-width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  #matchMode .mm-bancell.mm-full { text-decoration:none !important; }
  #matchMode .mm-bancell.mm-full .mm-cn { text-decoration:line-through; }
  #matchMode .mm-card-h { align-items:center !important; }
  #matchMode .mm-card-h .mm-ch { display:flex; align-items:center; gap:10px; }
  #matchMode .mm-chip { justify-content:flex-start !important; }
  #matchMode .mm-chip .mm-chipt { flex:1; display:flex; flex-direction:column; min-width:0; }
  #matchMode .mm-chip .mm-chipt b { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  @media (max-width: 600px) { .champ-grid { grid-template-columns: repeat(auto-fill, minmax(54px, 1fr)) !important; gap:5px !important; } }
  .riot-legal { font-size:0.62rem; color:var(--text-muted); opacity:0.75; margin:14px 4px 4px; line-height:1.35; }
  `;
  try { const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); } catch (e) {}
})();

