const CACHE_NAME = 'python-cc-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/js/app.js',
    '/js/data.js',
    '/manifest.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
