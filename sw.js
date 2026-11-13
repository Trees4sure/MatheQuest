// MatheQuest – Service Worker: alles offline verfügbar.
// Nach Änderungen VERSION hochzählen (mathequest-v3, -v4 …), dann lädt das Gerät die neuen Dateien.
const VERSION = "mathequest-v11";
const CORE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./apple-touch-icon.png",
  "./assets/chars/ben-froh.webp",
  "./assets/chars/brumm-froh.webp",
  "./assets/chars/brumm-grummelig.webp",
  "./assets/chars/fips-froh.webp",
  "./assets/chars/fips-lauf.webp",
  "./assets/chars/lina-froh.webp",
  "./assets/chars/lina-lauf.webp",
  "./assets/math/absperrung-vektor.webp",
  "./assets/math/bruchkreise.webp",
  "./assets/math/brueckenbretter.webp",
  "./assets/math/dorfpass-stempel.webp",
  "./assets/math/eier-6.webp",
  "./assets/math/moehren.webp",
  "./assets/math/muenzen.webp",
  "./assets/math/stellenwert-material.webp",
  "./assets/math/zaehlsteine-12.webp",
  "./assets/math/zahlenstrahl-0-10.webp",
  "./assets/math/zehnerfeld-7.webp",
  "./assets/props/absperrung.webp",
  "./assets/scenes/bahnhof.webp",
  "./assets/scenes/bruecke.webp",
  "./assets/scenes/dorffest.webp",
  "./assets/scenes/dorfkarte.webp",
  "./assets/scenes/erkundung-w1.webp",
  "./assets/scenes/erkundung-w2.webp",
  "./assets/scenes/erkundung-w3.webp",
  "./assets/scenes/erkundung-w4.webp",
  "./assets/scenes/erkundung-w5.webp",
  "./assets/scenes/erkundung-w6.webp",
  "./assets/scenes/erkundung-wald.webp",
  "./assets/scenes/feuerwehr.webp",
  "./assets/scenes/markt.webp",
  "./assets/scenes/rechenbach-karte.webp",
  "./assets/scenes/schreinerei.webp",
  "./css/journey.css",
  "./css/style.css",
  "./fonts/atkinson-hyperlegible-latin-400-normal.woff2",
  "./fonts/atkinson-hyperlegible-latin-700-normal.woff2",
  "./fonts/grandstander-latin-600-normal.woff2",
  "./fonts/grandstander-latin-800-normal.woff2",
  "./fonts/grandstander-latin-900-normal.woff2",
  "./icon-192.png",
  "./icon-512.png",
  "./icon.svg",
  "./js/adventures/bridge-logic.js",
  "./js/adventures/bridge.js",
  "./js/adventures/hoppel-logic.js",
  "./js/adventures/hoppel.js",
  "./js/anschaulich-logic.js",
  "./js/anschaulich.js",
  "./js/answer.js",
  "./js/app.js",
  "./js/art.js",
  "./js/competence.js",
  "./js/content.js",
  "./js/curriculum.js",
  "./js/fx.js",
  "./js/generators.js",
  "./js/journey-logic.js",
  "./js/journey.js",
  "./js/klasse7-logic.js",
  "./js/klasse7.js",
  "./js/lernorte-logic.js",
  "./js/lernorte.js",
  "./js/play.js",
  "./js/questworld.js",
  "./js/scenes.js",
  "./js/sprites.js",
  "./js/store.js",
  "./js/ui.js",
  "./maskable-512.png"
];
// Schriften aus dem Holzi-Projekt: nur mitnehmen, wenn vorhanden (MatheQuest läuft auch ohne sie)
const OPTIONAL = [
  "./fonts/grandstander-latin-600-normal.woff2", "./fonts/grandstander-latin-800-normal.woff2",
  "./fonts/atkinson-hyperlegible-latin-400-normal.woff2", "./fonts/atkinson-hyperlegible-latin-700-normal.woff2",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then(async (c) => {
    await c.addAll(CORE.map((u) => new Request(u, { cache: "reload" })));
    await Promise.all(OPTIONAL.map((u) => c.add(new Request(u, { cache: "reload" })).catch(() => {})));
  }).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k.startsWith("mathequest-") && k !== VERSION).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin) return;
  // Seite: erst Netz (max. 3 s, damit Updates ankommen), sonst Cache
  if (req.mode === "navigate") {
    e.respondWith(Promise.race([
      fetch(req).then((res) => {
        if (!res.ok) throw new Error("Navigation unavailable");
        const base = new URL(self.registration.scope).pathname;
        if (url.pathname === base || url.pathname === base + "index.html") {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put("./index.html", copy));
        }
        return res;
      }),
      new Promise((_, rej) => setTimeout(rej, 3000)),
    ]).catch(() => caches.match("./index.html")));
    return;
  }
  // Dateien: Cache zuerst, sonst Netz
  e.respondWith(caches.match(req, { ignoreSearch: true }).then((hit) => hit || fetch(req)));
});
