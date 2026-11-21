// Service worker: l'app funciona sense connexió. Canvieu VERSION en pujar una versió nova.
const VERSION = 'hextech-draft-v20';
const IMG_CACHE = 'hextech-img-v1'; // icones de Data Dragon: es guarden entre versions
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION && k !== IMG_CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const u = new URL(req.url);
  if (u.hostname === 'ddragon.leagueoflegends.com' && u.pathname.includes('/img/')) {
    // icones: primer la cau (funciona sense connexió un cop vistes)
    e.respondWith(caches.open(IMG_CACHE).then(c => c.match(req).then(r => r || fetch(req).then(res => { if (res.ok || res.type === 'opaque') c.put(req, res.clone()); return res; }))));
    return;
  }
  if (u.origin !== location.origin) return;
  if (new URL(req.url).pathname.endsWith('/data.json')) return; // dades compartides: sempre xarxa
  // pàgina: xarxa primer (agafa actualitzacions), cau si no hi ha connexió
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => { const cp = r.clone(); caches.open(VERSION).then(c => c.put('index.html', cp)); return r; })
      .catch(() => caches.match('index.html').then(r => r || caches.match('./'))));
    return;
  }
  e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => { const cp = res.clone(); caches.open(VERSION).then(c => c.put(req, cp)); return res; })));
});
