// Abenteuer 2: "Hoppel im Gemüsegarten" (Bauernhof & Dorfbach) – Zahlenstrahl vorwärts und rückwärts.
// Bäuerin Hoppes Hase ist ausgebüxt. Ihre Gartentrittsteine sind nummeriert: Das Kind legt die Möhre
// genau dorthin, wo Hoppel landet. Falsche Antworten werden sichtbar: Hoppel hüpft zur Möhre,
// Lina zählt die Sprünge mit – so sieht das Kind selbst, was nicht stimmt. (Tiere sprechen nicht.)

import { meadow, fips, lina, hoppel, carrot } from "../art.js";
import { $, $$, talk, toast, wait, pick } from "../ui.js";
import { sound, buzz, confetti, sparkle, reduced } from "../fx.js";
import { current, adv, reward, unlockCosmetic, recordAnswer, checkBadges, save } from "../store.js";
import { update as competence, rec, scheduleReview } from "../competence.js";
import { makeHop, question, equation, hopsTo, jumps } from "./hoppel-logic.js";

const SKILL = "adv-zahlenstrahl";
const GOAL = 5;

export async function run(main, { go, onBadges }) {
  const p = current(), st = adv("hoppel");
  main.innerHTML = `<section class="adv">
    <header class="adv-top"><button class="ghost" data-back aria-label="Zurück zur Region">←</button>
      <h1 class="adv-title">🐇 Hoppel im Gemüsegarten</h1>
      <div class="hud"><span title="Möhren">🥕 <b data-got>0</b>/${GOAL}</span><span title="Münzen">🪙 <b data-coins>${p.coins}</b></span></div></header>
    <div class="scene meadow-scene" data-scene>${meadow()}
      <div class="stage-actors"><div class="st-lina">${lina()}</div><div class="st-fips">${fips({ hat: p.cosmetic })}</div><div class="st-hoppel">${hoppel()}</div>
      <div class="basket" aria-label="Korb"><div class="basket-carrots" data-basket></div><svg viewBox="0 0 120 70" aria-hidden="true"><path d="M8 18 L112 18 L100 66 L20 66 Z" fill="#c8915a" stroke="#3a2416" stroke-width="4" stroke-linejoin="round"/><path d="M14 34 L106 34 M18 50 L102 50" stroke="#8a5a33" stroke-width="3"/></svg></div></div>
    </div>
    <div class="adv-panel" data-panel></div>
  </section>`;
  const panel = $("[data-panel]", main), stageH = $(".st-hoppel", main);
  $("[data-back]", main).onclick = () => go("#/region/w1");
  let got = 0, results = [];

  await talk(main, [
    ["👩‍🌾", "Gut, dass ihr da seid! Hoppel hüpft schon den ganzen Morgen durch meinen Garten."],
    ["👩‍🌾", "Meine Trittsteine sind nummeriert. Hoppel macht immer ein paar Sprünge von Stein zu Stein und bleibt dann sitzen."],
    ["lina", "Dann legen wir die Möhre genau auf den Stein, wo er landet – und schwupps, haben wir ihn! Fips, du bleibst sitzen."],
    ["fips", "*winsel*"],
  ]);

  async function nextHop() {
    const h = makeHop(rec(current(), SKILL).level);
    let attempts = 0, hint = false, locked = false, t0 = Date.now();
    const stones = Array.from({ length: 11 }, (_, i) => h.lo + i);
    panel.innerHTML = `<div class="hp">
      <div class="bp-head"><span class="chip">Möhre ${got + 1} von ${GOAL}</span><b data-q></b></div>
      <div class="numline" data-line style="--n:11">
        <svg class="arcs" data-arcs viewBox="0 0 1100 80" preserveAspectRatio="none" aria-hidden="true"></svg>
        <div class="bunny" data-bunny>${hoppel()}</div>
        ${stones.map((n) => `<button class="stone${n === h.start ? " start" : ""}${h.kind === "how" && n === h.target ? " carrot-mark" : ""}" data-n="${n}" aria-label="Stein ${n}"><span>${n}</span></button>`).join("")}
      </div>
      ${h.kind === "how" ? `<div class="choices" data-how>${[...new Set([h.k - 1, h.k, h.k + 1, h.k + 2].filter((x) => x > 0))].slice(0, 3).sort((a, b) => a - b).map((n) => `<button class="btn choice" data-k="${n}">${jumps(n)}</button>`).join("")}</div>` : ""}
      <div class="bp-actions"><button class="btn ghost" data-hint>💡 Hilfe</button></div>
    </div>`;
    $("[data-q]", panel).textContent = question(h);
    const line = $("[data-line]", panel), bunny = $("[data-bunny]", panel), arcs = $("[data-arcs]", panel);
    const posOf = (n) => ((n - h.lo) + 0.5) / 11 * 100;
    const setBunny = (n, ms = 0) => { bunny.style.transition = ms ? `left ${ms}ms ease-in-out` : "none"; bunny.style.left = posOf(n) + "%"; };
    setBunny(h.start);
    const drawArcs = (from, to, cls = "") => {
      const dir = to > from ? 1 : -1, xs = (n) => ((n - h.lo) + 0.5) * 100;
      arcs.innerHTML = Array.from({ length: Math.abs(to - from) }, (_, i) => { const a = xs(from + dir * i), b = xs(from + dir * (i + 1)); return `<path class="arc ${cls}" d="M${a} 70 Q${(a + b) / 2} 0 ${b} 70" style="animation-delay:${i * 120}ms"/><text x="${(a + b) / 2}" y="22" class="arc-n">${i + 1}</text>`; }).join("");
    };

    let pos = h.start;
    async function hopTo(target, count = true) {
      const dir = target > pos ? 1 : -1, steps = Math.abs(target - pos), from = pos;
      bunny.classList.add("hopping");
      for (let i = 1; i <= steps; i++) {
        setBunny(from + dir * i, reduced() ? 0 : 260); sound("hop");
        if (count) { const b = document.createElement("span"); b.className = "hop-count"; b.textContent = i; b.style.left = posOf(from + dir * i) + "%"; line.appendChild(b); setTimeout(() => b.remove(), 1400); }
        await wait(reduced() ? 60 : 300);
      }
      pos = target;
      bunny.classList.remove("hopping");
    }

    async function answer(val, stoneBtn) {
      if (locked) return; locked = true; attempts++;
      const ok = val === h.answer;
      if (h.kind !== "how") await hopTo(val);
      else if (ok) await hopTo(h.target);
      if (ok) {
        const change = competence(current(), SKILL, { correct: true, attempts, hint, ms: Date.now() - t0 });
        recordAnswer({ correct: true, attempts, hint, combo: 0 });
        results.push(attempts === 1 && !hint ? 1 : 0.5);
        sound("right"); buzz(30);
        (stoneBtn || $(`[data-n="${h.target}"]`, panel))?.classList.add("found");
        const c = document.createElement("div"); c.className = "carrot-pop"; c.innerHTML = carrot(34); c.style.left = posOf(h.target) + "%"; line.appendChild(c);
        sparkle(c, "✨", 5);
        got++; $("[data-got]", main).textContent = got;
        $("[data-basket]", main).insertAdjacentHTML("beforeend", `<span class="in-basket">${carrot(26)}</span>`);
        stageH.classList.add("hop"); setTimeout(() => stageH.classList.remove("hop"), 700);
        const lvl = reward(attempts === 1 ? 15 : 12, 5); $("[data-coins]", main).textContent = current().coins;
        if (lvl) toast(`⬆️ Level ${lvl}!`);
        toast(`🥕 ${equation(h)}` + (attempts > 1 ? " – drangeblieben!" : hint ? " – mit Hilfe geschafft!" : ""));
        if (change > 0) toast("🌱 Hoppel hüpft jetzt etwas weiter.");
        await wait(1300);
        return got < GOAL ? nextHop() : finish();
      }
      // falsch: sichtbar machen, nicht bestrafen
      competence(current(), SKILL, { correct: false, attempts, ms: Date.now() - t0, errType: h.kind === "how" ? "anzahl" : val === h.target - (h.kind === "back" ? -1 : 1) ? "startstein-mitgezaehlt" : Math.abs(val - h.target) === 1 ? "ein-sprung-zu-viel" : val === h.start + (h.kind === "back" ? h.k : -h.k) ? "richtung" : "zaehlen" });
      recordAnswer({ correct: false, attempts, hint, combo: 0 });
      save(); sound("wrong");
      if (h.kind !== "how") {
        const n = hopsTo(h, val), wrongDir = (h.kind === "fwd" && val < h.start) || (h.kind === "back" && val > h.start);
        await talk(main, [["lina", wrongDir ? `Hoppel musste in die andere Richtung hüpfen, um zur Möhre zu kommen! ${h.kind === "fwd" ? "Nach vorn heißt: zu den größeren Zahlen." : "Zurück heißt: zu den kleineren Zahlen."}` : `Hoppel ist zur Möhre gehoppelt – das waren ${jumps(n)}. Er macht aber nur ${jumps(h.k)}!`],
          ["👩‍🌾", "Ich setz ihn nochmal zurück auf seinen Stein. Probier's nochmal!"]]);
        await hopTo(h.start, false); // Frau Hoppe setzt Hoppel zurück
        const dir = h.kind === "back" ? -1 : 1;
        if (!wrongDir && val === h.target - dir) toast("💡 Tipp: Den Startstein nicht mitzählen – erst der erste Sprung zählt als 1.");
        else if (!wrongDir && val === h.target + dir) toast("💡 Ein Sprung zu viel! Zähl ganz langsam mit – bei jedem Sprung eine Zahl.");
      } else {
        await talk(main, [["lina", "Hmm, zähl mal die Bögen von Hoppels Stein bis zur Möhre."]]); drawArcs(h.start, h.target, "ghost"); hint = true;
      }
      if (attempts >= 2 && !hint) { hint = true; drawArcs(h.start, h.target, "ghost"); toast("💡 Die Bögen zeigen Hoppels Sprünge – zähl mit!"); }
      locked = false;
    }

    line.addEventListener("click", (e) => { const b = e.target.closest("[data-n]"); if (!b || h.kind === "how") return; sound("tap"); answer(+b.dataset.n, b); });
    $("[data-how]", panel)?.addEventListener("click", (e) => { const b = e.target.closest("[data-k]"); if (b) answer(+b.dataset.k); });
    $("[data-hint]", panel).onclick = async () => {
      hint = true; sound("tap");
      if (h.kind === "how") { drawArcs(h.start, h.target, "ghost"); return toast("💡 Zähl die Bögen!"); }
      await talk(main, [["lina", `Leg deinen Finger auf die ${h.start}. Jetzt ${h.kind === "fwd" ? "nach rechts" : "nach links"} hüpfen und laut mitzählen: 1, 2, … bis ${h.k}.`], ["lina", `Als Rechnung: ${h.start} ${h.kind === "fwd" ? "+" : "−"} ${h.k} = ?`]]);
    };
  }

  async function finish() {
    const acc = results.reduce((a, b) => a + b, 0) / results.length;
    scheduleReview(current(), SKILL, acc);
    const firstTime = !st.done; st.done = true; save();
    confetti(100); sound("win");
    panel.innerHTML = "";
    await talk(main, [["👩‍🌾", "Hab ich dich! Hoppel sitzt wieder in seinem Stall und mampft. Danke euch beiden!"],
      ...(firstTime ? [["👩‍🌾", "Für Fips hab ich einen Kranz aus Gänseblümchen geflochten."], ["fips", "Wuff! *wedel*"], ["lina", "Mit Halstuch UND Blumenkranz – Fips ist der schickste Hund im Dorf!"]] : []),
      ["👩‍🌾", "Morgen früh sammle ich die Eier im Hühnerstall. Da könnte ich wieder Hilfe beim Zählen brauchen …"]]);
    if (firstTime) { unlockCosmetic("flower"); reward(40, 20); }
    onBadges(checkBadges());
    panel.innerHTML = `<div class="cta-row done"><div class="reward-row">${carrot(28)}<b>Hoppel ist wieder im Stall!</b>${firstTime ? "<span>🌼 Gänseblümchen-Kranz für Fips</span>" : ""}</div>
      <button class="btn big pulse" data-region>🐄 Zurück zum Bauernhof</button>
      <button class="btn ghost" data-again>Nochmal hüpfen</button></div>`;
    $("[data-region]", panel).onclick = () => go("#/region/w1");
    $("[data-again]", panel).onclick = () => run(main, { go, onBadges });
  }

  nextHop();
}
