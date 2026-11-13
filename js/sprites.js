// Gemalte Figuren und Gegenstände (Bilder aus assets/) – oder die alten Code-Zeichnungen,
// je nach Einstellung "art" im Erwachsenenbereich ("bild" = Standard, "svg" = alte Zeichnung).
// Alle Bilder zeigen nach rechts; Füße bzw. Standfläche sind unten in der Mitte.
// Aufgeräumt mit tools/clean-sprites.py (Reste vom Freistellen entfernt).

import { settings, current } from "./store.js";
import { fips, lina, brumm, mascot as mascotSvg } from "./art.js";

export const SPRITES = {
  // Figuren: freigestellte Fassung vom 3. 11. 2026 (alle vier vollständig, echter Alphakanal), lose Pixel entfernt
  lina: { src: "assets/chars/lina-froh.webp", w: 436, h: 691 },
  ben: { src: "assets/chars/ben-froh.webp", w: 258, h: 702 },
  fips: { src: "assets/chars/fips-froh.webp", w: 448, h: 392 },
  brummFroh: { src: "assets/chars/brumm-froh.webp", w: 476, h: 696 },
  brummGrummelig: { src: "assets/chars/brumm-grummelig.webp", w: 343, h: 693 },
  absperrung: { src: "assets/props/absperrung.webp", w: 236, h: 206 },
};

export const painted = () => settings().art !== "svg";

// SVG-<image> mit Standfläche bei (dx, 0), Höhe h (in Szenen-Einheiten)
export function spriteSvg(name, h, dx = 0) {
  const s = SPRITES[name], w = (s.w * h) / s.h;
  return `<image href="${s.src}" x="${dx - w / 2}" y="${-h}" width="${w}" height="${h}" preserveAspectRatio="xMidYMax meet"/>`;
}
// HTML-<img> (Dialoge, Startseite)
export function spriteImg(name, cls = "") {
  const s = SPRITES[name];
  return `<img class="sprite ${cls}" src="${s.src}" width="${s.w}" height="${s.h}" alt="" draggable="false">`;
}

// Porträt in der Sprechblase
export function portraitArt(who) {
  if (!painted()) {
    if (who === "lina") return lina({ mood: "happy" });
    if (who === "fips") return fips({ hat: current()?.cosmetic || "none", mood: "happy" });
    if (who === "brumm") return brumm({ mood: "grumpy" });
    if (who === "brumm-happy") return brumm({ mood: "happy" });
    return null;
  }
  const map = { lina: "lina", fips: "fips", brumm: "brummGrummelig", "brumm-happy": "brummFroh" };
  return map[who] ? spriteImg(map[who], "por-img") : null;
}

// Lina mit Fips nebeneinander (Startseite, Begrüßung, Ergebnis, Pause)
export function mascotHtml(opts = {}) {
  if (!painted()) return mascotSvg(opts);
  const hero=current()?.hero==="ben"?"ben":"lina";
  return `<div class="mascot-img">${spriteImg(hero, "m-lina")}${spriteImg("fips", "m-fips")}</div>`;
}
