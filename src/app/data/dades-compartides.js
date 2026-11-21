// ===== Dades compartides (data.json a GitHub): manen sobre les dades locals =====
const SHARED_URL = 'https://miqueljc.github.io/hextech-draft/data.json';
const SHARED_CACHE = 'hextech_shared_cache_v1';
const SHARED_LOCAL_KEYS = ['hextech_rolepools_v1', 'hextech_opgg_v1', 'hextech_counters_v1', 'hextech_synergy_v1', 'hextech_tier_v1', 'hextech_tags_v1', 'hextech_extcounters_v1'];
function setShared(j) {
  if (j && j.data && typeof j.data === 'object') { SHARED = j.data; SHARED_META = { version: j.version || '', updated: j.updated || '', keys: Object.keys(j.data).length }; }
  else { SHARED = null; SHARED_META = null; }
}
try { setShared(JSON.parse(localStorage.getItem(SHARED_CACHE) || 'null')); } catch (e) {}
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
