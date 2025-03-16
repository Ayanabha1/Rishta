// public/sw.js
const CACHE_NAME = "rishta-offline-cache-v1";
const OFFLINE_URL = "/offline.html";

// Install event - cache the offline page
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Service worker installed and cache opened");
      return cache.add(new Request(OFFLINE_URL, { cache: "reload" }));
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME;
          })
          .map((cacheName) => {
            return caches.delete(cacheName);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from network first, fallback to offline page only when network fails
self.addEventListener("fetch", (event) => {
  // Only intercept navigation requests
  if (event.request.mode === "navigate") {
    event.respondWith(
      // Try network first
      fetch(event.request).catch(() => {
        // If network fails, return the offline page
        console.log("Network request failed, serving offline page");
        return caches.match(OFFLINE_URL);
      })
    );
  }
});
