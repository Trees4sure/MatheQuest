// Logik für "Hoppel im Gemüsegarten" (Zahlenstrahl). Ohne Grafik, damit testbar.
// Arten: "fwd" (vorwärts hüpfen), "back" (rückwärts), "how" (wie viele Sprünge bis zur Möhre?)
// Der sichtbare Ausschnitt hat immer 11 Steine [lo … lo+10] und enthält Start und Ziel.

const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = (a) => a[Math.floor(Math.random() * a.length)];

const LEVELS = {
  1: { kinds: ["fwd"], max: 10, k: [1, 4] },
  2: { kinds: ["fwd", "back"], max: 10, k: [1, 5] },
  3: { kinds: ["fwd", "back"], max: 20, k: [2, 7] },
  4: { kinds: ["fwd", "back"], max: 20, k: [3, 8], cross: true },
  5: { kinds: ["fwd", "back", "how"], max: 20, k: [3, 9], cross: true },
};

export function makeHop(level = 1) {
  const L = LEVELS[Math.min(5, Math.max(1, level))];
  for (let i = 0; i < 500; i++) {
    const kind = pick(L.kinds), k = R(...L.k);
    const s = kind === "back" ? R(k, L.max) : R(0, L.max - k);
    const t = kind === "back" ? s - k : s + k;
    if (L.cross && !((s < 10 && t > 10) || (s > 10 && t < 10))) continue;
    const lo = Math.max(0, Math.min(Math.min(s, t) - R(0, 10 - k), L.max - 10));
    if (Math.max(s, t) > lo + 10) continue;
    return { kind, start: s, k, target: t, lo, hi: lo + 10, answer: kind === "how" ? k : t };
  }
  return { kind: "fwd", start: 2, k: 3, target: 5, lo: 0, hi: 10, answer: 5 };
}

export const jumps = (n) => `${n} ${n === 1 ? "Sprung" : "Sprünge"}`;
export function question(h) {
  if (h.kind === "fwd") return `Hoppel sitzt auf Stein ${h.start}. Er macht ${jumps(h.k)} nach vorn. Auf welchen Stein legst du die Möhre?`;
  if (h.kind === "back") return `Hoppel sitzt auf Stein ${h.start}. Er macht ${jumps(h.k)} zurück. Auf welchen Stein legst du die Möhre?`;
  return `Hoppel sitzt auf Stein ${h.start}, die Möhre liegt auf Stein ${h.target}. Wie viele Sprünge braucht er?`;
}
export function equation(h) {
  if (h.kind === "fwd") return `${h.start} + ${h.k} = ${h.target}`;
  if (h.kind === "back") return `${h.start} − ${h.k} = ${h.target}`;
  return `${h.start} + ${h.k} = ${h.target}`;
}
// Wie viele Sprünge wären es bis zu einem (falschen) Stein?
export const hopsTo = (h, stone) => Math.abs(stone - h.start);
