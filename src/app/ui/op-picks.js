// ===== Pantalla: op-picks-i-counters (separat del motor) =====
(function uStyles() {
  const css = `.fl-op, .fl-ct { display:inline-block; font-family:'Segoe UI',system-ui,sans-serif; font-size:0.6rem; font-weight:800; padding:1px 5px; border-radius:3px; vertical-align:middle; margin-left:3px; letter-spacing:0; }
  .fl-op { background:var(--gold); color:#010A13; }
  .fl-ct { background:rgba(10,200,185,0.2); color:var(--blue); border:1px solid rgba(10,200,185,0.5); }
  .adv-flags { font-size:0.78rem; line-height:1.5; margin:2px 0 6px; }`;
  try { const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); } catch (e) {}
})();
