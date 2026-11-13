// Szenen-Varianten für die Abenteuer: "svg" (alte Code-Zeichnung) oder "bild" (gemalter Hintergrund).
// Jede Variante bringt ihr eigenes Koordinatensystem mit: Stellplätze der Figuren (Füße), Laufweg über die
// Brücke, Figurengröße. Die Abenteuer-Logik bleibt für beide Varianten gleich.
//
// Neue gemalte Szene einhängen: Bild nach assets/scenes/, hier eine Variante mit Koordinaten anlegen
// (Koordinaten = Pixel im Bild), in sw.js eintragen. Zum Vermessen hilft tools/grid.mjs.
//
// Pflicht-Elemente einer Brückenszene (werden vom Code angesprochen):
//   <g class="layer ground">                Figuren werden hier eingehängt
//   .bridge .planks .plank.p0 … .p11        12 einzelne Bretter; p1 p2, p5 p6, p9 p10 sind anfangs Löcher
//   .barrier, .sign                         Absperrung und Schild (werden im Finale weggeräumt)
//   [data-hot="sun|fish|stump|bush|mushrooms"]   antippbare Stellen

import { clearing } from "./art.js";
import { settings, current } from "./store.js";
import { spriteSvg } from "./sprites.js";
import { stripSvg } from "./gang.js";

const INK = "#3a2416";

// ---------------- Variante "svg": die bisherige Zeichnung (viewBox 1000 × 560) ----------------
const DRAWN = {
  id: "svg",
  svg: clearing,
  wide: false,
  scale: 1, brummScale: 1,
  spots: { start: [20, 505], idle: [235, 508], stump: [330, 470], bush: [235, 520], mushrooms: [262, 556], fish: [372, 492], brumm: [365, 452] },
  cross: [[430, 452], [523, 462], [620, 452], [690, 476]],
  brumm: [760, 448], brummAside: [815, 436],
  ducks: { from: [380, 424], to: [720, 424], scale: 1 },
};

// ---------------- Variante "bild": gemalte Brücke (Grafikpaket v1, Entwurf) ----------------
// Bild 2048 × 1147 px. Scharf gemalt ist nur y = 224 … 928 (darüber/darunter weich ergänzt) → viewBox schneidet das ab.
// Vermessen: Tragbalken-Oberkante y ≈ 655, Pfosten außen x ≈ 650 und 1450, Lücke über dem Wasser x ≈ 867 … 1167.
const DECK = { x0: 664, x1: 1436, y: 626, h: 28 };
const BARRIER = [640, 700]; // Standfläche der Absperrung vor dem linken Brückenaufgang
function paintedBridge() {
  const n = 12, gap = 4, w = (DECK.x1 - DECK.x0 - gap * (n - 1)) / n;
  const planks = Array.from({ length: n }, (_, i) => {
    const x = DECK.x0 + i * (w + gap);
    return `<g class="plank p${i}"><rect x="${x}" y="${DECK.y}" width="${w}" height="${DECK.h}" rx="4" fill="url(#plankwood)" stroke="${INK}" stroke-width="3"/>
      <path d="M${x + 6} ${DECK.y + 9} h${w * 0.55} M${x + w * 0.3} ${DECK.y + 18} h${w * 0.6}" stroke="#7a4d2b" stroke-width="2" opacity=".55"/>
      <circle cx="${x + 7}" cy="${DECK.y + DECK.h / 2}" r="2.5" fill="#555"/><circle cx="${x + w - 7}" cy="${DECK.y + DECK.h / 2}" r="2.5" fill="#555"/></g>`;
  }).join("");
  // Antippbare Stellen: unsichtbare Flächen auf gemalten Dingen, mit kleinem Funkel-Hinweis
  const hot = (id, x, y, w, h, label) => `<g data-hot="${id}" class="hot-area" aria-label="${label}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="30" fill="#fff" fill-opacity="0"/><circle class="hot-dot" cx="${x + w / 2}" cy="${y + h / 2}" r="12"/></g>`;
  return `<svg class="scene-svg scene-bild" viewBox="0 224 2048 704" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <defs><linearGradient id="plankwood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2ad6e"/><stop offset=".55" stop-color="#b98048"/><stop offset="1" stop-color="#8a5a33"/></linearGradient></defs>
  <image href="assets/scenes/bruecke.webp" x="0" y="0" width="2048" height="1147" preserveAspectRatio="none"/>
  <g class="layer ground">
    ${hot("sun", 700, 230, 500, 90, "Himmel")}
    ${hot("bush", 300, 380, 280, 200, "Blühender Busch")}
    ${hot("stump", 260, 600, 350, 160, "Werkzeugkiste und Bretter")}
    ${hot("mushrooms", 590, 750, 190, 100, "Steine am Ufer")}
    ${hot("fish", 880, 720, 300, 180, "Bach")}
    <g class="bridge"><rect x="${DECK.x0}" y="${DECK.y + DECK.h - 4}" width="${DECK.x1 - DECK.x0}" height="8" fill="#0003"/><g class="planks">${planks}</g>
      <g class="sign" display="none"></g></g>
    <!-- Absperrung als eigenes Bild vor dem Brückenaufgang (wird im Finale weggeräumt) -->
    <g transform="translate(${BARRIER[0]} ${BARRIER[1]})"><g class="barrier">${spriteSvg("absperrung", 175)}</g></g>
  </g>
</svg>`;
}
const PAINTED = {
  id: "bild",
  svg: paintedBridge,
  wide: true,
  scale: 2.05, // Lina und Fips: etwa doppelt so groß wie im 1000er-System
  brummScale: 1.65, // nur für die alte Zeichnung
  // gemalte Figuren (sprites.js): Lina 9 Jahre, Fips Jack-Russell-Mischling, Brumm Erwachsener
  bodies: {
    // .still = Standbilder, .moving = Laufstreifen (js/gang.js); die Klasse „walking“ am Akteur schaltet um.
    // Die Spielfigur ist Lina oder Ben, je nach Profil.
    party: () => { const hero = current()?.hero === "ben" ? "ben" : "lina"; return `<g class="char party gangfig" data-mood="idle"><g class="body-wrap"><g class="still">${spriteSvg("fips", 128, 112)}${spriteSvg(hero, 262, 0)}</g><g class="moving">${stripSvg("fips", 128, 112)}${stripSvg(hero, 262, 0)}</g></g></g>`; },
    brumm: (mood) => `<g class="char brumm gangfig" data-mood="${mood}"><g class="body-wrap"><g class="still"><g class="img-grumpy">${spriteSvg("brummGrummelig", 330)}</g><g class="img-happy">${spriteSvg("brummFroh", 330)}</g></g><g class="moving">${stripSvg("brumm", 330)}</g></g></g>`,
    brummFacesLeft: true,
  },
  spots: { start: [330, 880], idle: [470, 850], stump: [440, 800], bush: [520, 720], mushrooms: [640, 880], fish: [780, 860], brumm: [520, 780] },
  cross: [[700, DECK.y + 4], [930, DECK.y + 4], [1180, DECK.y + 4], [1420, DECK.y + 4], [1500, 780]],
  brumm: [1585, 800], brummAside: [1730, 840],
  ducks: { from: [700, DECK.y + 4], to: [1460, DECK.y + 4], scale: 1.8 },
};

export const BRIDGE_SCENES = { svg: DRAWN, bild: PAINTED };
export function bridgeScene() { return BRIDGE_SCENES[settings().art] || PAINTED; }
