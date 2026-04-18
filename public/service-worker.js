/* public/service-worker.js
   Workbox-style manual service worker for EventHub PWA.
   Caches app shell for offline use. */

const CACHE  = "eventhub-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/logo192.png",
  "/logo512.png",
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);

  // Network-first for API/Firebase calls
  if (url.hostname.includes("firebase") || url.hostname.includes("googleapis")) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }

  // Cache-first for app shell
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        if (resp && resp.status === 200 && resp.type === "basic") {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return resp;
      });
    })
  );
});

// Handle skip-waiting message from registration
self.addEventListener("message", e => {
  if (e.data?.type === "SKIP_WAITING") self.skipWaiting();
});

// Push notification handler (future use)
self.addEventListener("push", e => {
  const data = e.data?.json() || { title: "EventHub", body: "New update available." };
  e.waitUntil(
    self.registration.showNotification(data.title || "EventHub", {
      body:    data.body    || "",
      icon:    "/logo192.png",
      badge:   "/logo192.png",
      vibrate: [200, 100, 200],
      data:    data,
    })
  );
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(clients.openWindow("/"));
});
