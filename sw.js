const C = "sokio-v3", A = ["./", "index.html", "manifest.webmanifest", "icon.svg", "icon-192.png"];
// Cache each file on its own so one missing file can never block the install.
self.addEventListener("install", e => { e.waitUntil(caches.open(C).then(c => Promise.all(A.map(u => c.add(u).catch(() => {}))))); self.skipWaiting(); });
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x)))).then(() => self.clients.claim())));
// Network first, cache as offline fallback. Supabase calls are cross-origin and never cached
// (the app keeps its own copy of products and banners for offline starts).
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => { if (r.ok) { const c = r.clone(); caches.open(C).then(x => x.put(e.request, c)); } return r; })
    .catch(() => caches.match(e.request).then(m => m || caches.match("index.html"))));
});
