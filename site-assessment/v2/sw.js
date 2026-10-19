/*
 * Service worker: keeps a copy of the app on the device so it opens without signal.
 * Files are served from the device first; when online, a fresh copy is fetched in the background
 * so the next launch gets any update. Change CACHE to force every device to start over.
 */
const CACHE = "site-recording-v3";
const FILES = [
  "./", "./index.html", "./app.js", "./form.js", "./cultural.js", "./style.css", "./manifest.webmanifest",
  "../style.css",                           // shared look with the site assessment app
  "../../v3/js/content.js",                 // help for the planning tool questions, shared with the planning tool
  "../icons/icon-192.png", "../icons/icon-512.png", "../icons/icon-maskable-512.png",
  "../icons/apple-touch-icon.png", "../icons/favicon-64.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  // only clear this app's old copies; the site assessment app (version 1) keeps its own
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith("site-recording-") && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(caches.open(CACHE).then(async cache => {
    const cached = await cache.match(req, { ignoreSearch: true });
    const fresh = fetch(req).then(res => { if (res && res.ok) cache.put(req, res.clone()); return res; }).catch(() => null);
    if (cached) { e.waitUntil(fresh); return cached; }
    const res = await fresh;
    if (res) return res;
    // offline and not cached: fall back to the app page for navigations
    if (req.mode === "navigate") return (await cache.match("./index.html")) || Response.error();
    return Response.error();
  }));
});
