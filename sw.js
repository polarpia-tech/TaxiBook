const CACHE_NAME = 'taxibook-cache-v2'; // <-- Όταν κάνεις νέα αλλαγή στο index, το κάνεις v3, μετά v4 κτλ.
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// Εγκατάσταση και αποθήκευση αρχείων
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

// Σερβίρισμα αρχείων
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
