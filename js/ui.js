// Kleine UI-Bausteine: Dialoge mit Sprechblase, Hinweise, Ausgabe von Aufgaben-Text.
import { speak, canSpeak, sound } from "./fx.js";
import { portraitArt } from "./sprites.js";
import { current } from "./store.js";

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const wait = (ms) => new Promise((r) => setTimeout(r, ms));
export const pick = (a) => a[Math.floor(Math.random() * a.length)];

// Aufgabentext: "□" → Lücke, "[3/4]" → gezeichneter Bruch
export function mathHtml(q) {
  return esc(q)
    .replace(/\[(-?[\d□]+)\/([\d□]+)\]/g, '<span class="frac"><span>$1</span><span>$2</span></span>')
    .replace(/□/g, '<span class="gap">?</span>');
}

// Porträts für die Sprechblase
// Menschen sprechen; Fips ist ein Hund und bellt nur. Weitere Personen erscheinen als Emoji.
export function portrait(who) {
  return portraitArt(who) || `<span class="por-emoji">${esc(who)}</span>`;
}
const NAMES = { lina: "Lina", fips: "Fips", brumm: "Schreiner Brumm", "brumm-happy": "Schreiner Brumm", "👩‍🌾": "Bäuerin Hoppe" };

// Dialog: zeigt Zeilen nacheinander. lines: [{who, text}] oder ["fips", "Text"].
// Gibt ein Promise zurück, das nach der letzten Zeile erfüllt wird.
export function talk(host, lines) {
  return new Promise((resolve) => {
    let i = 0;
    const box = document.createElement("div");
    box.className = "talk"; box.setAttribute("role", "dialog"); box.setAttribute("aria-live", "polite");
    host.appendChild(box);
    const show = () => {
      const [who, text] = Array.isArray(lines[i]) ? lines[i] : [lines[i].who, lines[i].text];
      const name = current()?.name || "";
      const t = text.replace(/\{name\}/g, name);
      box.innerHTML = `<div class="talk-por">${portrait(who)}</div>
        <div class="talk-body"><div class="talk-name">${esc(NAMES[who] || "")}</div><p>${mathHtml(t)}</p>
        <div class="talk-actions">${canSpeak() ? '<button class="ghost small" data-say aria-label="Vorlesen">🔊</button>' : ""}
        <button class="btn small" data-next>${i < lines.length - 1 ? "Weiter ▶" : "OK ✓"}</button></div></div>`;
      speak(t);
      box.querySelector("[data-say]")?.addEventListener("click", () => speak(t, true));
      const nb = box.querySelector("[data-next]");
      nb.addEventListener("click", () => { sound("tap"); i++; if (i < lines.length) show(); else { box.remove(); resolve(); } });
      nb.focus({ preventScroll: true });
    };
    show();
  });
}

// kurze Einblendung oben
export function toast(html, ms = 2200) {
  const t = document.createElement("div"); t.className = "toast"; t.innerHTML = html; t.setAttribute("role", "status");
  document.body.appendChild(t); setTimeout(() => t.classList.add("out"), ms); setTimeout(() => t.remove(), ms + 400);
}

// Modales Fenster
export function modal(html, { onClose } = {}) {
  const m = document.createElement("div"); m.className = "modal-back";
  m.innerHTML = `<div class="modal" role="dialog" aria-modal="true">${html}</div>`;
  document.body.appendChild(m);
  const close = () => { m.remove(); onClose?.(); };
  m.addEventListener("click", (e) => { if (e.target === m || e.target.closest("[data-close]")) close(); });
  m.querySelector("button")?.focus();
  return { el: m, close };
}
