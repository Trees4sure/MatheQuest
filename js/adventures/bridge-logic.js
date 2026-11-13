// Logik der Zahlenbrücke (ohne Grafik, damit sie automatisch getestet werden kann).
//
// Mathematik: Zahlzerlegung. Eine Lücke der Länge N wird mit Brettern der Länge 1–5 gefüllt.
// Es gibt immer mehrere Lösungswege (N = 2 + 3 = 1 + 4 = 1 + 1 + 3 …).
// Drei Lücken, drei Aufträge:
//   "fill"  – Lücke irgendwie füllen
//   "other" – gleich lange Lücke, aber mit ANDEREN Brettern (Schreiner Brumm: "Zeig mir einen anderen Weg!")
//             Gleiche Bretter in anderer Reihenfolge zählen nicht als anders → Gespräch über Tauschaufgaben
//   "two"   – Lücke mit genau zwei Brettern füllen

export const MAX_PLANK = 5;
const GAPS = { 1: [4, 5], 2: [5, 6], 3: [6, 7], 4: [7, 9], 5: [8, 10] };
const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

export function makeRounds(level = 1) {
  const [lo, hi] = GAPS[Math.min(5, Math.max(1, level))];
  const a = R(lo, hi);
  const c = Math.min(2 * MAX_PLANK, R(lo + 1, hi + 1));
  return [{ kind: "fill", gap: a }, { kind: "other", gap: a }, { kind: "two", gap: c }];
}

const sum = (xs) => xs.reduce((s, x) => s + x, 0);
const key = (xs) => [...xs].sort((x, y) => x - y).join("+");

// planks: gelegte Brettlängen in Reihenfolge; prev: Lösung der vorigen Lücke (für "other")
export function evaluate(round, planks, prev = null) {
  const s = sum(planks);
  if (s < round.gap) return { status: "partial", sum: s, missing: round.gap - s };
  if (s > round.gap) return { status: "over", sum: s, over: s - round.gap };
  if (round.kind === "other" && prev && key(prev) === key(planks)) {
    const sameOrder = prev.join("+") === planks.join("+");
    return { status: sameOrder ? "same" : "swapped", sum: s };
  }
  if (round.kind === "two" && planks.length !== 2) return { status: "notTwo", sum: s, count: planks.length };
  return { status: "done", sum: s };
}

// Alle Zerlegungen als Mengen (ohne Reihenfolge) – für Tests und Hilfen
export function decompositions(n, max = MAX_PLANK, min = 1) {
  if (n === 0) return [[]];
  const out = [];
  for (let p = Math.min(n, max); p >= min; p--) for (const rest of decompositions(n - p, p, min)) out.push([p, ...rest]);
  return out;
}

// Ein Brett vorschlagen, das sicher weiterführt (für die 3. Hilfestufe)
export function suggestPlank(round, planks, prev) {
  const missing = round.gap - sum(planks);
  if (missing <= 0) return null;
  if (round.kind === "two" && planks.length === 0) return Math.max(round.gap - MAX_PLANK, Math.ceil(round.gap / 2));
  if (round.kind === "other" && prev) {
    // ein Brett wählen, das zu einer anderen Lösung führt
    const sols = decompositions(round.gap).filter((d) => key(d) !== key(prev));
    const fit = sols.find((d) => { const rest = [...d]; return planks.every((p) => { const i = rest.indexOf(p); if (i < 0) return false; rest.splice(i, 1); return true; }); });
    if (fit) { const rest = [...fit]; planks.forEach((p) => rest.splice(rest.indexOf(p), 1)); return rest[0]; }
  }
  return Math.min(missing, MAX_PLANK);
}
