// ===== Pantalla: aprenentatge (separat del motor) =====
init();
// Escriptori: porta-retalls i avís. El mòbil la substitueix pel full de compartir del sistema.
function deliverPlanText(out, nParts) {
  const done = () => alert(nParts > 1
    ? `✅ Pla copiat en ${nParts} missatges (separats per "⸻ MISSATGE n ⸻", límit de Discord: 2000 caràcters). Enganxa'ls per separat.`
    : '✅ Pla de partida copiat al porta-retalls llest per enganxar a Discord!');
  try { navigator.clipboard.writeText(out).then(done, done); } catch (e) { done(); }
}
