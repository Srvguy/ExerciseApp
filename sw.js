// Service Worker for PWA offline support
const CACHE_NAME = 'fittrack-v1.4.0-build14';
const urlsToCache = [
    './',
    './index.html',
    './styles.css',
    './db.js',
    './utils.js',
    './components.js',
    './views.js',
    './views-part2.js',
    './app.js',
    './manifest.json'
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

// Fetch event - Never cache JS/HTML, only assets for offline
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    
    // Never cache app files - always fetch fresh
    if (url.pathname.endsWith('.js') || 
        url.pathname.endsWith('.html') || 
        url.pathname.endsWith('.css') ||
        url.pathname === './' ||
        url.pathname.endsWith('/')) {
        event.respondWith(
            fetch(event.request).catch(() => {
                // Only use cache if completely offline
                return caches.match(event.request);
            })
        );
        return;
    }
    
    // For other assets (images, etc), use cache first
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
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
