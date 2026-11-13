// Übungs-Runden mit geprüften Generatoren: Training, Rechen-Wettstreit, Wiederholen, Fehler-Werkstatt.
// Jede Aufgabe fließt ins Kompetenzmodell (competence.js) ein; die Stufe passt sich während der Runde an.

import { GENERATORS, shuffle } from "./generators.js";
import { check, showAnswer } from "./answer.js";
import { TOPIC_BY_ID } from "./curriculum.js";
import { PRAISE, PRAISE_EFFORT, COMBO_PRAISE, COMFORT_RETRY, COMFORT_SOLUTION } from "./content.js";
import { current, reward, recordAnswer, finishRound, addMistake, fixMistake, bossBeaten, checkBadges, save } from "./store.js";
import { update as competence, rec, scheduleReview } from "./competence.js";
import { $, $$, esc, mathHtml, pick, toast, wait } from "./ui.js";
import { sound, buzz, confetti, sparkle, speak } from "./fx.js";
import { mascotHtml as mascot } from "./sprites.js";

const ROUND = 8;

// cfg: { mode: "train"|"duel"|"review"|"repair", topic?, world?, skills? }
export function start(main, cfg, { go, onBadges, back }) {
  const p = current();
  const S = { i: 0, tasks: 0, score: 0, combo: 0, maxCombo: 0, xp: 0, coins: 0, hints: 0, seconds: 0, fixed: 0, hearts: 3, hp: 0, seen: new Set(), per: {} };
  const total = cfg.mode === "repair" ? Math.min(ROUND, p.mistakes.length) : cfg.mode === "duel" ? 99 : ROUND;
  const repairList = cfg.mode === "repair" ? shuffle(p.mistakes).slice(0, total) : [];
  const world = cfg.world || cfg.topic?.world;
  if (cfg.mode === "duel") S.hp = S.maxHp = world.bossHp;

  const title = { train: `${cfg.topic?.emoji} ${cfg.topic?.name}`, duel: `🏆 Rechen-Wettstreit`, review: "🔁 Wiederholen", repair: "🔧 Fehler-Werkstatt" }[cfg.mode];
  main.innerHTML = `<section class="play" data-mode="${cfg.mode}">
    <header class="play-top"><button class="ghost" data-quit aria-label="Runde beenden">✕</button><div class="play-title">${esc(title)}</div>
      ${cfg.mode === "duel" ? `<div class="hearts" data-hearts aria-label="Herzen"></div>` : `<div class="dots" data-dots aria-label="Fortschritt">${Array.from({ length: total }, () => "<i></i>").join("")}</div>`}</header>
    ${cfg.mode === "duel" ? `<div class="duel"><div class="boss" data-boss><span class="boss-emo">${world.boss.emoji}</span><div class="boss-name">${esc(world.boss.name)}</div><div class="hpbar win" aria-label="Fortschritt bis zum Sieg"><div data-hp></div></div><div class="hp-label" data-hplabel></div></div></div>` : ""}
    <div class="mascot-row"><div class="mini-fips">${mascot({ hat: p.cosmetic })}</div><div class="bubble" data-bubble aria-live="polite"></div></div>
    <div class="card" data-card><div class="lvl" data-lvl></div><div class="svgwrap" data-svg></div><div class="q" data-q></div><div class="sub" data-sub></div><div class="answer" data-ans aria-live="polite"></div></div>
    <div class="feedback" data-fb aria-live="polite"></div>
    <div class="input" data-input></div>
  </section>`;
  const q = (s) => $(s, main);
  q("[data-quit]").onclick = () => { cleanup(); back(); };
  const bubble = (t) => { q("[data-bubble]").innerHTML = mathHtml(t); };
  const hearts = () => { const h = q("[data-hearts]"); if (h) h.innerHTML = "❤️".repeat(S.hearts) + "🤍".repeat(3 - S.hearts); };
  // Wettstreit: Balken füllt sich mit jedem Punkt; S.hp = Punkte, die noch bis zum Sieg fehlen
  const hpbar = () => { const h = q("[data-hp]"); if (!h) return; h.style.width = ((S.maxHp - S.hp) / S.maxHp) * 100 + "%"; q("[data-hplabel]").textContent = S.hp > 0 ? `Noch ${S.hp} Punkte bis zum Sieg` : "Geschafft!"; };
  hearts(); hpbar();
  bubble(cfg.mode === "duel" ? `${world.boss.emoji} „${world.boss.taunt}“` : cfg.mode === "repair" ? "Die Werkstatt ist offen! Diese Aufgaben haben dich früher geärgert – heute knacken wir sie." : cfg.mode === "review" ? "Kurz wiederholen, damit's im Kopf bleibt." : pick(["Los geht's!", "Fips sitzt schon brav neben dir. Bereit?", "Auf geht's!"]));

  let task = null, input = "", attempts = 0, hint = false, t0 = 0, locked = false;

  function nextTask() {
    if (S.i >= total || (cfg.mode === "duel" && (S.hp <= 0 || S.hearts <= 0))) return finish();
    attempts = 0; hint = false; input = ""; locked = false; t0 = Date.now();
    let topic, level;
    if (cfg.mode === "repair") { task = repairList[S.i]; topic = TOPIC_BY_ID[task.skill]; level = null; }
    else {
      topic = cfg.mode === "train" ? cfg.topic : cfg.mode === "review" ? TOPIC_BY_ID[cfg.skills[S.i % cfg.skills.length]] : pick(world.topics);
      level = cfg.mode === "duel" ? Math.max(2, rec(p, topic.id).level) : rec(p, topic.id).level;
      for (let k = 0; k < 20; k++) { task = GENERATORS[topic.gen](topic.levels[level - 1]); if (!S.seen.has(task.q)) break; }
      S.seen.add(task.q);
    }
    task.skill = topic?.id || task.skill;
    q("[data-lvl]").textContent = topic ? `${topic.emoji} ${topic.name}${level ? " · Stufe " + level : ""}` : "";
    q("[data-svg]").innerHTML = task.svg || "";
    q("[data-q]").innerHTML = mathHtml(task.q);
    q("[data-q]").classList.toggle("long", task.q.length > 40 || /[a-zäöüß]{4,}/i.test(task.q.replace(/\[[^\]]*\]/g, "")));
    q("[data-sub]").textContent = task.sub || "";
    q("[data-fb]").innerHTML = "";
    q("[data-card]").classList.remove("right", "wrong");
    speak(task.q + (task.sub ? ". " + task.sub : ""));
    renderInput(); showInput();
    $$("[data-dots] i", main).forEach((d, k) => d.classList.toggle("now", k === S.i));
  }

  function renderInput() {
    const box = q("[data-input]");
    if (task.type === "choice") {
      box.innerHTML = `<div class="choices">${task.choices.map((c) => `<button class="btn choice" data-c="${esc(c)}">${esc(c)}</button>`).join("")}</div><div class="row-actions"><button class="btn ghost" data-hint>💡 Tipp</button></div>`;
    } else {
      const extra = (task.keys || []).map((k) => `<button class="key extra" data-k="${k}">${k}</button>`).join("");
      box.innerHTML = `<div class="keypad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<button class="key" data-k="${n}">${n}</button>`).join("")}
        <button class="key util" data-k="del" aria-label="Löschen">⌫</button><button class="key" data-k="0">0</button><button class="key ok" data-k="ok" aria-label="Prüfen">✓</button></div>
        <div class="row-actions">${extra}<button class="btn ghost" data-hint>💡 Tipp</button></div>`;
    }
  }
  function showInput() { const a = q("[data-ans]"); a.textContent = task.type === "choice" ? "" : input || " "; a.classList.toggle("empty", !input); }

  function press(k) {
    if (locked) return;
    if (k === "ok") return submit(input);
    if (k === "del") input = input.slice(0, -1);
    else if (input.length < 12) {
      if (k === "R") input += " R ";
      else if (k === "−") { if (!input) input = "−"; }
      else input += k;
    }
    sound("tap"); showInput();
  }

  async function submit(val) {
    if (locked || !String(val).trim()) return;
    locked = true; attempts++;
    const ok = check(task, val), ms = Date.now() - t0;
    if (ok) return right(ms);
    sound("wrong"); buzz(60);
    q("[data-card]").classList.add("wrong"); setTimeout(() => q("[data-card]")?.classList.remove("wrong"), 500);
    if (attempts === 1) {
      hint = hint || !!task.hint;
      q("[data-fb]").innerHTML = `<div class="fb retry">${pick(COMFORT_RETRY)}${task.hint ? `<div class="hint">💡 ${mathHtml(task.hint)}</div>` : ""}</div>`;
      input = ""; showInput(); locked = false;
      $$(`[data-c]`, main).forEach((b) => { if (b.dataset.c === String(val)) b.disabled = true; });
      return;
    }
    // zweiter Fehlversuch: Lösung zeigen, merken, freundlich weiter
    competence(p, task.skill, { correct: false, attempts, hint, ms });
    recordAnswer({ correct: false, attempts, hint, combo: 0 });
    if (cfg.mode !== "repair") addMistake(task, task.skill);
    S.combo = 0; S.i++; S.tasks++; tally(task.skill, 0);
    if (cfg.mode === "duel") { S.hearts--; hearts(); q("[data-boss]").classList.add("laugh"); setTimeout(() => q("[data-boss]")?.classList.remove("laugh"), 800); }
    q("[data-ans]").innerHTML = `<s>${esc(val)}</s> → <b>${mathHtml(showAnswer(task))}</b>`;
    q("[data-fb]").innerHTML = `<div class="fb sol">${pick(COMFORT_SOLUTION)}${task.explain ? `<div class="explain">${mathHtml(task.explain)}</div>` : ""}</div>`;
    q("[data-input]").innerHTML = `<div class="row-actions"><button class="btn big" data-next>Weiter ▶</button></div>`;
    q("[data-next]").focus();
    dot("miss");
  }

  async function right(ms) {
    const change = competence(p, task.skill, { correct: true, attempts, hint, ms });
    S.combo = attempts === 1 ? S.combo + 1 : 0; S.maxCombo = Math.max(S.maxCombo, S.combo);
    recordAnswer({ correct: true, attempts, hint, combo: S.combo });
    const pts = attempts === 1 ? (hint ? 0.8 : 1) : 0.6;
    S.score += pts; S.i++; S.tasks++; tally(task.skill, pts);
    if (hint) S.hints++;
    const xp = attempts === 1 ? (hint ? 8 : 10) : 6; S.xp += xp; S.coins += attempts === 1 ? 5 : 3;
    if (cfg.mode === "repair") { fixMistake(task); S.fixed++; }
    sound("right"); buzz(20);
    q("[data-card]").classList.add("right"); sparkle(q("[data-card]"), "⭐", 4);
    q("[data-ans]").innerHTML = `<b>${mathHtml(task.type === "choice" ? String(task.answer) : showAnswer(task))}</b> ✓`;
    const msg = cfg.mode === "repair" ? pick(PRAISE_EFFORT.fixed) : attempts > 1 ? pick(PRAISE_EFFORT.secondTry) : hint ? pick(PRAISE_EFFORT.withHint) : COMBO_PRAISE[S.combo] || pick(PRAISE);
    bubble(msg);
    if (change > 0) toast("🌱 Du wirst sicherer – die nächsten Aufgaben werden etwas kniffliger.");
    if (change < 0) toast("🤝 Wir machen kurz einen Schritt zurück – das ist ganz normal.");
    if (cfg.mode === "duel") {
      const dmg = S.combo >= 3 ? 2 : 1; S.hp = Math.max(0, S.hp - dmg); hpbar();
      const b = q("[data-boss]"); b.classList.add("hit"); setTimeout(() => b?.classList.remove("hit"), 500);
      if (dmg > 1) toast("⭐ Doppelpunkt für deine Serie!");
    }
    dot("ok");
    await wait(1000);
    nextTask();
  }
  function dot(cls) { const d = $$("[data-dots] i", main)[S.i - 1]; if (d) d.classList.add(cls); }
  function tally(skill, pts) { (S.per[skill] ||= []).push(pts); }

  function finish() {
    cleanup();
    // Wiederholungstermine je Thema
    for (const [skill, arr] of Object.entries(S.per)) scheduleReview(p, skill, arr.reduce((a, b) => a + b, 0) / arr.length);
    let stars = 0, headline = "", text = "";
    if (cfg.mode === "duel") {
      const won = S.hp <= 0;
      if (won) { bossBeaten(world); S.xp += 80; S.coins += 30; headline = `🏆 Gewonnen gegen ${world.boss.name}!`; text = world.boss.defeat; }
      else { headline = `${world.boss.emoji} Diesmal hat ${world.boss.name} gewonnen`; text = "Aber nur knapp! Übe noch ein paar Themen und tritt nochmal an."; }
      stars = won ? 3 : 1;
    } else {
      const ratio = S.score / Math.max(1, S.tasks);
      stars = ratio >= 0.85 ? 3 : ratio >= 0.6 ? 2 : 1; // mitmachen zählt immer: mindestens 1 Stern
      if (cfg.mode === "train") { const extra = finishRound(cfg.topic.id, stars); if (extra) S.xp += 10 * extra; }
      headline = stars === 3 ? "Super Runde!" : stars === 2 ? "Gut gemacht!" : "Geschafft – dranbleiben lohnt sich!";
      text = [S.hints ? `${S.hints}× mit Tipp gelöst – klug, Hilfe zu nutzen.` : "", S.fixed ? `${S.fixed} alte Fehler repariert! 🔧` : "", S.maxCombo >= 3 ? `Längste Serie: ${S.maxCombo}` : ""].filter(Boolean).join(" ");
    }
    const lvl = reward(S.xp, S.coins); save();
    const fresh = checkBadges();
    sound(stars === 3 ? "win" : "right"); if (stars >= 2) confetti();
    main.innerHTML = `<section class="result">
      <div class="res-fips">${mascot({ hat: p.cosmetic, mood: "happy" })}</div>
      <h1>${esc(headline)}</h1>
      <div class="stars big-stars" aria-label="${stars} Sterne">${"⭐".repeat(stars)}${"☆".repeat(3 - stars)}</div>
      <p>${esc(text)}</p>
      <div class="gain"><span>+${S.xp} XP</span><span>+${S.coins} 🪙</span></div>
      ${lvl ? `<div class="levelup">⬆️ Level ${lvl}!</div>` : ""}
      <div class="row-actions">
        ${cfg.mode === "train" ? `<button class="btn big" data-again>Nochmal ▶</button>` : ""}
        ${cfg.mode === "duel" && S.hp > 0 ? `<button class="btn big" data-again>Nochmal antreten 🏆</button>` : ""}
        <button class="btn ghost" data-back>Zurück</button>
      </div></section>`;
    $("[data-again]", main)?.addEventListener("click", () => start(main, cfg, { go, onBadges, back }));
    $("[data-back]", main).onclick = back;
    onBadges(fresh);
  }

  // Eingaben: Tippen und Tastatur
  const onClick = (e) => {
    const k = e.target.closest("[data-k]"); if (k) return press(k.dataset.k);
    const c = e.target.closest("[data-c]"); if (c && !locked) return submit(c.dataset.c);
    if (e.target.closest("[data-next]")) return nextTask();
    if (e.target.closest("[data-hint]") && task) {
      hint = true; sound("tap");
      q("[data-fb]").innerHTML = `<div class="fb">💡 ${mathHtml(task.hint || "Lies die Aufgabe nochmal langsam. Was ist gesucht?")}</div>`;
    }
  };
  const onKey = (e) => {
    if (!task || document.querySelector(".modal-back,.talk")) return;
    if ($("[data-next]", main) && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); return nextTask(); }
    if (task.type === "choice") { const i = Number(e.key) - 1; const bs = $$("[data-c]", main); if (bs[i]) bs[i].click(); return; }
    if (/^[0-9]$/.test(e.key)) press(e.key);
    else if (e.key === "Backspace") press("del");
    else if (e.key === "Enter") press("ok");
    else if ((e.key === "," || e.key === ".") && task.keys?.includes(",")) press(",");
    else if (e.key === "/" && task.keys?.includes("/")) press("/");
    else if (e.key === "-" && task.keys?.includes("−")) press("−");
    else if (e.key.toLowerCase() === "r" && task.keys?.includes("R")) press("R");
  };
  main.addEventListener("click", onClick);
  addEventListener("keydown", onKey);
  function cleanup() { main.removeEventListener("click", onClick); removeEventListener("keydown", onKey); }
  main.addEventListener("cleanup", cleanup, { once: true });

  nextTask();
}
