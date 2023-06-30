// const cacheName = "media-v2";
// const staticAssets = ["./home.png"];

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
