// const cacheName = "media-v1";
// const staticAssets = [
//   "./",
//   "./index.html",
//   "./global.css",
//   "./fa-regular-400.woff",
//   "./fa-regular-400.woff2",
//   "./fa-solid-900.woff",
//   "./fa-solid-900.woff2",
//   "./home.png",
//   "./home.ico",
//   "./all.min.css",
//   "./bundle.css",
//   "./bundle.css.map",
//   "./bundle.js",
//   "./bundle.js.map",
// ];

// self.addEventListener("install", async (e) => {
//   const cache = await caches.open(cacheName);
//   await cache.addAll(staticAssets);
//   return self.skipWaiting();
// });

// self.addEventListener("activate", (e) => {
//   self.clients.claim();
// });

// self.addEventListener("fetch", async (e) => {
//   const req = e.request;
//   const url = new URL(req.url);

//   // e.respondWith(fetch(req));
//   if (url.origin === location.origin) {
//     e.respondWith(fromCache(req));
//   } else {
//     e.respondWith(fromServer(req));
//   }
// });

// const fromCache = async (req) => {
//   const cache = await caches.open(cacheName);
//   const cached = await cache.match(req);
//   return cached || fetch(req);
// };

// const fromServer = async (req) => {
//   const cache = await caches.open(cacheName);
//   try {
//     const fresh = await fetch(req);
//     if (/^http?$/i.test(new URL(req.url).protocol)) {
//       await cache.put(req, fresh.clone());
//     }
//     return fresh;
//   } catch (error) {
//     const cached = await cache.match(req);
//     console.log(error);
//     return cached;
//   }
// };
