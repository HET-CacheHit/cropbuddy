const CACHE_NAME = 'cropbuddy-pwa-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/analyze.html',
  '/weather.html',
  '/calendar.html',
  '/mandi.html',
  '/calculator.html',
  '/map.html',
  '/advisor.html',
  '/style.css',
  '/tf.min.js',
  '/logo.png'
];

// Install Event: Cache all assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('PWA Service Worker: Caching assets...');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('PWA Service Worker: Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Helper to clean redirected responses to avoid browser security block
const cleanResponse = async (response) => {
  if (!response.redirected) {
    return response;
  }
  const body = await response.blob();
  return new Response(body, {
    headers: response.headers,
    status: response.status,
    statusText: response.statusText
  });
};

// Fetch Event: Cache First, fallback to Network
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Handle redirects safely for PWA validation
  const requestToFetch = event.request.redirect === 'manual'
    ? new Request(event.request, { redirect: 'follow' })
    : event.request;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached file, but update in background (stale-while-revalidate)
        fetch(requestToFetch)
          .then(cleanResponse)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
            }
          }).catch(() => {/* Ignore network errors offline */});
        
        return cachedResponse;
      }
      
      return fetch(requestToFetch)
        .then(cleanResponse)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          
          return networkResponse;
        }).catch(() => {
          return caches.match('/index.html');
        });
    })
  );
});
