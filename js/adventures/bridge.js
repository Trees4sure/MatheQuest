// Abenteuer 1: "Die kaputte Brücke am Dorfbach" (Bauernhof & Dorfbach, Klasse 1)
// Der Sturm hat Löcher in die Holzbrücke gerissen. Schreinermeister Brumm repariert sie –
// das Kind rechnet aus, welche Bretter genau passen. Lina und ihr Hund Fips sind dabei.
// Erkundbarer Bachrand, drei Lücken mit mehreren Lösungswegen, gestufte Hilfen,
// sichtbare Folgen in der Szene, Überraschung (Entenfamilie, Halstuch für Fips), Anschluss-Mission.

import { fips, lina, brumm, sticker, ducks } from "../art.js";
import { bridgeScene } from "../scenes.js";
import { painted } from "../sprites.js";
import { $, $$, talk, toast, wait, pick, modal } from "../ui.js";
import { sound, buzz, confetti, sparkle, reduced } from "../fx.js";
import { current, adv, reward, addShard, unlockCosmetic, findSecret, updateProfile, recordAnswer, checkBadges, save } from "../store.js";
import { update as competence, rec } from "../competence.js";
import { makeRounds, evaluate, decompositions, suggestPlank, MAX_PLANK } from "./bridge-logic.js";

const SKILL = "k1-decompose"; // Zahlzerlegung im Kompetenzmodell
const HOLES = [[1, 2], [5, 6], [9, 10]]; // welche Bretter der Szenen-Brücke zu welcher Lücke gehören

export async function run(main, { go, onBadges }) {
  const p = current(), state = adv("bridge");
  const SC = bridgeScene(), SPOTS = SC.spots, s = SC.scale; // Szenen-Variante (gemalt oder gezeichnet)
  const replay = state.done;
  main.innerHTML = `<section class="adv${SC.wide ? " adv-wide" : ""}">
    <header class="adv-top"><button class="ghost" data-back aria-label="Zurück">←</button>
      <h1 class="adv-title">🌉 Die kaputte Brücke am Dorfbach</h1>
      <div class="hud"><span title="Sticker">🌟 <b data-shards>${p.shards}</b></span><span title="Münzen">🪙 <b data-coins>${p.coins}</b></span></div></header>
    <div class="scene${SC.wide ? " scene-wide" : ""}" data-scene>${SC.svg()}</div>
    <div class="adv-panel" data-panel></div>
  </section>`;
  const svg = $("[data-scene] svg", main), panel = $("[data-panel]", main);
  $("[data-back]", main).onclick = () => go("#/region/w1");
  const hud = () => { $("[data-shards]", main).textContent = current().shards; $("[data-coins]", main).textContent = current().coins; };

  // ---------- Darsteller ----------
  const ground = $(".layer.ground", svg);
  // Figur als verschachteltes <svg> einbetten – Klasse und data-mood der Figur bleiben erhalten
  const nest = (art, x, y, w, h) => art.replace(/^<svg /, `<svg x="${x}" y="${y}" width="${w}" height="${h}" `);
  function place(g, x, y, ms) { g.style.transition = ms ? `transform ${ms}ms ease-in-out` : "none"; g.style.transform = `translate(${x}px, ${y}px)`; }
  const newActor = (id, body, x, y) => {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("class", "actor"); g.id = id; g.innerHTML = `<g class="flip">${body}</g>`;
    ground.appendChild(g); place(g, x, y, 0); return g;
  };
  const bs = SC.brummScale;
  // gemalte Szene + gemalte Figuren (SC.bodies) oder alte Code-Zeichnungen
  const usePaintedBodies = SC.bodies && painted();
  const brummBody = (mood) => usePaintedBodies ? SC.bodies.brumm(mood) : nest(brumm({ mood }), -75 * bs, -178 * bs, 150 * bs, 178 * bs);
  const partyBody = () => usePaintedBodies ? SC.bodies.party() : nest(lina(), -38 * s, -132 * s, 72 * s, 132 * s) + nest(fips({ hat: current().cosmetic }), 4 * s, -68 * s, 78 * s, 74 * s);
  const B = newActor("aBrumm", brummBody("grumpy"), ...SC.brumm);
  const P = newActor("aParty", partyBody(), ...SPOTS.start); // Lina + Fips laufen zusammen
  if (usePaintedBodies && SC.bodies.brummFacesLeft) $(".flip", B).setAttribute("transform", "scale(-1 1)"); // Brumm schaut zu Lina
  const setMood = (sel, mood) => { const s = $(`${sel} .char`, svg); if (s) s.setAttribute("data-mood", mood); };
  let px = SPOTS.start[0];
  async function walk(to) {
    const [x, y] = SPOTS[to] || to, ms = reduced() ? 0 : Math.min(1600, 300 + (Math.abs(x - px) / s) * 2.2);
    $(".flip", P).setAttribute("transform", x < px ? "scale(-1 1)" : "");
    P.classList.add("walking"); place(P, x, y, ms); px = x; await wait(ms); P.classList.remove("walking");
  }
  const hop = async (a) => { a.classList.add("hop"); await wait(600); a.classList.remove("hop"); };

  // Szene: Löcher in der Brücke
  const holePlanks = (i) => HOLES[i].map((k) => $(`.plank.p${k}`, svg));
  HOLES.forEach((_, i) => holePlanks(i).forEach((pl) => pl.classList.add("gone")));

  // ---------- Erkunden ----------
  let busy = false, puzzleStarted = false, shroomTaps = 0;
  $$("[data-hot]", svg).forEach((h) => {
    h.setAttribute("tabindex", "0"); h.setAttribute("role", "button");
    if (!h.getAttribute("aria-label")) h.setAttribute("aria-label", { sun: "Sonne", fish: "Fisch im Bach", stump: "Werkzeugkiste und Bretter", bush: "Busch", mushrooms: "Pilze" }[h.dataset.hot] || h.dataset.hot);
    h.classList.add("hot");
  });
  Object.assign(B.dataset, { hot: "brumm" }); B.classList.add("hot"); B.setAttribute("tabindex", "0"); B.setAttribute("role", "button"); B.setAttribute("aria-label", "Schreiner Brumm");
  const onHot = async (e) => {
    const h = e.target.closest("[data-hot]"); if (!h || busy) return;
    if (e.type === "keydown" && e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault(); busy = true; sound("tap");
    try { await hotspot(h.dataset.hot, h); } finally { busy = false; }
  };
  svg.addEventListener("click", onHot); svg.addEventListener("keydown", onHot);

  async function hotspot(id, el) {
    if (id === "sun") return talk(main, [["lina", pick(["Heute ist es richtig warm. Perfektes Wetter fürs Dorffest!", "Nach dem Sturm gestern ist der Himmel wieder ganz blau."])]]);
    if (id === "fish") { el.classList.add("jump"); sound("hop"); setTimeout(() => el.classList.remove("jump"), 1000); await walk("fish"); return talk(main, [["lina", pick(["Eine Forelle! Die springen nach Mücken.", "Hast du den Fisch gesehen? Fips will hinterher – nein, Fips, bleib hier!"])], ["fips", "Wuff!"]]); }
    if (id === "stump") { await walk("stump"); if (!puzzleStarted) return startPuzzle(); return talk(main, [["brumm", "Genug Bretter für ein ganzes Baumhaus. Aber für die Brücke müssen sie GENAU passen."]]); }
    if (id === "brumm") { await walk("brumm"); return talk(main, [["brumm", pick(puzzleStarted ? ["Na? Passt's schon? Ich hab Zeit.", "Zu kurz wackelt. Zu lang steht über. Genau richtig ist schön."] : ["Die Bretter liegen bei meiner Werkzeugkiste. Schnapp dir welche!"])]]); }
    if (id === "mushrooms") {
      $$(".shroom", el).forEach((s, i) => setTimeout(() => s.classList.add("boing"), i * 90)); setTimeout(() => $$(".shroom", el).forEach((s) => s.classList.remove("boing")), 700);
      shroomTaps++;
      if (shroomTaps === 3 && findSecret("bridge", "geldbeutel")) {
        await walk("mushrooms"); sound("secret"); sparkle(el, "✨", 10); reward(15, 15); hud();
        await talk(main, [["fips", "Wuff! Wuff! *schnüffel* *buddel*"], ["lina", "Fips hat etwas ausgebuddelt … ein Geldbeutel! Den hat bestimmt jemand beim Sturm verloren."],
          ["lina", "Wir geben ihn im Rathaus ab. Finderlohn: 15 Münzen für dich – und ein Knochen für Fips!"]]);
        onBadges(checkBadges()); return;
      }
      if (shroomTaps < 3) return talk(main, [["lina", shroomTaps === 1 ? "Was schnüffelt Fips denn da?" : "Fips schnüffelt ganz aufgeregt und scharrt mit der Pfote …"]]);
      return;
    }
    if (id === "bush") {
      await walk("bush"); el.classList.add("peek"); setTimeout(() => el.classList.remove("peek"), 2500);
      if (adv("bridge").secrets.includes("igel")) return talk(main, [["lina", "Der Igel schläft schon wieder. Pssst!"]]);
      await talk(main, [["lina", "Pssst! Unter dem Busch sitzt ein Igel. Auf seinem Rücken stecken 3 Beeren, 4 liegen noch neben ihm."], ["lina", "Wie viele Beeren sind das zusammen?"]]);
      return igelRiddle();
    }
  }

  function igelRiddle() {
    return new Promise((resolve) => {
      const m = modal(`<h2>🦔 Beeren beim Igel</h2><p class="big-q">3 + 4 = <span class="gap">?</span></p><div class="choices">${[6, 7, 8].map((n) => `<button class="btn choice" data-n="${n}">${n}</button>`).join("")}</div><button class="ghost" data-close>Später</button>`, { onClose: resolve });
      let tries = 0;
      m.el.addEventListener("click", async (e) => {
        const b = e.target.closest("[data-n]"); if (!b) return;
        tries++;
        if (+b.dataset.n === 7) {
          sound("right"); m.close(); findSecret("bridge", "igel"); reward(10, 10); hud();
          await talk(main, [["lina", tries === 1 ? "Sieben! Genau. Igel fressen übrigens am liebsten Käfer und Schnecken." : "Sieben! Gut, dass du drangeblieben bist."]]);
          onBadges(checkBadges()); resolve();
        } else { sound("wrong"); b.disabled = true; b.classList.add("no"); toast("🦔 Zähl von 3 aus vier weiter: 4, 5, 6, …"); }
      });
    });
  }

  // ---------- Einleitung ----------
  busy = true;
  await walk("idle");
  if (!replay) {
    await talk(main, [
      ["lina", "Hallo {name}! Ich bin Lina, und das ist mein Hund Fips. Schön, dass du da bist!"],
      ["fips", "Wuff!"],
      ["lina", "Oh nein, schau mal: Der Sturm heute Nacht hat die Brücke über den Dorfbach kaputt gemacht. Drei Löcher!"],
      ["brumm", "Moin. Brumm mein Name, Schreinermeister. Ich repariere die Brücke – aber beim Rechnen brauch ich Hilfe. Meine Brille ist beim Sturm weggeflogen."],
      ["brumm", "Die Löcher müssen GENAU gefüllt werden. Zu lang steht über, da stolpert jeder. Zu kurz wackelt."],
      ["lina", "{name}, schau dich ruhig um – tipp auf alles, was dich neugierig macht. Die Bretter liegen bei der Werkzeugkiste!"],
    ]);
  } else {
    await talk(main, [["brumm", "Ihr schon wieder! Der Traktor von Bauer Jensen ist drübergerumpelt – drei neue Löcher. Helft ihr mir?"]]);
  }
  busy = false;
  panel.innerHTML = `<div class="cta-row"><button class="btn big pulse" data-start>🔨 Brücke reparieren</button><p class="muted">oder schau dich um – tipp auf alles, was dich neugierig macht.</p></div>`;
  $("[data-start]", panel).onclick = async () => { if (busy) return; busy = true; await walk("stump"); busy = false; startPuzzle(); };

  // ---------- Das Rätsel ----------
  const rounds = makeRounds(rec(p, SKILL).level);
  let ri = 0, prevSolution = null;
  const solutions = [];

  async function startPuzzle() {
    if (puzzleStarted) return; puzzleStarted = true;
    busy = true;
    await talk(main, [["brumm", "Meine Bretter sind genormt: Das 3er-Brett ist genau drei Kästchen lang, das 5er-Brett fünf."]]);
    busy = false;
    playRound();
  }

  async function playRound() {
    const r = rounds[ri];
    const intro = {
      fill: () => [["brumm", `Erstes Loch: ${r.gap} Kästchen lang. Füll es mit Brettern – aber GENAU passend!`], ["lina", "Tipp ein Brett an oder zieh es auf die Lücke. Gelegte Bretter tippst du an, um sie zurückzunehmen."]],
      other: () => [["brumm", "Zweites Loch – genauso lang wie das erste. Jetzt will ich sehen, ob du's auch ANDERS kannst. Ein guter Schreiner kennt viele Wege!"], ["lina", `Also wieder ${r.gap} – aber mit anderen Brettern als eben (${prevSolution.join(" + ")}).`]],
      two: () => [["brumm", `Letztes Loch: ${r.gap} Kästchen. Ich hab nur noch Nägel für ZWEI Bretter!`], ["lina", `Zwei Bretter, die zusammen ${r.gap} ergeben … hmm!`]],
    }[r.kind]();
    busy = true; await talk(main, intro); busy = false;
    buildPuzzle(r);
  }

  function buildPuzzle(r) {
    let placed = [], attempts = 0, hintLevel = 0, locked = false;
    const t0 = Date.now();
    const taskText = { fill: "Fülle die Lücke genau.", other: "Fülle sie anders als vorhin.", two: "Nimm genau zwei Bretter." }[r.kind];
    panel.innerHTML = `<div class="bp">
      <div class="bp-head"><span class="chip">Loch ${ri + 1} von 3</span><b>${taskText}</b></div>
      <div class="bp-eq" aria-live="polite" data-eq></div>
      <div class="track" data-track aria-label="Brücke mit Lücke">
        <div class="anchor"></div><div class="gapzone" data-gap style="--n:${r.gap}"><div class="cells">${Array.from({ length: r.gap }, (_, i) => `<span class="cell" data-cell="${i}"><i>${i + 1}</i></span>`).join("")}</div><div class="placed" data-placed></div></div><div class="anchor right"></div>
      </div>
      <div class="tray" data-tray aria-label="Bretter zum Legen">${Array.from({ length: MAX_PLANK }, (_, i) => i + 1).map((n) => `<button class="plank-btn" data-len="${n}" aria-label="${n}er-Brett legen"><span class="wood" style="--len:${n}">${"<i></i>".repeat(n)}<b>${n}</b></span></button>`).join("")}</div>
      <div class="bp-actions"><button class="btn ghost" data-hint>💡 Hilfe</button><button class="btn ghost" data-undo>↩ Zurück</button></div>
    </div>`;
    const track = $("[data-track]", panel), placedEl = $("[data-placed]", panel), eq = $("[data-eq]", panel);
    const sizeUnits = () => { const w = panel.clientWidth - 24; panel.style.setProperty("--u", Math.max(26, Math.min(60, Math.floor((w - 56) / (r.gap + 2.2)))) + "px"); };
    sizeUnits(); const ro = new ResizeObserver(sizeUnits); ro.observe(panel);

    function render(fresh = false) {
      const s = placed.reduce((a, b) => a + b, 0);
      let acc = 0;
      placedEl.innerHTML = placed.map((n, i) => { const over = acc + n > r.gap; acc += n; return `<button class="placed-plank${over ? " over" : ""}${fresh && i === placed.length - 1 ? " fresh" : ""}" data-i="${i}" style="--len:${n}" aria-label="${n}er-Brett zurücknehmen"><span class="wood" style="--len:${n}">${"<i></i>".repeat(n)}<b>${n}</b></span></button>`; }).join("");
      const parts = placed.join(" + ");
      eq.innerHTML = s < r.gap ? `${r.gap} = ${parts ? parts + " + " : ""}<span class="gap">?</span>` : `${r.gap} ${s === r.gap ? "=" : "≠"} ${parts}`;
      track.setAttribute("aria-label", `Lücke ${r.gap} Kästchen, belegt ${Math.min(s, r.gap)}`);
      $$(".cell", panel).forEach((c, i) => c.classList.toggle("filled", i < s));
    }
    render();

    async function put(n) {
      if (locked) return;
      placed.push(n); sound("place"); buzz(15); render(true);
      const res = evaluate(r, placed, prevSolution);
      if (res.status === "partial") return;
      locked = true; attempts++;
      if (res.status === "done") return solved();
      const errType = { over: "zuviel", same: "gleich", swapped: "tausch", notTwo: "anzahl" }[res.status];
      competence(current(), SKILL, { correct: false, attempts, errType, ms: Date.now() - t0 }); save();
      sound("wrong");
      if (res.status === "over") {
        track.classList.add("shake"); await wait(700);
        $(".placed-plank:last-child", placedEl)?.classList.add("fall"); sound("creak");
        await wait(600); placed.pop(); render();
        toast(pick(["🌊 Platsch! Zu lang – das Brett ist in den Bach gefallen.", "🌊 Das steht ja über – da stolpert jeder! Platsch.", "🌊 Zu lang! Die Enten freuen sich über das Floß."]));
        if (attempts >= 2 && hintLevel === 0) await talk(main, [["lina", "Wollen wir zuerst zählen, wie viele Kästchen noch frei sind? Tipp auf 💡, dann zählen wir zusammen."]]);
      } else {
        const msg = res.status === "same" ? "Genau so hast du's eben auch gemacht. Ich will einen ANDEREN Weg sehen!"
          : res.status === "swapped" ? `Moment … das sind ja dieselben Bretter, nur vertauscht! ${prevSolution.join(" + ")} und ${placed.join(" + ")} – das ist eine Tauschaufgabe. Schlau! Aber ich will ANDERE Bretter sehen.`
          : `Passt – aber das sind ${res.count} Bretter! Ich hab nur Nägel für ZWEI. Welche zwei Bretter ergeben zusammen ${r.gap}?`;
        await talk(main, [["brumm", msg]]);
        placed = []; render();
      }
      track.classList.remove("shake"); locked = false;
    }

    async function solved() {
      ro.disconnect();
      const hint = hintLevel > 0, first = attempts === 1;
      const change = competence(current(), SKILL, { correct: true, attempts, hint, ms: Date.now() - t0 });
      recordAnswer({ correct: true, attempts, hint, combo: 0 });
      prevSolution = [...placed]; solutions.push([...placed]);
      sound("win"); buzz(40); sparkle(track, "✨", 8);
      $$(".placed-plank", placedEl).forEach((b) => b.classList.add("glow"));
      holePlanks(ri).forEach((pl, k) => setTimeout(() => { pl.classList.remove("gone"); pl.classList.add("pop"); }, 200 + k * 220));
      setTimeout(() => sound("creak"), 400);
      const lvl = reward(first && !hint ? 25 : 20, 10); hud();
      setMood("#aBrumm", "happy"); hop(P);
      const praise = !first ? "Nicht aufgegeben – und jetzt hält's bombenfest!" : hint ? "Mit der Hilfe hast du's geknackt. Genau dafür ist sie da!" : pick(["Passt genau! Kein Wackeln, nichts steht über.", "Hält! Ich bin extra draufgehüpft.", "Saubere Arbeit. Wie vom Profi."]);
      await wait(900);
      busy = true; await talk(main, [["brumm-happy", praise]]); busy = false;
      if (lvl) toast(`⬆️ Level ${lvl}!`);
      if (change > 0) toast("🌱 Du wirst sicherer – die Löcher werden beim nächsten Mal etwas größer.");
      setMood("#aBrumm", "grumpy");
      ri++;
      if (ri < rounds.length) playRound(); else finale();
    }

    // Hilfen: 1) Kästchen zählen  2) freie Kästchen leuchten  3) passendes Brett zeigen
    $("[data-hint]", panel).onclick = async () => {
      if (locked) return;
      hintLevel = Math.min(3, hintLevel + 1); sound("tap");
      const s = placed.reduce((a, b) => a + b, 0);
      busy = true;
      if (hintLevel === 1) { panel.classList.add("counting"); await talk(main, [["lina", `Lass uns zählen! Das Loch ist ${r.gap} Kästchen lang – schau, die Zahlen stehen drin.`]]); }
      else if (hintLevel === 2) { panel.classList.add("counting", "show-free"); await talk(main, [["lina", s ? `Belegt sind schon ${s} Kästchen. Zähl mal die leuchtenden – so viele sind noch frei.` : "Noch ist alles frei. Ein Brett muss nicht das ganze Loch füllen – mehrere kurze gehen auch!"]]); }
      else {
        const sug = suggestPlank(r, placed, prevSolution);
        $$(".plank-btn", panel).forEach((b) => b.classList.toggle("suggest", +b.dataset.len === sug));
        await talk(main, [["lina", r.kind === "two" ? `Probier mal das ${sug}er-Brett. Wie viel fehlt dann noch bis ${r.gap}?` : `Das ${sug}er-Brett leuchtet – damit kommst du weiter.`]]);
      }
      busy = false;
    };
    $("[data-undo]", panel).onclick = () => { if (locked || !placed.length) return; placed.pop(); sound("tap"); render(); };
    placedEl.addEventListener("click", (e) => { const b = e.target.closest("[data-i]"); if (!b || locked) return; placed.splice(+b.dataset.i, 1); sound("tap"); render(); });

    // Antippen oder Ziehen
    let drag = null, skipClick = false;
    $("[data-tray]", panel).addEventListener("click", (e) => { const b = e.target.closest("[data-len]"); if (!b) return; if (skipClick) { skipClick = false; return; } put(+b.dataset.len); });
    $("[data-tray]", panel).addEventListener("pointerdown", (e) => { const b = e.target.closest("[data-len]"); if (b && !locked) drag = { b, len: +b.dataset.len, x: e.clientX, y: e.clientY, ghost: null }; });
    const overTrack = (e) => document.elementFromPoint(e.clientX, e.clientY)?.closest("[data-track]");
    const onMove = (e) => {
      if (!drag) return;
      if (!drag.ghost && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 10) {
        drag.ghost = drag.b.querySelector(".wood").cloneNode(true); drag.ghost.classList.add("drag-ghost");
        drag.ghost.style.setProperty("--u", getComputedStyle(panel).getPropertyValue("--u")); document.body.appendChild(drag.ghost);
      }
      if (drag.ghost) { e.preventDefault(); drag.ghost.style.left = e.clientX + "px"; drag.ghost.style.top = e.clientY + "px"; track.classList.toggle("drop", !!overTrack(e)); }
    };
    const onUp = (e) => {
      if (!drag) return;
      if (drag.ghost) { skipClick = true; setTimeout(() => (skipClick = false), 50); drag.ghost.remove(); track.classList.remove("drop"); if (overTrack(e)) put(drag.len); }
      drag = null;
    };
    addEventListener("pointermove", onMove, { passive: false }); addEventListener("pointerup", onUp); addEventListener("pointercancel", onUp);
    main.addEventListener("cleanup", () => { removeEventListener("pointermove", onMove); removeEventListener("pointerup", onUp); removeEventListener("pointercancel", onUp); ro.disconnect(); }, { once: true });
  }

  // ---------- Finale: Brücke frei, Entenfamilie, Halstuch, neue Mission ----------
  async function finale() {
    panel.innerHTML = "";
    busy = true;
    $(".barrier", svg).classList.add("lift"); $(".sign", svg).classList.add("gone-sign");
    sound("win"); confetti(90);
    setMood("#aBrumm", "happy"); place(B, ...SC.brummAside, reduced() ? 0 : 900);
    const last = rounds[2].gap, mine = [...solutions[2]].sort((a, b) => b - a).join();
    const other = decompositions(last).filter((d) => d.length === 2 && d.join() !== mine);
    await talk(main, [
      ["brumm-happy", "Klasse! Kein Loch, kein Wackeln. Und jedes Loch anders gefüllt!"],
      ["lina", other.length ? `Weißt du was, {name}? Fürs letzte Loch hätte es noch mehr Wege gegeben: ${other.map((d) => d.join(" + ")).join(", ")}. In Mathe gibt es oft viele Wege!` : "In Mathe gibt es oft viele Wege – und du hast gleich drei gefunden!"],
    ]);
    // Überraschung: eine Entenfamilie watschelt als Erste über die neue Brücke
    const D = document.createElementNS("http://www.w3.org/2000/svg", "g");
    D.setAttribute("class", "actor ducks"); D.innerHTML = `<g transform="scale(${SC.ducks.scale})">${ducks()}</g>`; ground.appendChild(D);
    place(D, ...SC.ducks.from, 0); await wait(50);
    sound("hop"); place(D, ...SC.ducks.to, reduced() ? 0 : 3200);
    await talk(main, [["brumm-happy", "Guck mal! Die Entenfamilie. Die wollte schon den ganzen Morgen rüber."], ["fips", "Wuff! Wuff!"], ["lina", "Nein, Fips! Die Entenküken lässt du in Ruhe."]]);
    // Lina und Fips gehen hinüber
    for (const pt of SC.cross) await walk(pt);
    hop(P);
    const surprise = !current().owned.includes("scarf");
    if (surprise) {
      await talk(main, [["brumm-happy", "Hier, für deinen Helfer-Hund. Mein rotes Halstuch – das hab ich schon als Lehrling getragen."]]);
      unlockCosmetic("scarf"); updateProfile({ cosmetic: "scarf" });
      $(".flip", P).innerHTML = partyBody();
      sound("secret"); sparkle(P, "⭐", 8);
      await talk(main, [["fips", "Wuff! *wedel* *wedel*"], ["lina", "Das steht ihm super! Danke, Herr Brumm!"]]);
    }
    addShard(1); reward(40, 20); hud(); confetti(60); sound("secret");
    const firstTime = !state.done; state.done = true; save();
    onBadges(checkBadges());
    await talk(main, [["lina", firstTime ? "Dafür bekommst du einen Sticker für dein Sammelalbum! 🌟" : "Noch ein Sticker für dein Album! 🌟"],
      ["👩‍🌾", "Hallooo! Lina! Hoppel ist schon wieder aus seinem Stall ausgebüxt – mitten in meinen Gemüsegarten!"],
      ["lina", "Das ist Frau Hoppe vom Bauernhof. Komm, wir helfen ihr!"]]);
    busy = false;
    panel.innerHTML = `<div class="cta-row done"><div class="reward-row"><span>${sticker(36)}</span><b>+1 Sticker</b>${surprise ? "<span>🧣 Rotes Halstuch für Fips!</span>" : ""}</div>
      <button class="btn big pulse" data-next>🐇 Neue Mission: Hoppel im Gemüsegarten ▶</button>
      <button class="btn ghost" data-map>Zurück zum Bauernhof</button></div>`;
    $("[data-next]", panel).onclick = () => go("#/adv/hoppel");
    $("[data-map]", panel).onclick = () => go("#/region/w1");
  }
}
