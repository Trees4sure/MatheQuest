// Laufbewegung: Schrittzyklus aus einem Bildstreifen (erzeugt mit tools/make-sprites.py).
// Eine Figur besteht aus ihrem Standbild <img> und einem versteckten Streifen-Element daneben.
// Beim Gehen wird der Streifen gezeigt und abgespielt, beim Stehen wieder das Standbild.
import * as store from './store.js';

// n = Anzahl Posen, w/h = Zellmaß im Streifen. Bei neuen Streifen die Ausgabe des Werkzeugs hier eintragen.
export const STRIPS = {
  lina: { src: 'assets/chars/lina-gang.webp', n: 7, w: 180, h: 300 },
  ben: { src: 'assets/chars/ben-gang.webp', n: 7, w: 196, h: 300 },
  fips: { src: 'assets/chars/fips-gang.webp', n: 8, w: 234, h: 150 },
  brumm: { src: 'assets/chars/brumm-gang.webp', n: 6, w: 214, h: 300 },
};

// Dasselbe für Figuren in einer SVG-Szene (Brücken-Abenteuer): Standfläche bei (dx, 0), Höhe h in
// Szenen-Einheiten. Das innere <svg> zeigt eine Zelle, das Bild dahinter wird schrittweise verschoben.
export function stripSvg(kind, h, dx = 0) {
  const s = STRIPS[kind]; if (!s) return '';
  const w = (s.w * h) / s.h;
  return `<svg class="gang-svg" x="${dx - w / 2}" y="${-h}" width="${w}" height="${h}" viewBox="0 0 ${s.w} ${s.h}" overflow="hidden"><image class="g${s.n}" href="${s.src}" width="${s.n * s.w}" height="${s.h}"/></svg>`;
}

// „Weniger Bewegung“ (Einstellung oder Gerät): Figur wechselt nur den Platz, ohne Schrittzyklus.
export const still = () => !!store.settings().reducedMotion || matchMedia('(prefers-reduced-motion: reduce)').matches;

export function gangHtml(kind) {
  const s = STRIPS[kind]; if (!s) return '';
  return `<span class="gang gang${s.n}" style="aspect-ratio:${s.w}/${s.h}" hidden aria-hidden="true"><i style="background-image:url(${s.src})"></i></span>`;
}

// el enthält <img> (Standbild) und .gang (Streifen). left = Blick nach links (gespiegelt).
export function walk(el, on, left = false) {
  if (!el) return;
  const strip = el.querySelector('.gang'), idle = el.querySelector('img');
  if (on) el.classList.toggle('schaut-links', left);
  if (!strip || !idle) return;
  const show = on && !still();
  strip.hidden = !show; idle.hidden = show;
}
