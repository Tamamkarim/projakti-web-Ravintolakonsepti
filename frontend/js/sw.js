// Service Worker for PWA
self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  clients.claim();
});

self.addEventListener('fetch', event => {
  // You can add caching logic here if needed
});const CACHE = 'rm-cache-v1';
const ASSETS = [
  '../index.html', '../css/styles.css', 'main.js', 'restaurant-api.js', 'cart.js', '../assets/img/placeholder.jpg', '../manifest.json'
];

self.addEventListener('install', e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
});

self.addEventListener('activate', e=>{
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', e=>{
  const url = new URL(e.request.url);
  // Try network for API calls, fallback to cache
  if(url.pathname.startsWith('/api/')){
    e.respondWith(
      fetch(e.request).then(r=>{ const copy = r.clone(); caches.open(CACHE).then(c=>c.put(e.request, copy)); return r; }).catch(()=>caches.match(e.request))
    );
    return;
  }
  e.respondWith(caches.match(e.request).then(r=> r || fetch(e.request)));
});
