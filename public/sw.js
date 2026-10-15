const CACHE_NAME = 'kmca-admin-v4';
const CLOUD_CACHE = 'cloudinary-v1';
const ASSETS = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME && k !== CLOUD_CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('supabase.co')) return;

  if (e.request.url.includes('cloudinary.com')) {
    e.respondWith(
      caches.open(CLOUD_CACHE).then((cache) =>
        cache.match(e.request).then((cached) => {
          if (cached) return cached;
          return fetch(e.request).then((res) => {
            cache.put(e.request, res.clone());
            return res;
          });
        })
      )
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cached) => {
      const fetchPromise = fetch(e.request).then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(e.request, clone));
        return res;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});

self.addEventListener('push', (e) => {
  const data = e.data ? e.data.json() : {};
  const title = data.title || 'KMCA Admin';
  const options = {
    body: data.body || '',
    icon: '/icons/icon.svg',
    badge: '/icons/badge-72.png',
    data: data.data || {},
    vibrate: [200, 100, 200],
    tag: data.data?.id || 'default',
    renotify: true,
  };

  if (self.registration.setAppBadge) {
    self.registration.setAppBadge(1).catch(() => {});
  }

  e.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  if (self.registration.clearAppBadge) {
    self.registration.clearAppBadge().catch(() => {});
  }
  e.waitUntil(clients.openWindow('/'));
});
