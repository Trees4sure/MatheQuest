/* Spiel-Anzeige außerhalb der Bildschirme: Haus-Knopf (zurück zur Dorfkarte) immer oben links,
   Rucksack (alles andere: Üben, Sammlung, Feststand, Hilfe …) immer oben rechts. Auf der Dorfkarte selbst
   gibt es kein Haus, dort steckt der Rucksack in der Leiste unten. */
import { installButton } from './install.js';
import { sound } from './fx.js';

const TILES = [
  ['#/map', '🗺️', 'Dorfkarte'], ['#/training', '✏️', 'Üben'], ['#/stand', '🎪', 'Mein Feststand'], ['#/collection', '🏅', 'Sammlung'],
  ['#/adv/bridge', '🌉', 'Die Brücke'], ['#/adv/hoppel', '🐇', 'Hoppel'], ['#/explore/wald', '🌳', 'Waldbach'], ['#/hilfe', '❓', 'Spielhilfe'],
  ['#/teilen', '🔗', 'Weitersagen'], ['#/adults', '👪', 'Erwachsene'], ['#/profiles', '🙂', 'Kind wechseln'],
];

const el = () => document.getElementById('hud');

/* page = erster Teil der Adresse (#/reise/w1 → "reise"). Ohne Profil keine Anzeige. */
export function setHud(page, hasProfile) {
  const h = el(); if (!h) return;
  closeBag();
  const home = !page || page === 'map';
  const off = !hasProfile || page === 'new' || page === 'profiles';
  document.body.classList.toggle('hud-sub', !home && !off);
  document.body.classList.toggle('hud-home', home && !off);
  h.innerHTML = off || home ? '' :
    `<button class="g-round g-house" data-hud-go="#/map" aria-label="Zur Dorfkarte"><span aria-hidden="true">⌂</span></button>
     <button class="g-round g-bag" data-bag-open aria-label="Rucksack öffnen"><span aria-hidden="true">🎒</span></button>`;
}

export function openBag() {
  closeBag(); sound('tap');
  const back = document.createElement('div');
  back.className = 'g-sheet-back'; back.setAttribute('data-bag-close', '');
  back.innerHTML = `<div class="g-sheet" role="dialog" aria-modal="true" aria-label="Rucksack">
    <div class="g-sheet-head"><span class="g-sheet-icon" aria-hidden="true">🎒</span><h2>Dein Rucksack</h2><button class="g-round small" data-bag-close aria-label="Rucksack schließen">✕</button></div>
    <div class="g-sheet-grid">${TILES.map(([go, ico, name]) => `<button class="g-tile" data-hud-go="${go}"><span aria-hidden="true">${ico}</span><b>${name}</b></button>`).join('')}</div>
    <div class="g-sheet-foot">${installButton()}</div></div>`;
  document.body.appendChild(back);
  back.querySelector('.g-tile')?.focus({ preventScroll: true });
}
export function closeBag() { document.querySelectorAll('.g-sheet-back').forEach((x) => x.remove()); }

document.addEventListener('click', (e) => {
  const go = e.target.closest('[data-hud-go]');
  if (go) { sound('tap'); closeBag(); const h = go.dataset.hudGo; if (location.hash === h) dispatchEvent(new HashChangeEvent('hashchange')); else location.hash = h; return; }
  if (e.target.closest('[data-bag-open]')) return openBag();
  const c = e.target.closest('[data-bag-close]');
  if (c && (c.classList.contains('g-round') || e.target === c)) closeBag();
});
addEventListener('keydown', (e) => { if (e.key === 'Escape') closeBag(); });
