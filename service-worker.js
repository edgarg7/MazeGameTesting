const CACHE = 'maze-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './pwa-mobile.js',

  // Phaser runtime (you uploaded phaser.js)
  './phaser.js',

  // Game scripts
  './main.js','./Boot.js','./Preloader.js','./Game.js','./GameOver.js',
  './Player.js','./Enemy.js','./Bomb.js','./Key.js','./assets.js',

  // Map & art
  './tilemap.json','./tiles.png','./characters.png','./door.png','./key1.png',

  // Fallback icon
  './thumbnail.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    caches.match(req).then(hit => {
      if (hit) return hit;
      return fetch(req).then(res => {
        if (new URL(req.url).origin === location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => {
        if (req.mode === 'navigate') return caches.match('./index.html');
      });
    })
  );
});
