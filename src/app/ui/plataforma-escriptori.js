// ===== Pantalla: peces pròpies de l'escriptori (el mòbil té les seves a src/mobile/plataforma-mobil.js) =====
function switchTab(tabId, btn) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
  document.getElementById('tab-' + tabId).classList.add('active');
  btn.classList.add('active');
}
function openDataTab() {
  document.querySelectorAll('.tab-content').forEach(e => e.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(e => e.classList.remove('active'));
  const t = document.getElementById('tab-data'); if (t) t.classList.add('active');
  const b = document.getElementById('btnTabData'); if (b) b.classList.add('active');
}
// Escriptori: porta-retalls i avís. El mòbil la substitueix pel full de compartir del sistema.
function deliverPlanText(out, nParts) {
  const done = () => alert(nParts > 1
    ? `✅ Pla copiat en ${nParts} missatges (separats per "⸻ MISSATGE n ⸻", límit de Discord: 2000 caràcters). Enganxa'ls per separat.`
    : '✅ Pla de partida copiat al porta-retalls llest per enganxar a Discord!');
  try { navigator.clipboard.writeText(out).then(done, done); } catch (e) { done(); }
}
// L'informe tàctic s'acaba de generar: a l'escriptori hi baixem
function showStrategySection(sec) { sec.scrollIntoView({ behavior: 'smooth' }); }
