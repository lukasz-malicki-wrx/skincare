self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// No fetch handler. An empty one still intercepts every navigation and makes a tap wait
// on the service worker. Chrome no longer needs a fetch handler for installation.
