const mwsRestaurantCacheName = 'mws-restaurant-v1';

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(mwsRestaurantCacheName).then (cache => {
            return cache.addAll([
                '/',
                '/index.html',
                '/restaurant.html',
                '/js/main.js',
                '/js/restaurant_info.js',
                '/js/dbhelper.js',
                '/data/restaurants.json',
                '/css/styles.css',
                '/img/'
            ]);
        }).catch(err => {
            console.log('Failed to cache', err);
        })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(cacheName => {
                    return cacheName.startsWith('mws-restaurant') && cacheName != mwsRestaurantCacheName;
                }).map(cacheName => {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request, {ignoreSearch: true}).then(response => {
            return response || fetch(event.request);
        })
    );
});