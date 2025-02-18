self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('my-cache').then(function(cache) {
      return cache.addAll([
        '/',
        '/index.html',
        '/menu.html',
        '/404.html',
        '/index.js',
        '/compnyMenu.js'
      ]);
    })
  );
});




self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});





// self.addEventListener('fetch', function (e) {
//     console.log('service worker fetch')
//   })
  
//   self.addEventListener('install', function (e) {
//     console.log('service worker install')
//   })
  
//   self.addEventListener('activate', function (e) {
//     console.log('service worker activate')
//   })
  