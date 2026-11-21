// ===== Pantalla: pla-detallat (separat del motor) =====
(function wStyles() {
  const css = `.dp-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; font-size:0.8rem; }
  .dp-grid ul { margin:4px 0 0 18px; padding:0; line-height:1.45; }
  .dp-grid li { margin-bottom:4px; }
  .dp-src { color:var(--text-muted); font-size:0.72rem; margin-top:6px; }
  @media (max-width: 700px) { .dp-grid { grid-template-columns:1fr; } }`;
  try { const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st); } catch (e) {}
})();
