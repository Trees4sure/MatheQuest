/* Stufe C3 und C4: das Zahlenschloss am Festzelt und der eigene Feststand.
   C3: Das Festzelt öffnet sich mit drei Ziffern – je die erste Ziffer eines eigenen Ergebnisses vom Lieferschein
   (nicht die Einerziffer: ab Klasse 3 sind die Ergebnisse Zehner- und Hunderterzahlen, die Einer wären immer 0).
   C4: Jeder gelöste Auftrag bringt ein Bauteil (das Zählbild seines Ortes); auf dem Feststand ordnet das Kind sie selbst an. */
import * as store from './store.js';
import { CHAPTERS, stepTitles } from './journey-logic.js';
import { esc } from './ui.js';
import { sound, confetti } from './fx.js';
import { enableDrag } from './drag.js';

const resText = (r) => `${typeof r.v === 'number' ? String(Math.round(r.v * 100) / 100).replace('.', ',') : r.v}${r.u ? ' ' + r.u : ''}`;
const pic = (c, cls = '') => `<img class="${cls}" src="${c.img}" alt="" draggable="false">`;

/* Drei Hinweise aus drei verschiedenen Orten; nur ganze Zahlen taugen für eine Einerziffer.
   Reihenfolge fest (Bauernhof, Bahnhof, Schreinerei zuerst), damit der Code bei jedem Besuch gleich bleibt. */
export function lockClues(p) {
  const order = ['w1', 'w3', 'w5', 'w2', 'w4', 'w6'], clues = [];
  for (const id of order) {
    if (clues.length === 3) break;
    const s = p.campaign?.chapters?.[id], res = s?.results || [];
    const i = res.findIndex((r) => r && Number.isInteger(r.v) && r.v >= 0);
    if (i >= 0) clues.push({ id, step: i, value: res[i].v, digit: Number(String(res[i].v)[0]) });
  }
  return clues.length === 3 ? clues : null;
}

/* Gibt true zurück, wenn das Schloss gezeigt wird; nach dem Öffnen ruft es weiter(). */
export function lock(root, p, weiter) {
  const clues = lockClues(p);
  if (p.campaign?.zelt || !clues) return false;
  const wheels = [0, 0, 0], ctl = new AbortController();
  root.addEventListener('cleanup', () => ctl.abort(), { once: true });
  let help = -1;
  const draw = () => {
    root.innerHTML = `<section class="f-lock">
      <div class="f-tent" aria-hidden="true"><img src="assets/scenes/dorffest.webp" alt=""><div class="f-flap l"></div><div class="f-flap r"></div><div class="f-padlock">🔒</div></div>
      <div class="f-card"><p class="v-eyebrow">DAS FESTZELT IST NOCH ZU</p><h1>Knack das Zahlenschloss!</h1>
      <p>Bürgermeisterin Nolte hat den Code aus deinen eigenen Ergebnissen gemacht. Jedes Rad braucht die <b>erste Ziffer</b> – die ganz vorne – eines Ergebnisses von deinem Lieferschein.</p>
      <div class="f-wheels">${clues.map((c, i) => {
        const ch = CHAPTERS.find((x) => x.id === c.id), st = p.campaign.chapters[c.id], titles = stepTitles(ch, st.practiceGrade || p.grade);
        return `<div class="f-wheel-box"><div class="f-clue"><img src="${ch.img}" alt=""><b>${esc(ch.short)}</b><small>Auftrag ${c.step + 1}<span class="f-title">: ${esc(titles[c.step])}</span></small></div>
          <div class="f-wheel" aria-label="Rad ${i + 1}"><button class="f-arrow" data-wheel="${i}" data-d="1" aria-label="Rad ${i + 1} höher">▲</button><span class="f-digit" aria-live="polite">${wheels[i]}</span><button class="f-arrow" data-wheel="${i}" data-d="-1" aria-label="Rad ${i + 1} niedriger">▼</button></div>
          <details class="f-schein"><summary><span aria-hidden="true">📋</span> Lieferschein</summary><ol>${(st.results || []).map((r, k) => `<li>${k + 1}. ${r ? esc(resText(r)) : '–'}</li>`).join('')}</ol></details>
          ${help === i ? `<p class="f-help">Das Ergebnis war <b>${c.value}</b>. Die erste Ziffer steht ganz vorne.</p>` : ''}</div>`;
      }).join('')}</div>
      <p class="f-status" role="status"></p>
      <div class="f-actions"><button class="v-primary" data-try>Schloss öffnen 🔑</button><button class="ghost" data-help>Tipp</button></div></div></section>`;
  };
  draw();
  root.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.wheel !== undefined) { const i = +b.dataset.wheel; wheels[i] = (wheels[i] + Number(b.dataset.d) + 10) % 10; sound('tap'); b.parentElement.querySelector('.f-digit').textContent = wheels[i]; return; }
    if (b.hasAttribute('data-help')) { help = (help + 1) % 3; while (help < 3 && wheels[help] === clues[help].digit) help++; if (help >= 3) help = 0; draw(); return; }
    if (b.hasAttribute('data-try')) {
      const ok = clues.map((c, i) => wheels[i] === c.digit);
      if (ok.every(Boolean)) {
        p.campaign.zelt = true; store.save(); sound('win'); confetti(60);
        root.querySelector('.f-lock').classList.add('open');
        root.querySelector('.f-status').textContent = 'Klick! Das Festzelt geht auf!';
        setTimeout(() => { ctl.abort(); weiter(); }, 1400);
      } else {
        sound('wrong');
        const n = ok.filter(Boolean).length;
        root.querySelector('.f-status').textContent = n ? `${n} von 3 Rädern stimmen schon. Schau noch einmal auf die Lieferscheine.` : 'Noch klemmt das Schloss. Such auf jedem Lieferschein das richtige Ergebnis.';
        root.querySelector('.f-padlock')?.animate([{ transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'none' }], { duration: 300, iterations: 2 });
      }
    }
  }, { signal: ctl.signal });
  return true;
}

/* ---------- C4: Mein Feststand ---------- */
export function pieces(p) {
  const list = [];
  for (const c of CHAPTERS) {
    const s = p.campaign?.chapters?.[c.id], n = s?.completed ? 5 : Math.min(5, s?.step || 0);
    for (let k = 0; k < n; k++) list.push({ id: `${c.id}-${k}`, c });
  }
  if (CHAPTERS.every((c) => p.campaign?.chapters?.[c.id]?.completed)) list.push({ id: 'kuchen', c: { img: 'assets/chars/festkuchen.webp', short: 'Festkuchen' }, big: true });
  return list;
}

/* Gleiche Bauteile liegen in der Ablage als ein Stapel mit Zähler (5 gleiche Eier wirken sonst wie eine Liste). */
const groups = (list) => Object.values(list.reduce((m, x) => { const k = x.big ? 'kuchen' : x.c.id; (m[k] ||= []).push(x); return m; }, {}));
export function stand(root) {
  const p = store.current(); p.campaign ||= { chapters: {} };
  const pos = p.campaign.stand ||= {}, all = pieces(p), ctl = new AbortController();
  root.addEventListener('cleanup', () => ctl.abort(), { once: true });
  const place = (id, x, y) => { pos[id] = [Math.round(Math.max(4, Math.min(96, x))), Math.round(Math.max(8, Math.min(94, y)))]; store.save(); };
  /* Antippen legt ein Bauteil auf den nächsten freien Platz der Theke. */
  const autoSpot = () => { const used = Object.values(pos).length; return [10 + (used * 13) % 80, 70 - Math.floor(used / 7) * 14]; };
  const draw = () => {
    const placed = all.filter((x) => pos[x.id]), free = all.filter((x) => !pos[x.id]);
    root.innerHTML = `<section class="s-screen">
      <header class="s-head"><p class="v-eyebrow">MEIN FESTSTAND</p><h1>${esc(p.name)}s Stand</h1><p>${all.length ? `Jeder gelöste Auftrag bringt ein Bauteil. Zieh die Sachen auf deinen Stand und ordne sie, wie es dir gefällt. <b>${all.filter((x) => !x.big).length} von 30</b> Bauteilen verdient${all.some((x) => x.big) ? ' – und der Festkuchen!' : '.'}` : 'Noch ist dein Stand leer. Löse Aufträge im Dorf – jeder bringt dir ein Bauteil.'}</p></header>
      <div class="s-stall" data-drop="stall" aria-label="Dein Feststand">
        <div class="s-awning" aria-hidden="true"></div><div class="s-sign">${esc(p.name)}s Leckereien</div>
        <div class="s-posts" aria-hidden="true"><i></i><i></i></div><div class="s-counter" aria-hidden="true"></div>
        ${placed.map((x) => `<button class="s-piece${x.big ? ' big' : ''}" data-drag data-from="stall" data-id="${x.id}" style="--x:${pos[x.id][0]}%;--y:${pos[x.id][1]}%" aria-label="${esc(x.c.short)} – antippen legt es zurück">${pic(x.c)}</button>`).join('')}
      </div>
      <div class="s-tray" data-drop="tray"><p>${free.length ? `Deine Bauteile (${free.length}) – ziehen oder antippen:` : all.length ? 'Alles steht auf dem Stand. Toll sieht er aus!' : ''}</p>
        <div class="s-tray-items">${groups(free).map((g) => `<button class="s-piece tray${g[0].big ? ' big' : ''}" data-drag data-from="tray" data-id="${g[0].id}" aria-label="${esc(g[0].c.short)}: noch ${g.length} – auf den Stand legen">${pic(g[0].c)}${g.length > 1 ? `<b class="s-count">×${g.length}</b>` : ''}</button>`).join('')}</div></div>
      <div class="s-actions">${placed.length ? '<button class="ghost" data-clear>Alles wieder einpacken</button>' : ''}<button class="v-primary" data-go="#/map">Zurück ins Dorf</button></div>
    </section>`;
  };
  draw();
  enableDrag(root, { signal: ctl.signal, onDrop(src, t, e) {
    const id = src.dataset.id;
    if (t.dataset.drop === 'stall') { const r = t.getBoundingClientRect(); place(id, (e.clientX - r.left) / r.width * 100, (e.clientY - r.top) / r.height * 100); sound('tap'); }
    else if (t.dataset.drop === 'tray') { delete pos[id]; store.save(); }
    draw();
  } });
  root.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.id) { if (pos[b.dataset.id]) delete pos[b.dataset.id]; else { const [x, y] = autoSpot(); place(b.dataset.id, x, y); } store.save(); sound('tap'); draw(); return; }
    if (b.hasAttribute('data-clear')) { for (const k of Object.keys(pos)) delete pos[k]; store.save(); draw(); }
  }, { signal: ctl.signal });
}
