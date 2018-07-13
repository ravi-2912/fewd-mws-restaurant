const mwsRestaurantCacheName = 'mws-restaurant-v1';

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(mwsRestaurantCacheName).then (cache => {
            console.log('Caching');
            return cache.addAll([
                '/index.html',
                '/restaurant.html',
                '/js/main.js',
                '/js/restaurant_info.js',
                '/js/dbhelper.js',
                '/data/restaurants.json',
                '/css/syles.css',
                '/img/'
            ]);
        }).catch(err => {
            console.log('Failed to cache');
        })
    );
});

self.addEventListener('activate', e => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cachesName.filter(cacheName => {
                    return cacheName.startsWith('mws-restaurant') && cacheName != mwsRestaurantCacheName;
                }).map(cacheName => {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});

self.addEventListener('fetch', (evt) => {
    evt.respondWith(
        caches.match(evt.request).then(response => {
            return response || fetch(evt.request);
        })
    );
});