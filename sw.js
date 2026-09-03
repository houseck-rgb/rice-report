const CACHE_NAME='chosbap-cache-v1';
const ASSET='./sushi_rice_3windows_v8_colors-2.html';
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.add(ASSET)).catch(()=>{}));
  self.skipWaiting();
});
self.addEventListener('activate',e=>{self.clients.claim();});
self.addEventListener('fetch',e=>{
  e.respondWith(
    fetch(e.request).catch(()=>caches.match(e.request).then(r=>r||caches.match(ASSET)))
  );
});
