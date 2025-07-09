const CACHE_NAME = 'budget-base-v1';
const urlsToCache = [
    "/Budget/",
    "/Budget/index.html",
    "/Budget/manifest.json",
    "/Budget/icon-192.png",
    "/Budget/icon-512.png",
    "/Budget/icon-dark-192.png",
    "/Budget/icon-dark-512.png",
    "/Budget/splash-screen.png",
    "/Budget/splash-screen-dark.png"
];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
            .catch(function(error) {
                console.error('Failed to cache resources:', error);
            })
    );
});

self.addEventListener('fetch', function(event) {
    const url = new URL(event.request.url);
    const appPath = '/Budget';
    
    if (url.pathname.startsWith(appPath)) {
        event.respondWith(
            caches.match(event.request)
                .then(function(response) {
                    if (response) {
                        return response;
                    }
                    return fetch(event.request);
                })
                .catch(function(error) {
                    console.error('Fetch failed:', error);
                    throw error;
                })
        );
    }
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});