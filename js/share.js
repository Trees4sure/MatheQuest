// „Weitersagen“: QR-Code und Link zur eigenen Spieladresse. Der Code entsteht
// auf dem Gerät aus der Adresse, unter der das Spiel gerade läuft – nichts wird übertragen.
import {esc, toast} from './ui.js';

let lib = null;
// Die QR-Bibliothek ist ein klassisches Skript (kein ES-Modul) und wird erst hier geladen.
function loadQr() {
  lib ||= new Promise((resolve, reject) => {
    if (window.qrcode) return resolve(window.qrcode);
    const s = document.createElement('script');
    s.src = 'js/vendor/qrcode.js';
    s.onload = () => (window.qrcode ? resolve(window.qrcode) : reject(new Error('QR-Bibliothek ohne Inhalt')));
    s.onerror = () => { lib = null; reject(new Error('QR-Bibliothek nicht geladen')); };
    document.head.append(s);
  });
  return lib;
}

// Adresse des Spiels ohne Bildschirm-Teil (#/…) und ohne index.html.
export function shareUrl(href = location.href) {
  const u = new URL(href); u.hash = ''; u.search = '';
  u.pathname = u.pathname.replace(/index\.html$/, '');
  return u.href;
}
const isLocal = (url) => /^(localhost|127\.|192\.168\.|10\.|\[::1\])/.test(new URL(url).hostname) || new URL(url).protocol === 'file:';

// Matrix aus dunklen (true) und hellen Feldern, Fehlerkorrektur M.
export function matrix(qrcode, text) {
  const qr = qrcode(0, 'M'); qr.addData(text, 'Byte'); qr.make();
  const n = qr.getModuleCount();
  return Array.from({length: n}, (_, r) => Array.from({length: n}, (_, c) => qr.isDark(r, c)));
}
const QUIET = 4; // heller Rand in Feldern, den Scanner brauchen
function svg(m) {
  const n = m.length, size = n + QUIET * 2;
  let d = '';
  m.forEach((row, r) => row.forEach((on, c) => { if (on) d += `M${c + QUIET} ${r + QUIET}h1v1h-1z`; }));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges" role="img" aria-label="QR-Code mit der Adresse von MatheQuest"><rect width="${size}" height="${size}" fill="#fff"/><path d="${d}" fill="#000"/></svg>`;
}
function png(m, scale = 16) {
  const n = m.length, size = (n + QUIET * 2) * scale, c = document.createElement('canvas');
  c.width = c.height = size; const x = c.getContext('2d');
  x.fillStyle = '#fff'; x.fillRect(0, 0, size, size); x.fillStyle = '#000';
  m.forEach((row, r) => row.forEach((on, col) => { if (on) x.fillRect((col + QUIET) * scale, (r + QUIET) * scale, scale, scale); }));
  return c;
}

export async function run(root) {
  const url = shareUrl();
  root.innerHTML = `<section class="screen share-screen"><button class="ghost" data-go="#/map">← Dorfkarte</button>
    <h1>MatheQuest weitersagen</h1>
    <p>Halte die Kamera eines anderen Handys oder Tablets auf den Code. Dann öffnet sich MatheQuest dort.</p>
    <div class="share-card"><div class="share-qr" data-qr>QR-Code wird gezeichnet …</div>
      <p class="share-url">${esc(url)}</p>
      ${isLocal(url) ? `<p class="share-warn">Diese Adresse gilt nur auf diesem Gerät. Öffne MatheQuest über die Internetadresse (zum Beispiel GitHub Pages), damit andere den Code benutzen können.</p>` : ''}
      <div class="share-actions">
        ${navigator.share ? `<button class="v-primary" data-share>Link teilen</button>` : ''}
        <button class="btn ghost" data-copy>Link kopieren</button>
        <button class="btn ghost" data-save disabled>QR-Code als Bild speichern</button>
        <button class="btn ghost" data-print>Drucken</button>
      </div></div>
    <p class="muted">Jedes Gerät hat seinen eigenen Spielstand. Der Code öffnet nur das Spiel – Namen, Punkte und Notizen werden nicht weitergegeben.</p>
  </section>`;
  const q = (s) => root.querySelector(s);
  q('[data-share]')?.addEventListener('click', () => navigator.share({title: 'MatheQuest – Abenteuer in Rechenbach', text: 'Mathe-Abenteuer im Dorf Rechenbach', url}).catch(() => {}));
  q('[data-copy]').onclick = async () => {
    try { await navigator.clipboard.writeText(url); toast('Link kopiert ✓'); }
    catch { toast('Kopieren geht hier nicht. Tippe die Adresse unter dem Code ab.'); }
  };
  q('[data-print]').onclick = () => window.print();
  try {
    const m = matrix(await loadQr(), url);
    if (!q('[data-qr]')) return; // Bildschirm wurde inzwischen verlassen
    q('[data-qr]').innerHTML = svg(m);
    q('[data-save]').disabled = false;
    q('[data-save]').onclick = () => {
      const a = document.createElement('a'); a.href = png(m).toDataURL('image/png'); a.download = 'MatheQuest-QR-Code.png'; a.click();
    };
  } catch {
    if (q('[data-qr]')) q('[data-qr]').textContent = 'Der QR-Code konnte nicht gezeichnet werden. Der Link darunter funktioniert trotzdem.';
  }
}
