// public/sw.js

const CACHE_NAME = 'my-app-cache-v1';
const urlsToCache = [
  '/',
  // أضف هنا أي صفحات أو أصول أساسية تريد تخزينها مؤقتًا
  // مثال: '/styles/globals.css', '/logo.png'
];

// 1. عند التثبيت (Install)، قم بتخزين الأصول الأساسية مؤقتًا
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// 2. عند التفعيل (Activate)، قم بتنظيف الكاش القديم
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// 3. عند طلب الشبكة (Fetch)، حاول جلب الطلب من الشبكة أولاً
self.addEventListener('fetch', (event) => {
  // تجاهل الطلبات التي ليست GET
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => {
      // إذا فشلت الشبكة، حاول البحث في الكاش
      return caches.match(event.request);
    })
  );
});