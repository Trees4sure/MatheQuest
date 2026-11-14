// MatheQuest – Service Worker: alles offline verfügbar.
// Nach Änderungen VERSION hochzählen (mathequest-v3, -v4 …), dann lädt das Gerät die neuen Dateien.
const VERSION = "mathequest-v20";
const CORE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./apple-touch-icon.png",
  "./assets/chars/ben-froh.webp",
  "./assets/chars/brumm-froh.webp",
  "./assets/chars/brumm-gang.webp",
  "./assets/chars/brumm-grummelig.webp",
  "./assets/chars/ben-gang.webp",
  "./assets/chars/feldhase.webp",
  "./assets/chars/figur-fiete.webp",
  "./assets/chars/figur-hoppe.webp",
  "./assets/chars/figur-mehl.webp",
  "./assets/chars/figur-nolte.webp",
  "./assets/chars/figur-schulz.webp",
  "./assets/chars/portrait-fiete-froh.webp",
  "./assets/chars/portrait-fiete.webp",
  "./assets/chars/portrait-hoppe-froh.webp",
  "./assets/chars/portrait-hoppe.webp",
  "./assets/chars/portrait-mehl-froh.webp",
  "./assets/chars/portrait-mehl.webp",
  "./assets/chars/portrait-nolte-froh.webp",
  "./assets/chars/portrait-nolte.webp",
  "./assets/chars/portrait-schulz-froh.webp",
  "./assets/chars/portrait-schulz.webp",
  "./assets/chars/fips-freut.webp",
  "./assets/chars/fips-fragt.webp",
  "./assets/chars/festkuchen.webp",
  "./assets/chars/fips-froh.webp",
  "./assets/chars/hoppel.webp",
  "./assets/chars/fips-gang.webp",
  "./assets/chars/lina-gang.webp",
  "./assets/chars/lina-froh.webp",
  "./assets/items/bauklotz.webp",
  "./assets/items/brot.webp",
  "./assets/items/ei.webp",
  "./assets/items/fahrkarte.webp",
  "./assets/items/kuchenstueck.webp",
  "./assets/items/trinkflasche.webp",
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
  "./assets/scenes/gemuesegarten.webp",
  "./assets/scenes/markt.webp",
  "./assets/scenes/rechenbach-karte.webp",
  "./assets/scenes/schreinerei.webp",
  "./css/journey.css",
  "./css/kind.css",
  "./css/notebook.css",
  "./css/share.css",
  "./css/spiel.css",
  "./js/drag.js",
  "./js/fest.js",
  "./js/hud.js",
  "./js/gang.js",
  "./js/install.js",
  "./js/share.js",
  "./js/vendor/qrcode.js",
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
  "./js/notebook.js",
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
  "./js/story.js",
  "./js/store.js",
  "./js/ui.js",
  "./maskable-512.png"
];
// Schriften aus dem Holzi-Projekt: nur mitnehmen, wenn vorhanden (MatheQuest läuft auch ohne sie)
const MUST = ["./", "./index.html", "./js/app.js", "./manifest.webmanifest"];
const OPTIONAL = [
  "./fonts/grandstander-latin-600-normal.woff2", "./fonts/grandstander-latin-800-normal.woff2",
  "./fonts/atkinson-hyperlegible-latin-400-normal.woff2", "./fonts/atkinson-hyperlegible-latin-700-normal.woff2",
];

self.addEventListener("install", (e) => {
  // Nur die Startdateien sind Pflicht. Alles andere wird einzeln geladen: Fehlt online eine Datei
  // (z. B. beim Hochladen vergessen), richtet sich der Service Worker trotzdem ein – die App bleibt
  // installierbar und bekommt Updates; die fehlende Datei kommt später aus dem Netz.
  e.waitUntil(caches.open(VERSION).then(async (c) => {
    await c.addAll(MUST.map((u) => new Request(u, { cache: "reload" })));
    const rest = [...CORE.filter((u) => !MUST.includes(u)), ...OPTIONAL];
    const failed = [];
    await Promise.all(rest.map((u) => c.add(new Request(u, { cache: "reload" })).catch(() => failed.push(u))));
    if (failed.length) console.warn("MatheQuest: nicht geladen", failed);
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
  e.respondWith(caches.match(req, { ignoreSearch: true }).then((hit) => hit || fetch(req).then((res) => {
    // Was beim Einrichten fehlte, wird beim ersten Abruf nachgeholt.
    if (res.ok && CORE.includes("." + url.pathname.slice(new URL(self.registration.scope).pathname.length - 1))) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
    return res;
  })));
});
