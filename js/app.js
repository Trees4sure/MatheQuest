// MatheQuest – App-Hülle: Router und Bildschirme (Start, Karte, Region, Sammlung, Erwachsene).
// Spielwelt (adventures/), Aufgabenlogik (generators.js, answer.js), Kompetenzmodell (competence.js)
// und Speicherung (store.js) sind getrennte Module.

import * as store from "./store.js";
import {installNotebook} from "./notebook.js";
import { WORLDS, TOPIC_BY_ID, AREAS } from "./curriculum.js";
import { STORY, GREETINGS, BADGES, COSMETICS, BREAK_TEXT, VILLAGE } from "./content.js";
import { dueSkills, describe, rec } from "./competence.js";
import { fips, sticker } from "./art.js";
import { mascotHtml as mascot } from "./sprites.js";
import { $, $$, esc, pick, toast, modal, talk } from "./ui.js";
import { sound, confetti, stopSpeaking, canSpeak } from "./fx.js";
import * as play from "./play.js";
import * as workshop from "./anschaulich.js";
import * as rooms from "./lernorte.js";
import * as explore from "./questworld.js";
import * as journey from "./journey.js";
import * as klasse7 from "./klasse7.js";
import { ROOMS } from "./lernorte-logic.js";

const main = $("#app");
installNotebook(main);
const AVATARS = ["🦊", "🐰", "🐻", "🐼", "🐯", "🦁", "🐸", "🐙", "🐴", "🐢", "🦉", "🐧"];
const ADVENTURES = {
  bridge: { name: "Die kaputte Brücke am Dorfbach", emoji: "🌉", desc: "Hilf Schreiner Brumm, die Brücke nach dem Sturm zu reparieren – mit genau passenden Brettern.", load: () => import("./adventures/bridge.js") },
  hoppel: { name: "Hoppel im Gemüsegarten", emoji: "🐇", desc: "Bäuerin Hoppes Hase ist ausgebüxt. Leg die Möhre auf den richtigen Trittstein!", needs: "bridge", load: () => import("./adventures/hoppel.js") },
};
const ADV_SKILLS = { "adv-zahlenstrahl": "Am Zahlenstrahl vorwärts und rückwärts hüpfen (Plus/Minus bis 20)" };

function applySettings() {
  const s = store.settings();
  document.documentElement.classList.toggle("reduce-motion", !!s.reducedMotion);
}
applySettings();

const go = (hash) => { if (location.hash === hash) route(); else location.hash = hash; };
const onBadges = (list) => list?.forEach((b, i) => setTimeout(() => { sound("level"); confetti(50); toast(`<b>${b.emoji} Neues Abzeichen!</b><br>${esc(b.name)}`, 3200); }, i * 1200));

// ---------------- Router ----------------
async function route() {
  main.dispatchEvent(new Event("cleanup"));
  stopSpeaking();
  $$(".talk, .modal-back, .drag-ghost").forEach((e) => e.remove());
  const [, page, arg] = (location.hash || "#/").split("/");
  if (!store.current() && page !== "new") return store.profiles().length ? screenProfiles() : screenNew();
  window.scrollTo(0, 0);
  switch (page) {
    case "reise": return journey.run(main, { go, onBadges }, arg);
    case "dorffest": return journey.finale(main, { go });
    case "hilfe": return journey.help(main);
    case "training": return screenMap();
    case "new": return screenNew();
    case "profiles": return screenProfiles();
    case "region": return screenRegion(WORLDS.find((w) => w.id === arg) || WORLDS[0]);
    case "adv": {
      const a = ADVENTURES[arg]; if (!a) return go("#/map");
      const mod = await a.load(); return mod.run(main, { go, onBadges });
    }
    case "train": { const t = TOPIC_BY_ID[arg]; if (!t) return go("#/map"); return play.start(main, { mode: "train", topic: t }, { go, onBadges, back: () => go(`#/region/${t.world.id}`) }); }
    case "duel": { const w = WORLDS.find((x) => x.id === arg); return play.start(main, { mode: "duel", world: w }, { go, onBadges, back: () => go(`#/region/${w.id}`) }); }
    case "review": {
      const skills = dueSkills(store.current()).filter((s) => TOPIC_BY_ID[s]);
      if (!skills.length) { toast("Gerade ist nichts zum Wiederholen fällig. 👍"); return go("#/map"); }
      return play.start(main, { mode: "review", skills, world: TOPIC_BY_ID[skills[0]].world }, { go, onBadges, back: () => go("#/map") });
    }
    case "repair": {
      if (!store.current().mistakes.length) { toast("Die Werkstatt ist leer – keine offenen Fehler! 🎉"); return go("#/map"); }
      return play.start(main, { mode: "repair", world: store.homeWorld() }, { go, onBadges, back: () => go("#/map") });
    }
    case "werkstatt": return workshop.run(main, { go });
    case "ort": return rooms.run(main, { go, onBadges }, arg);
    case "explore": return explore.run(main, { go, onBadges }, arg);
    case "klasse7": return klasse7.run(main, { go, onBadges });
    case "ranking": return screenRanking();
    case "fest": return screenFinale();
    case "collection": return screenCollection();
    case "adults": return screenAdults();
    default: return journey.home(main, { go });
  }
}
addEventListener("hashchange", route);

// ---------------- Kopfzeile ----------------
function topbar() {
  const p = store.current(), li = store.levelInfo();
  return `<header class="topbar">
    <button class="who" data-go="#/profiles" aria-label="Kind wechseln"><span class="ava">${p.avatar}</span><span class="who-txt"><b>${esc(p.name)}</b><small>${li.rank.emoji} ${li.rank.title}</small></span></button>
    <div class="xp" title="Erfahrung"><div class="xp-l">Lv ${li.level}</div><div class="xp-bar"><div style="width:${(li.into / li.need) * 100}%"></div></div></div>
    <div class="hud"><span title="Sticker">🌟 ${p.shards}</span><span title="Münzen">🪙 ${p.coins}</span></div>
  </header>`;
}
main.addEventListener("click", (e) => { const g = e.target.closest("[data-go]"); if (g) { sound("tap"); go(g.dataset.go); } });

// ---------------- Profile ----------------
function screenProfiles() {
  const list = store.profiles();
  main.innerHTML = `<section class="screen center">
    <div class="hero-fips">${mascot()}</div>
    <h1>Wer spielt heute?</h1>
    <button class="quick-btn" data-go="#/ranking">🏆 Lokale Rangliste aller Profile ansehen</button>
    <div class="profile-list">${list.map((p) => `<button class="profile-btn" data-pid="${p.id}"><span class="ava big">${p.avatar}</span><b>${esc(p.name)}</b><small>Klasse ${p.grade}</small></button>`).join("")}
    <button class="profile-btn add" data-go="#/new"><span class="ava big">＋</span><b>Neues Kind</b></button></div>
  </section>`;
  $$("[data-pid]", main).forEach((b) => (b.onclick = () => { store.useProfile(b.dataset.pid); sound("tap"); go("#/map"); }));
}

function screenNew() {
  let avatar = AVATARS[0], grade = 1, hero = "lina";
  main.innerHTML = `<section class="screen center new">
    <div class="hero-fips">${mascot({ mood: "happy" })}</div>
    <h1>Willkommen in ${VILLAGE}!</h1>
    <p class="story">${esc(STORY.intro)}</p>
    <label class="field"><span>Wie heißt du?</span><input data-name maxlength="16" autocomplete="off" placeholder="Dein Name"></label>
    <div class="field"><span>Deine Spielfigur</span><div class="hero-choose"><button type="button" data-hero="lina" class="on"><img src="assets/chars/lina-froh.webp" alt="Lina"><b>Lina</b></button><button type="button" data-hero="ben"><img src="assets/chars/ben-froh.webp" alt="Ben"><b>Ben</b></button></div></div>
    <div class="field"><span>Wähle dein Tier</span><div class="ava-grid">${AVATARS.map((a, i) => `<button class="ava-pick${i ? "" : " on"}" data-ava="${a}" aria-label="Tier ${a}">${a}</button>`).join("")}</div></div>
    <div class="field"><span>In welche Klasse gehst du?</span><div class="grade-row">${[1, 2, 3, 4, 5, 6, 7].map((g) => `<button class="grade-btn${g === 1 ? " on" : ""}" data-grade="${g}">${g}</button>`).join("")}</div></div>
    <button class="btn big" data-create>Abenteuer starten →</button>
    ${store.profiles().length ? `<button class="ghost" data-go="#/profiles">Zurück</button>` : ""}
  </section>`;
  main.querySelector("[data-name]").focus();
  $$("[data-ava]", main).forEach((b) => (b.onclick = () => { avatar = b.dataset.ava; $$("[data-ava]", main).forEach((x) => x.classList.toggle("on", x === b)); sound("tap"); }));
  $$("[data-hero]", main).forEach((b) => (b.onclick = () => { hero = b.dataset.hero; $$("[data-hero]",main).forEach(el=>el.classList.toggle("on",el===b)); sound("tap"); }));
  $$("[data-grade]", main).forEach((b) => (b.onclick = () => { grade = +b.dataset.grade; $$("[data-grade]", main).forEach((x) => x.classList.toggle("on", x === b)); sound("tap"); }));
  $("[data-create]", main).onclick = () => {
    const name = $("[data-name]", main).value.trim();
    if (!name) { $("[data-name]", main).focus(); return toast("Wie heißt du? 🙂"); }
    store.createProfile({ name, avatar, grade, hero }); sound("win");
    go("#/map");
  };
}

// ---------------- Dorfkarte ----------------
function greeting() {
  const p = store.current(), h = new Date().getHours();
  return pick(GREETINGS[h < 11 ? "morning" : h < 18 ? "day" : "evening"]).replace("{name}", p.name);
}
function screenMap() {
  const p = store.current(), due = dueSkills(p).filter((s) => TOPIC_BY_ID[s]).length, goals = store.goals();
  const d = store.day();
  main.innerHTML = `${topbar()}${journey.nav("training")}<section class="screen map">
    <div class="greet"><div class="greet-fips">${mascot({ hat: p.cosmetic })}</div><div class="bubble">${esc(greeting())}</div></div>
    <div class="goals">${goals.map((g) => `<div class="goal"><span>${g.emoji}</span>${esc(g.text)}</div>`).join("")}
      <div class="daybar" aria-label="Tagesziel"><div style="width:${Math.min(100, (d.solved / p.dailyGoal) * 100)}%"></div></div></div>
    <div class="quick">
      ${due ? `<button class="quick-btn" data-go="#/review">🔁 Wiederholen <b>${due}</b></button>` : ""}
      ${p.mistakes.length ? `<button class="quick-btn" data-go="#/repair">🔧 Fehler-Werkstatt <b>${p.mistakes.length}</b></button>` : ""}
      <button class="quick-btn" data-go="#/collection">🎒 Sammlung</button>
      <button class="quick-btn" data-go="#/ranking">🏆 Rangliste</button>
      <button class="quick-btn" data-go="#/klasse7">📘 Klasse 7 · Profi-Labor</button>
      <button class="quick-btn" data-go="#/explore/wald">🌳 Bonus: Rätselpfad am Dorfbach</button>
    </div>
    <h2 class="map-h">Üben & Entdecken</h2><button class="ghost" data-go="#/map">← Zur Abenteuerkarte</button><div class="map-illustration"><img src="assets/scenes/rechenbach-karte.webp" alt="Blick auf das Dorf Rechenbach mit seinen Spielorten"><div class="map-illustration-caption">Sechs Orte. Viele Wege. Jeden Tag neue Aufgaben.</div></div>
    <div class="numeria">${WORLDS.map((w, i) => {
      const stars = store.worldStars(w), max = w.topics.length * 3, home = w.grade === p.grade, roomDone = !!p.rooms?.[w.id]?._mission?.done;
      return `<button class="region${home ? " home" : ""}${p.bosses[w.id] ? " cleared" : ""}" data-go="#/region/${w.id}" style="--c:${w.color};--i:${i}">
        <span class="r-emo">${w.emoji}</span><span class="r-txt"><b>${esc(w.name)}</b><small>Schwerpunkt Klasse ${w.grade}</small>
        <span class="r-stars">⭐ ${stars}/${max}${p.bosses[w.id] ? " · 🪪 Stempel" : ""}${roomDone ? " · ✓ Dorfauftrag" : ""}</span></span>${home ? `<span class="r-you">${p.avatar} Hier bist du</span>` : ""}</button>`;
    }).join("")}</div>
    <footer class="foot">Offline spielbar · Keine Anmeldung · Keine Werbung · Kein Tracking<br><button class="ghost small" data-go="#/adults">👪 Für Erwachsene</button></footer>
  </section>`;
}

// ---------------- Region ----------------
function screenRegion(w) {
  const p = store.current(), due = dueSkills(p).filter((s) => TOPIC_BY_ID[s]?.world.id === w.id).length;
  const advs = w.id === "w1" ? Object.entries(ADVENTURES) : [];
  main.innerHTML = `${topbar()}<section class="screen region-screen" style="--c:${w.color}">
    <div class="banner"><button class="ghost back" data-go="#/map" aria-label="Zur Karte">←</button><span class="b-emo">${w.emoji}</span><div><h1>${esc(w.name)}</h1><p>${esc(w.intro)}</p><div class="cast">${w.cast.map((c) => `<span>${esc(c)}</span>`).join("")}</div></div></div>
    ${advs.length ? `<h2>🧭 Abenteuer</h2><div class="adv-list">${advs.map(([id, a]) => {
      const locked = a.needs && !p.adv[a.needs]?.done, done = p.adv[id]?.done;
      return locked ? `<div class="adv-card locked"><span class="a-emo">🔒</span><div><b>${esc(a.name)}</b><small>Schalte es frei: ${esc(ADVENTURES[a.needs].name)}</small></div></div>`
        : `<button class="adv-card${done ? " done" : " new"}" data-go="#/adv/${id}"><span class="a-emo">${a.emoji}</span><div><b>${esc(a.name)}</b><small>${esc(a.desc)}</small></div><span class="a-state">${done ? "✓ Nochmal" : "Los ▶"}</span></button>`;
    }).join("")}</div>`
      : `<p class="note">Am Lernort gibt es täglich neue Aufgaben zu entdecken. Du kannst alle Tätigkeiten beliebig wiederholen.</p>`}
    <h2>🧭 Dorf erkunden</h2><div class="room-entry"><p>Bewege Lina oder Ben durch die gemalte Landschaft, entdecke fünf Fundstellen und löse dort immer wieder neue Quests.</p><button class="btn big" data-go="#/explore/${w.id}"> ${w.emoji} Auf Entdeckungstour gehen →</button></div>
    ${w.id==="w6"?`<button class="quick-btn" data-go="#/klasse7">📘 Mathe-Labor Klasse 7: Brüche, Prozent, Dreisatz und Gleichungen</button>`:""}
    <h2>🏡 Hier mithelfen – so oft du willst</h2><div class="room-entry"><p>Fünf unterschiedliche Tätigkeiten an diesem Ort. Jede Aufgabe ist neu, mit Bildern, Tipps und verständlichen Lösungswegen.</p><button class="btn big" data-go="#/ort/${w.id}"> ${ROOMS[w.id].emoji} Zum Lernort · fünf Mitmachspiele →</button></div><h2>🧮 Mathe-Werkstatt</h2><button class="quick-btn" data-go="#/werkstatt">Punkte legen, Zahlenstrahl und Einkaufen – immer neue Aufgaben mit Hilfen</button>
    <h2>🏋️ Training</h2>
    <div class="topics">${w.topics.map((t) => {
      const r = rec(p, t.id), stars = store.topicStars(t.id);
      return `<button class="topic" data-go="#/train/${t.id}"><span class="t-emo">${t.emoji}</span><b>${esc(t.name)}</b>
        <small class="area">${esc(AREAS[t.area])}</small><span class="t-meta"><span class="lvl-pips" aria-label="Stufe ${r.level} von 5">${[1, 2, 3, 4, 5].map((k) => `<i class="${k <= r.level ? "on" : ""}"></i>`).join("")}</span><span>${"⭐".repeat(stars)}${"☆".repeat(3 - stars)}</span></span></button>`;
    }).join("")}</div>
    <h2>🏆 Rechen-Wettstreit</h2>
    <div class="duel-card">${store.bossReady(w)
      ? `<button class="btn big duel-btn" data-go="#/duel/${w.id}">${w.boss.emoji} Gegen ${esc(w.boss.name)} antreten${p.bosses[w.id] ? " (nochmal)" : ""}</button>`
      : `<p>${w.boss.emoji} <b>${esc(w.boss.name)}</b> wartet auf einen Rechen-Wettstreit. Hol dir in der Hälfte der Trainings einen Stern, dann geht's los. Wer gewinnt, bekommt den Stempel für den Dorfpass.</p>`}</div>
    ${due ? `<button class="quick-btn" data-go="#/review">🔁 ${due} Thema${due > 1 ? "en" : ""} wiederholen</button>` : ""}
  </section>`;
}

// ---------------- Sammlung: Dorfpass, Sticker, Abzeichen, Fips' Sachen ----------------
const SHOP = { crown: 150 };
function screenRanking(){
  const players=[...store.profiles()].sort((a,b)=>(b.xp||0)-(a.xp||0)||(b.stats?.correct||0)-(a.stats?.correct||0));
  main.innerHTML=`${topbar()}<section class="screen ranking-screen"><div class="banner plain"><button class="ghost back" data-go="#/map">←</button><h1>🏆 Unsere Rechen-Rangliste</h1></div>
    <p>Vergleiche die Punkte aller Kinder, die auf <b>diesem Gerät und in diesem Browser</b> spielen. Es gibt keine öffentliche Online-Rangliste und keine Datenübertragung.</p>
    <div class="ranking-board">${players.map((p,i)=>`<div class="ranking-entry ${p.id===store.current().id?'mine':''}"><span class="ranking-rank">${i===0?'🥇':i===1?'🥈':i===2?'🥉':'#'+(i+1)}</span><span class="ranking-char"><img src="assets/chars/${p.hero==='ben'?'ben':'lina'}-froh.webp" alt=""></span><div><b>${esc(p.name)}</b><small>Klasse ${p.grade} · ${p.stats?.correct||0} gelöste Aufgaben · ${p.stats?.withHint||0} mit Hilfe</small></div><strong>${p.xp||0} XP</strong></div>`).join('')}</div><p>Jede Person sammelt eigene Punkte und Lernfortschritte. Auch wer Tipps benutzt, kann Punkte verdienen.</p><button class="btn" data-go="#/profiles">Spieler wechseln</button></section>`;
}

function screenCollection() {
  const p = store.current();
  main.innerHTML = `${topbar()}<section class="screen">
    <div class="banner plain"><button class="ghost back" data-go="#/map" aria-label="Zurück">←</button><h1>🎒 Deine Sammlung</h1></div>
    <h2>Deine Abenteuer-Stempel</h2><div class="v-stamps">${[1,2,3,4,5,6].map(i=>`<span class="journey-stamp ${p.campaign?.chapters?.["w"+i]?.completed?"earned":""}">${p.campaign?.chapters?.["w"+i]?.completed?"✓":i}</span>`).join("")}</div>${[1,2,3,4,5,6].every(i=>p.campaign?.chapters?.["w"+i]?.completed)?`<button class="btn" data-go="#/dorffest">Zum Dorffest und zur Urkunde</button>`:""}<h2>🪪 Deine Trainings-Stempel</h2>
    <div class="crystals">${WORLDS.map((w) => `<div class="crystal stamp${p.bosses[w.id] ? " have" : ""}" style="--c:${w.color}" title="${esc(w.name)}"><span class="stamp-emo">${w.emoji}</span><small>${esc(w.name)}</small></div>`).join("")}</div>
    <p class="muted">Gewinne den Rechen-Wettstreit an jedem Ort – mit allen 6 Stempeln bist du Ehrengast beim Dorffest! · Sticker im Album: ${p.shards} ${sticker(20)}</p>
    ${WORLDS.every(w=>p.bosses[w.id]) ? `<button class="btn big" data-go="#/fest">🎉 Dorffest eröffnen · Deine Urkunde</button>` : `<p class="muted">Noch ${WORLDS.filter(w=>!p.bosses[w.id]).length} Stempel bis zur Dorffest-Urkunde.</p>`}
    <h2>🐕 Fips' Sachen</h2>
    <div class="wardrobe"><div class="ward-fips">${fips({ hat: p.cosmetic })}</div><div class="ward-items">${Object.entries(COSMETICS).map(([id, c]) => {
      const own = p.owned.includes(id), price = SHOP[id];
      return `<button class="ward-item${p.cosmetic === id ? " on" : ""}${own ? "" : " locked"}" data-cos="${id}">${c.emoji || "🚫"}<small>${esc(c.name)}</small>${own ? "" : price ? `<b>${price} 🪙</b>` : "<b>🔒 Abenteuer</b>"}</button>`;
    }).join("")}</div></div>
    <h2>🏅 Abzeichen</h2>
    <div class="badges">${BADGES.map((b) => `<div class="badge${p.badges[b.id] ? " have" : ""}"><span>${b.emoji}</span><b>${esc(b.name)}</b><small>${esc(b.desc)}</small></div>`).join("")}</div>
  </section>`;
  let armed = null;
  $$("[data-cos]", main).forEach((b) => (b.onclick = () => {
    const id = b.dataset.cos;
    if (p.owned.includes(id)) { store.updateProfile({ cosmetic: id }); sound("tap"); return screenCollection(); }
    const price = SHOP[id]; if (!price) return toast("🔒 Das gibt es in einem Abenteuer!");
    if (p.coins < price) return toast(`Dir fehlen noch ${price - p.coins} 🪙`);
    if (armed !== id) { armed = id; return toast(`Nochmal tippen zum Kaufen (${price} 🪙)`); }
    store.updateProfile({ coins: p.coins - price, cosmetic: id }); store.unlockCosmetic(id); sound("win"); confetti(); screenCollection();
  }));
}

// ---------------- Dorffest-Finale nach sechs Stempeln ----------------
function screenFinale(){
  const p=store.current();
  if(!WORLDS.every(w=>p.bosses[w.id])) return go("#/collection");
  main.innerHTML = `${topbar()}<section class="screen finale-screen">
    <div class="finale-image"><img src="assets/scenes/dorffest.webp" alt="Feststände und Dorfplatz Rechenbach"></div>
    <div class="finale-certificate"><p class="cert-top">DORF RECHENBACH · DORFPASS</p><h1>Urkunde</h1><div class="cert-stamps">${WORLDS.map(w=>`<span title="${esc(w.name)}">${w.emoji}</span>`).join("")}</div><p>Du hast an allen sechs Orten mitgerechnet und die Rechen-Wettstreite gewonnen.</p><h2>${esc(p.name)}</h2><p>ist Ehrengast beim Dorffest!</p><p class="cert-bottom">Lina, Fips und das ganze Dorf freuen sich mit dir.</p></div>
    <div class="row-actions"><button class="btn big" data-print>Urkunde drucken</button><button class="btn ghost" data-go="#/map">Wieder ins Dorf</button></div>
    <p>Alle Lernorte bleiben geöffnet. Du kannst jederzeit neue Aufgaben lösen und deine Stufen verbessern.</p>
  </section>`;
  main.querySelector("[data-print]").onclick=()=>window.print();
}

// ---------------- Erwachsenenbereich ----------------
function screenAdults() {
  main.innerHTML = `<section class="screen center"><h1>👪 Für Erwachsene</h1><p>Bitte die Taste 3 Sekunden gedrückt halten.</p>
    <button class="btn big hold" data-hold><span>Gedrückt halten</span><i></i></button><button class="ghost" data-go="#/map">Zurück</button></section>`;
  const b = $("[data-hold]", main); let t = null;
  const startHold = (e) => { e.preventDefault(); b.classList.add("holding"); t = setTimeout(adultsInner, 3000); };
  const stopHold = () => { b.classList.remove("holding"); clearTimeout(t); };
  b.addEventListener("pointerdown", startHold); ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => b.addEventListener(ev, stopHold));
  b.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.repeat) startHold(e); }); b.addEventListener("keyup", stopHold);
}
function adultsInner() {
  const p = store.current(), s = store.settings(), due = dueSkills(p);
  const acc = p.stats.solved ? Math.round((p.stats.correct / p.stats.solved) * 100) : 0;
  const skillRow = (id, label, miscon) => {
    const r = p.skills[id]; if (!r || !r.n) return "";
    const err = Object.entries(r.errs || {}).sort((a, b) => b[1] - a[1])[0];
    return `<tr><td>${esc(label)}</td><td>${r.level}/5</td><td><span class="state s-${describe(r).replace(/\s/g, "-")}">${describe(r)}</span></td><td>${r.n}</td><td>${Math.round((r.ok / r.n) * 100)} %</td><td>${r.hint}</td><td>${r.due ? r.due.split("-").reverse().slice(0, 2).join(".") + "." : "–"}</td><td class="mis">${err ? esc(err[0]) + " (" + err[1] + "×)" : ""}${miscon?.length && r.m < 0.6 ? `<br><small>Achten auf: ${esc(miscon[0])}</small>` : ""}</td></tr>`;
  };
  const rows = WORLDS.map((w) => w.topics.map((t) => skillRow(t.id, `${w.emoji} ${t.name}`, t.miscon)).join("")).join("") + Object.entries(ADV_SKILLS).map(([id, l]) => skillRow(id, "🧭 " + l)).join("");
  main.innerHTML = `<section class="screen adults">
    <div class="banner plain"><button class="ghost back" data-go="#/map" aria-label="Zurück">←</button><h1>👪 Erwachsenenbereich</h1></div>
    <div class="panel"><h2>${p.avatar} ${esc(p.name)}</h2>
      <div class="stats"><div><b>${p.stats.solved}</b><small>Aufgaben</small></div><div><b>${acc} %</b><small>richtig</small></div><div><b>${p.stats.second}</b><small>im 2. Versuch</small></div><div><b>${p.stats.withHint}</b><small>mit Tipp</small></div><div><b>${p.stats.mistakesFixed}</b><small>Fehler repariert</small></div><div><b>${p.days.length}</b><small>Übungstage</small></div><div><b>${store.day().minutes}</b><small>Min. heute</small></div><div><b>${p.stats.minutes}</b><small>Min. gesamt</small></div></div>
    </div>
    <div class="panel"><h2>⚙️ Einstellungen</h2>
      <label class="set">Spielfigur <select data-hero-setting><option value="lina" ${p.hero!=="ben"?"selected":""}>Lina</option><option value="ben" ${p.hero==="ben"?"selected":""}>Ben</option></select></label>
      <label class="set">Klassenstufe <select data-set="grade">${[1, 2, 3, 4, 5, 6, 7].map((g) => `<option ${g === p.grade ? "selected" : ""}>${g}</option>`).join("")}</select></label>
      <label class="set">Tagesziel (Aufgaben) <select data-set="dailyGoal">${[5, 10, 15, 20, 30].map((g) => `<option ${g === p.dailyGoal ? "selected" : ""}>${g}</option>`).join("")}</select></label>
      <label class="set">Pause empfehlen nach <select data-gset="breakMinutes">${[10, 15, 20, 30, 45, 0].map((m) => `<option value="${m}" ${m === s.breakMinutes ? "selected" : ""}>${m ? m + " Minuten" : "nie"}</option>`).join("")}</select></label>
      <label class="set"><input type="checkbox" data-gset="sound" ${s.sound ? "checked" : ""}> Töne und Vibration</label>
      ${canSpeak() ? `<label class="set"><input type="checkbox" data-gset="speech" ${s.speech ? "checked" : ""}> Aufgaben automatisch vorlesen</label>` : ""}
      <label class="set"><input type="checkbox" data-gset="reducedMotion" ${s.reducedMotion ? "checked" : ""}> Weniger Bewegung (Animationen reduzieren)</label>
      <label class="set">Grafik der Brückenszene <select data-sset="art"><option value="bild" ${s.art !== "svg" ? "selected" : ""}>Gemaltes Bild (Test)</option><option value="svg" ${s.art === "svg" ? "selected" : ""}>Alte Zeichnung</option></select></label>
    </div>
    <div class="panel"><h2>🏘️ Dorfaufträge und Mitmachspiele</h2><div class="room-admin">${WORLDS.map(w=>{const r=p.rooms?.[w.id]||{},done=r._mission?.done,count=r._mission?.count||0,activities=ROOMS[w.id].actions.reduce((sum,[id])=>sum+(r[id]?.solved||0),0);return `<div><b>${w.emoji} ${esc(w.name)}</b><span>${done?"✓ Dorfauftrag geschafft":`${count}/5 für den Dorfauftrag`}</span><small>${activities} Mitmachaufgaben gelöst</small></div>`}).join("")}</div></div><div class="panel"><h2>📈 Lernfortschritt</h2>
      <p class="muted">Stufe steigt nach 3 sicheren Antworten in Folge und sinkt nach 2 Fehlschlägen. Die Bearbeitungszeit beeinflusst die Stufe nicht. Wiederholungen nach 1, 3, 7, 14, 30 Tagen.${due.length ? ` <b>${due.length} Thema/Themen heute zur Wiederholung fällig.</b>` : ""}</p>
      ${rows ? `<div class="table-wrap"><table><thead><tr><th>Thema</th><th>Stufe</th><th>Stand</th><th>Aufg.</th><th>1. Versuch</th><th>Tipps</th><th>Wiederh.</th><th>Häufige Fehler</th></tr></thead><tbody>${rows}</tbody></table></div>` : "<p>Noch keine Aufgaben gelöst.</p>"}
    </div>
    <div class="panel"><h2>🔒 Datenschutz</h2><p>Alle Daten bleiben auf diesem Gerät (localStorage). Es gibt kein Konto, keine Werbung, keine Tracker und keine Verbindung zu fremden Servern. Aufgaben werden von geprüften Generatoren erzeugt – nicht von einer KI zur Laufzeit.</p>
      <div class="row-actions"><button class="btn ghost" data-go="#/profiles">Kind wechseln</button><button class="btn ghost" data-go="#/new">Kind hinzufügen</button><button class="btn danger" data-del>Profil löschen</button></div><h3>Spielstand sichern</h3><p class="muted">Eine JSON-Sicherung enthält alle Profile auf diesem Gerät. Die Datei bleibt bei dir und wird nicht hochgeladen.</p><div class="row-actions"><button class="btn ghost" data-export>Sicherung herunterladen</button><label class="backup-import">Sicherung importieren <input type="file" accept=".json,application/json" data-import></label></div></div>
  </section>`;
  $$("[data-hero-setting]", main).forEach(el => (el.onchange = () => {store.updateProfile({hero:el.value==="ben"?"ben":"lina"});toast("Spielfigur gespeichert ✓");}));
  $$("[data-set]", main).forEach((el) => (el.onchange = () => { store.updateProfile({ [el.dataset.set]: +el.value }); toast("Gespeichert ✓"); }));
  $$("[data-sset]", main).forEach((el) => (el.onchange = () => { store.setSetting(el.dataset.sset, el.value); toast("Gespeichert ✓"); }));
  $$("[data-gset]", main).forEach((el) => (el.onchange = () => { store.setSetting(el.dataset.gset, el.type === "checkbox" ? el.checked : +el.value); applySettings(); toast("Gespeichert ✓"); }));
  $("[data-export]",main).onclick=()=>{
    const blob=new Blob([store.exportBackup()],{type:"application/json"});const url=URL.createObjectURL(blob);
    const a=document.createElement("a");a.href=url;a.download=`MatheQuest-Spielstand-${store.today()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);
  };
  $("[data-import]",main).onchange=async(e)=>{
    const f=e.target.files?.[0];if(!f)return;
    if(f.size>2_000_000){toast("Datei zu groß. Import abgebrochen.");return;}
    if(!confirm("Die Sicherung ersetzt alle vorhandenen Profile auf diesem Gerät. Wirklich importieren?"))return;
    try{const count=store.importBackup(await f.text());toast(`${count} Profile wiederhergestellt.`);go("#/map");}catch(err){toast("Import abgebrochen: "+esc(err.message));}
  };
  let armed = false;
  $("[data-del]", main).onclick = (e) => {
    if (!armed) { armed = true; e.target.textContent = `Wirklich ${p.name} löschen? Nochmal tippen`; return; }
    store.deleteProfile(p.id); go("#/");
  };
}

// ---------------- Pausen-Empfehlung ----------------
let lastInput = Date.now(), sessionMin = 0, breakShown = false;
["pointerdown", "keydown"].forEach((ev) => addEventListener(ev, () => (lastInput = Date.now()), { passive: true }));
setInterval(() => {
  if (document.hidden || !store.current() || Date.now() - lastInput > 60000) return;
  store.addMinute(); sessionMin++;
  const lim = store.settings().breakMinutes;
  if (lim && sessionMin >= lim && !breakShown && !document.querySelector(".talk")) {
    breakShown = true;
    modal(`<div class="break-fips">${mascot({ hat: store.current().cosmetic, mood: "happy" })}</div><h2>Zeit für eine Pause?</h2><p>${esc(pick(BREAK_TEXT))}</p><p class="muted">Du hast heute ${store.day().minutes} Minuten geübt.</p><button class="btn big" data-close>Pause machen</button>`);
  }
}, 60000);
document.addEventListener("visibilitychange", () => { if (document.hidden) lastHidden = Date.now(); else if (Date.now() - lastHidden > 10 * 60000) { sessionMin = 0; breakShown = false; } });
let lastHidden = 0;

// ---------------- Service Worker ----------------
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("./sw.js", { updateViaCache: "none" }).catch(() => {});
}

route();
