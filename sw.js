// Service Worker for PWA offline support
const CACHE_NAME = 'fittrack-v1.4.0-build11';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/db.js',
    '/utils.js',
    '/components.js',
    '/views.js',
    '/views-part2.js',
    '/app.js',
    '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', event => {
    console.log('[SW] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Opened cache');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting()) // Activate immediately
    );
});

// Fetch event - Network first, cache fallback
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // If we got a valid response, cache it and return
                if (response && response.status === 200 && response.type === 'basic') {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                }
                return response;
            })
            .catch(() => {
                // Network failed, try cache
                console.log('[SW] Network failed, trying cache for:', event.request.url);
                return caches.match(event.request);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('[SW] Activating...');
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheWhitelist.indexOf(cacheName) === -1) {
                            console.log('[SW] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => self.clients.claim()) // Take control immediately
    );
});
