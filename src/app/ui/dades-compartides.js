// ===== Pantalla: dades-compartides (separat del motor) =====
renderSharedStatus();
fetchShared();
function renderSharedStatus(st) {
  const el = document.getElementById('sharedStatus'); if (!el) return;
  const m = SHARED_META;
  let t;
  if (!m) t = st === 'off' ? '⚠️ Dades compartides no disponibles (sense connexió o encara no publicades). S\'usen les dades locals.' : '⏳ Carregant dades compartides…';
  else {
    const n = m.keys;
    t = `${st === 'ok' ? '✅' : '📦'} Dades compartides actives (versió ${escapeHtml(String(m.version))}, ${escapeHtml(String(m.updated))})` + (st === 'cache' ? ' — sense connexió, mostrant l\'última còpia' : '') + '. ' +
      (n ? `Els ${n} camps compartits manen sobre els editors locals; la resta es guarda només en aquest dispositiu.` : 'Cap camp compartit per ara; els editors locals funcionen amb normalitat.');
  }
  el.innerHTML = t;
}
function exportLocal() {
  const data = {};
  SHARED_LOCAL_KEYS.forEach(k => { try { const v = localStorage.getItem(k); if (v) data[k] = JSON.parse(v); } catch (e) {} });
  const txt = JSON.stringify({ version: 'local', updated: new Date().toISOString().slice(0, 10), data }, null, 1);
  const done = () => { try { alert(Object.keys(data).length ? `Copiat (${Object.keys(data).length} camps). Enganxa-ho a Claude.` : 'No tens dades locals editades.'); } catch (e) {} };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, () => prompt('Copia aquest text:', txt));
  else prompt('Copia aquest text:', txt);
}
