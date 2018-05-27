    var staticCacheName = 'restaurant-static-v1';
    var contentImgsCache = 'restaurant-content-imgs';
    var allCaches = [staticCacheName, contentImgsCache];
    
    self.addEventListener('install', function (event) {
      event.waitUntil(caches.open(staticCacheName).then(function (cache) {
        return cache.addAll(['/',
          '/js/main.js',
          '/css/styles.css',
          '/img/1.webp',
          '/img/2.webp',
          '/img/3.webp',
          '/img/4.webp',
          '/img/5.webp',
          '/img/6.webp',
          '/img/7.webp',
          '/img/8.webp',
          '/img/9.webp',
          '/img/10.webp',
          '/js/dbhelper.js',
          '/js/restaurant_info.js',
          '/data/restaurants.json'
        ]);
      }));
    });
    
    self.addEventListener('activate', function (event) {
      event.waitUntil(caches.keys().then(function (cacheNames) {
        return Promise.all(cacheNames.filter(function (cacheName) {
          return cacheName.startsWith('restaurant-') && !allCaches.includes(cacheName);
        }).map(function (cacheName) {
          return caches['delete'](cacheName);
        }));
      }));
    });
    
    self.addEventListener('fetch', function (event) {
      var requestUrl = new URL(event.request.url);
    
      if (requestUrl.origin === location.origin) {
        if (requestUrl.pathname === '/') {
          event.respondWith(caches.match('/'));
          return;
        }
      }
    
      event.respondWith(caches.match(event.request).then(function (response) {
        return response || fetch(event.request);
      }));
    });
    
      