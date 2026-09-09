/* Spectroton — Service Worker
   Version bei jeder Änderung hochzählen, sonst bleibt die alte App im Cache. */
const VERSION = "spectroton-v1";
const SHELL = VERSION + "-shell";
const NAMES = VERSION + "-names";

const FILES = ["./", "./index.html", "./manifest.webmanifest"];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(SHELL).then(c => c.addAll(FILES)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== SHELL && k !== NAMES).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  /* Farbnamen-API: erst aus dem Cache antworten, im Hintergrund auffrischen.
     Einmal nachgeschlagene Namen sind dadurch auch offline da. */
  if (url.hostname === "api.color.pizza") {
    e.respondWith(
      caches.open(NAMES).then(async cache => {
        const hit = await cache.match(req);
        const net = fetch(req).then(res => {
          if (res && res.ok) cache.put(req, res.clone());
          return res;
        }).catch(() => null);
        return hit || net || new Response('{"colors":[]}', { headers: { "Content-Type": "application/json" } });
      })
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  /* Seitenaufrufe: erst Netz, damit Updates sofort ankommen; offline aus dem Cache. */
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(SHELL).then(c => c.put("./index.html", copy));
          return res;
        })
        .catch(() => caches.match("./index.html", { ignoreSearch: true }))
    );
    return;
  }

  /* Alles andere: erst Cache, sonst Netz. */
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req))
  );
});
