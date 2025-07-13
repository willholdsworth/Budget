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
    
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    return caches.match('/Budget/index.html');
                })
        );
        return;
    }
    
    if (url.pathname.startsWith(appPath)) {
        event.respondWith(
            caches.match(event.request)
                .then(function(response) {
                    if (response) {
                        return response;
                    }
                    
                    const fetchRequest = event.request.clone();
                    
                    return fetch(fetchRequest).then(function(response) {
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        const responseToCache = response.clone();
                        
                        caches.open(CACHE_NAME).then(function(cache) {
                            cache.put(event.request, responseToCache);
                        });
                        
                        return response;
                    });
                })
                .catch(function(error) {
                    console.error('Fetch failed:', error);
                    return new Response('Network error occurred', {
                        status: 503,
                        statusText: 'Service Unavailable'
                    });
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
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    
    return self.clients.claim();
});

self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
