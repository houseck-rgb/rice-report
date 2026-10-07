/* 초밥밥 취사 서비스워커
   - 화면(HTML)은 항상 인터넷에서 최신본을 먼저 받아옴 → 업데이트가 바로 반영됨
   - 인터넷이 끊기면 저장해둔 화면으로 열림
   - 새 버전 올릴 때 VERSION 숫자만 올리면 예전 캐시는 자동 삭제 */
const VERSION = 'sushi-rice-v20261007-3';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(VERSION).then(c =>
      Promise.all(ASSETS.map(u => c.add(new Request(u, { cache: 'reload' })).catch(() => {})))
    )
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;

  const isPage = req.mode === 'navigate' || req.destination === 'document';

  if (isPage) {
    // 화면: 인터넷 먼저 → 실패하면 캐시
    e.respondWith(
      fetch(req, { cache: 'no-store' })
        .then(res => {
          const copy = res.clone();
          caches.open(VERSION).then(c => c.put('./index.html', copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match('./index.html').then(r => r || caches.match('./')))
    );
    return;
  }

  // 아이콘·manifest 등: 캐시 먼저 → 없으면 인터넷
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)).catch(() => {}); }
      return res;
    }))
  );
});
