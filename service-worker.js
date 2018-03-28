const CACHE = 'restaurant-cache-v1';

// A list of local resources we always want to be cached.
const CACHE_URLS = [
    'index.html',
    './', // Alias for index.html
    'restaurant.html',
    'js/main.js',
    'js/dbhelper.js',
    'js/restaurant_info.js',
    'data/restaurants.json',
    'css/styles.css',
    'img/1.webp',
    'img/2.webp',
    'img/3.webp',
    'img/4.webp',
    'img/5.webp',
    'img/6.webp',
    'img/7.webp',
    'img/8.webp',
    'img/9.webp',
    'img/10.webp'
];


// The install handler takes care of precaching the resources we always need.
self.addEventListener('install', event => {
    event.waitUntil(
    caches.open(CACHE)
        .then(cache => cache.addAll(CACHE_URLS))
    .then(self.skipWaiting())
);
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', event => {
    self.addEventListener('activate', function (event) {

    var cacheWhitelist = ['restaurant-cache-v1'];

    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.map(function (cacheName) {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    });
});


// The fetch handler serves responses for same-origin resources from a cache.
// If no response is found, it populates the runtime cache with the response
// from the network before returning it to the page.
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                    // Cache hit - return response
                    if (response) {
                        return response;
                    }
                    return fetch(event.request);
                }
            )
    );
});


// self.addEventListener('install', event => {
//     event.waitUntil(
//     caches.open('restaurant-review-v2').then( cache => {
//         return cache.addAll([
//             '/',
//             'index.html',
//             'restaurant.html',
//             'js/main.js',
//             'js/dbhelper.js',
//             'js/restaurant_info.js',
//             'data/restaurants.json',
//             'css/styles.css',
//             'img/1.webp',
//             'img/2.webp',
//             'img/3.webp',
//             'img/4.webp',
//             'img/5.webp',
//             'img/6.webp',
//             'img/7.webp',
//             'img/8.webp',
//             'img/9.webp',
//             'img/10.webp'
//         ])
//     })
// )
// });
//
// self.addEventListener('fetch', event => {
//     event.respondWith(
//     caches.match(event.request).then( response =>{
//         // Cache hit - return response
//         if (response) {
//             return response;
//         }
//
//         return fetch(event.request)
//     })
// )
// });