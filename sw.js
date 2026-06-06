const CACHE_NAME = 'taxibook-cache-v3.6'; 
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// Εγκατάσταση και αποθήκευση αρχείων στο Cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Ενεργοποίηση και ΑΥΤΟΜΑΤΟΣ ΚΑΘΑΡΙΣΜΟΣ παλιού cache
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Διαγραφή παλιού cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Σερβίρισμα αρχείων (Offline Support)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});