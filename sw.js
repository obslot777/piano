const CACHE_NAME = 'piano-app-cache-v1';
const urlsToCache = [
  '/',
  'index.html',
  'style.css',
  'script.js',
  // 音声ファイル
  'audio/do.mp3',
  'audio/b1.mp3',
  'audio/re.mp3',
  'audio/b2.mp3',
  'audio/mi.mp3',
  'audio/fa.mp3',
  'audio/b3.mp3',
  'audio/so.mp3',
  'audio/b4.mp3',
  'audio/ra.mp3',
  'audio/si.mp3',
  'audio/do2.mp3',
  // アイコンファイル
  'icons/icon-192x192.png',
  'icons/icon-512x512.png'
];

// インストール時にキャッシュを作成
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// 古いキャッシュを削除
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// フェッチイベントでキャッシュを返す
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});