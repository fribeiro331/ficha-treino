// Muda a versão a cada atualização do app para o iPhone baixar a nova.
const V = 'ficha-v7';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  // Páginas: tenta a rede (pega atualização), cai no cache se offline.
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request, {cache: 'no-cache'}).then(r => { caches.open(V).then(c => c.put('index.html', r.clone())); return r; })
      .catch(() => caches.match('index.html')));
    return;
  }
  // Resto (ícones, fontes): cache primeiro.
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => {
    if (r.ok || r.type === 'opaque') { const cp = r.clone(); caches.open(V).then(c => c.put(e.request, cp)); }
    return r;
  })));
});
