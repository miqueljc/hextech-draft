// ===== Dades compartides (data.json a GitHub): manen sobre les dades locals =====
const SHARED_URL = 'https://miqueljc.github.io/hextech-draft/data.json';
const SHARED_CACHE = 'hextech_shared_cache_v1';
const SHARED_LOCAL_KEYS = ['hextech_rolepools_v1', 'hextech_opgg_v1', 'hextech_counters_v1', 'hextech_synergy_v1', 'hextech_tier_v1', 'hextech_tags_v1', 'hextech_extcounters_v1'];
function setShared(j) {
  if (j && j.data && typeof j.data === 'object') { SHARED = j.data; SHARED_META = { version: j.version || '', updated: j.updated || '', keys: Object.keys(j.data).length }; }
  else { SHARED = null; SHARED_META = null; }
}
try { setShared(JSON.parse(localStorage.getItem(SHARED_CACHE) || 'null')); } catch (e) {}
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
async function fetchShared() {
  try {
    const ctrl = new AbortController(); const to = setTimeout(() => ctrl.abort(), 6000);
    const r = await fetch(SHARED_URL + '?t=' + Date.now(), { cache: 'no-store', signal: ctrl.signal });
    clearTimeout(to);
    if (!r.ok) throw new Error('http ' + r.status);
    const j = await r.json();
    const txt = JSON.stringify(j); let prev = null;
    try { prev = localStorage.getItem(SHARED_CACHE); localStorage.setItem(SHARED_CACHE, txt); } catch (e) {}
    setShared(j);
    if (prev !== txt) { afterDataChange(); renderAll(); }
    renderSharedStatus('ok');
  } catch (e) { renderSharedStatus(SHARED ? 'cache' : 'off'); }
}
function exportLocal() {
  const data = {};
  SHARED_LOCAL_KEYS.forEach(k => { try { const v = localStorage.getItem(k); if (v) data[k] = JSON.parse(v); } catch (e) {} });
  const txt = JSON.stringify({ version: 'local', updated: new Date().toISOString().slice(0, 10), data }, null, 1);
  const done = () => { try { alert(Object.keys(data).length ? `Copiat (${Object.keys(data).length} camps). Enganxa-ho a Claude.` : 'No tens dades locals editades.'); } catch (e) {} };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, () => prompt('Copia aquest text:', txt));
  else prompt('Copia aquest text:', txt);
}
renderSharedStatus();
fetchShared();
