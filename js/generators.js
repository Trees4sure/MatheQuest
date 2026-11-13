// Aufgaben-Generatoren. Jeder Generator bekommt ein Parameter-Objekt (aus curriculum.js)
// und liefert eine Aufgabe:
//   { q, type: "number"|"choice"|"fraction"|"remainder", answer, keys?, choices?, hint?, explain?, exact?, svg? }
// Im Fragetext steht "□" für die Lücke, "[3/4]" wird als Bruch gezeichnet.

import { fmtNum as F, gcd, lcm, round6, evalExpr } from "./answer.js";
import { WORD_PROBLEMS } from "./content.js";

export const R = (a, b, step = 1) => a + step * Math.floor(Math.random() * (Math.floor((b - a) / step) + 1));
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const MINUS = "−";
const neg = (x) => (x < 0 ? `(${F(x)})` : F(x));

function tries(fn, n = 200) {
  for (let i = 0; i < n; i++) { const t = fn(); if (t) return t; }
  throw new Error("Generator fand keine Aufgabe");
}

// ---------------- Klasse 1–4: Grundrechnen ----------------

// Plus/Minus. p: {max, ops, cross:"any"|"yes"|"no", missing, bMax, step, min}
function addSub(p) {
  return tries(() => {
    const op = pick(p.ops || ["+"]);
    const step = p.step || 1, min = p.min ?? 0;
    let a, b, c;
    if (op === "+") {
      c = R(Math.max(min, step), p.max, step);
      b = R(step, Math.min(p.bMax ?? c, c), step);
      a = c - b;
      if (a < min) return null;
    } else {
      a = R(Math.max(min, step), p.max, step);
      b = R(step, Math.min(p.bMax ?? a, a), step);
      c = a - b;
    }
    if (b <= 0) return null;
    const crosses = op === "+" ? (a % 10) + (b % 10) >= 10 : (a % 10) < (b % 10);
    if (p.cross === "yes" && !crosses) return null;
    if (p.cross === "no" && crosses) return null;
    const sym = op === "+" ? "+" : MINUS;
    const hint = crosses && p.max <= 100 ? "Tipp: Rechne erst bis zum nächsten Zehner, dann weiter." : (p.max > 1000 ? "Tipp: Rechne schriftlich auf einem Zettel – Stelle unter Stelle!" : "");
    if (p.missing && Math.random() < 0.7) {
      if (Math.random() < 0.5) return { q: `${F(a)} ${sym} □ = ${F(c)}`, type: "number", answer: b, hint: op === "+" ? `Tipp: Wie viel fehlt von ${F(a)} bis ${F(c)}?` : `Tipp: ${F(a)} ${MINUS} ${F(c)} = ?`, explain: `${F(a)} ${sym} ${F(b)} = ${F(c)}` };
      return { q: `□ ${sym} ${F(b)} = ${F(c)}`, type: "number", answer: a, hint: op === "+" ? `Tipp: Rechne rückwärts: ${F(c)} ${MINUS} ${F(b)}` : `Tipp: Rechne rückwärts: ${F(c)} + ${F(b)}`, explain: `${F(a)} ${sym} ${F(b)} = ${F(c)}` };
    }
    return { q: `${F(a)} ${sym} ${F(b)} = □`, type: "number", answer: c, hint, explain: `${F(a)} ${sym} ${F(b)} = ${F(c)}` };
  });
}

// Vergleichen <, =, >. p: {max, expr}
function compare(p) {
  const side = () => {
    if (p.expr && Math.random() < 0.6) { const a = R(0, Math.floor(p.max / 2)), b = R(0, p.max - a); return { s: `${a} + ${b}`, v: a + b }; }
    const v = R(0, p.max); return { s: F(v), v };
  };
  const l = side(); let r = side();
  if (Math.random() < 0.2) r = { s: F(l.v), v: l.v };
  const ans = l.v < r.v ? "<" : l.v > r.v ? ">" : "=";
  return { q: `${l.s}  ○  ${r.s}`, type: "choice", choices: ["<", "=", ">"], answer: ans, hint: "Tipp: Das Krokodil-Maul ‹ › frisst immer die größere Zahl!", explain: `${l.s} ${ans} ${r.s}` };
}

// Nachbarzahlen. p: {max}
function neighbors(p) {
  const n = R(1, p.max - 1), kind = pick(["vor", "nach", "zwischen"]);
  if (kind === "vor") return { q: `Welche Zahl kommt direkt vor ${F(n)}?`, type: "number", answer: n - 1, hint: "Tipp: Einen Schritt zurück.", explain: `${F(n - 1)} kommt vor ${F(n)}.` };
  if (kind === "nach") return { q: `Welche Zahl kommt direkt nach ${F(n)}?`, type: "number", answer: n + 1, hint: "Tipp: Einen Schritt vor.", explain: `${F(n + 1)} kommt nach ${F(n)}.` };
  return { q: `Welche Zahl liegt zwischen ${F(n - 1)} und ${F(n + 1)}?`, type: "number", answer: n, explain: `${F(n - 1)}, ${F(n)}, ${F(n + 1)}` };
}

// Verdoppeln/Halbieren. p: {max}
function doubleHalf(p) {
  const n = R(1, p.max);
  if (Math.random() < 0.5) return { q: `Verdopple ${F(n)}`, type: "number", answer: 2 * n, hint: `Tipp: ${F(n)} + ${F(n)}`, explain: `${F(n)} + ${F(n)} = ${F(2 * n)}` };
  return { q: `Halbiere ${F(2 * n)}`, type: "number", answer: n, hint: "Tipp: Welche Zahl + sich selbst ergibt das?", explain: `${F(n)} + ${F(n)} = ${F(2 * n)}` };
}

// Zahlenfolgen. p: {max, steps, mult}
function sequence(p) {
  return tries(() => {
    const len = 5;
    let start, seq = [], rule;
    if (p.mult && Math.random() < 0.4) {
      const f = pick(p.mult); start = R(1, 5); seq = [start]; for (let i = 1; i < len; i++) seq.push(seq[i - 1] * f); rule = `immer · ${f}`;
    } else {
      const s = pick(p.steps); const down = Math.random() < 0.35;
      start = down ? R(s * (len - 1), p.max) : R(0, p.max - s * (len - 1));
      seq = Array.from({ length: len }, (_, i) => start + (down ? -1 : 1) * s * i); rule = `immer ${down ? MINUS : "+"} ${s}`;
    }
    if (seq.some((x) => x < 0 || x > p.max)) return null;
    const gap = Math.random() < 0.7 ? len - 1 : R(1, len - 2);
    return { q: seq.map((x, i) => (i === gap ? "□" : F(x))).join(", "), type: "number", answer: seq[gap], hint: "Tipp: Was passiert von einer Zahl zur nächsten?", explain: `Regel: ${rule}` };
  });
}

// Einmaleins. p: {rows, maxF, mode:"mul"|"div"|"mix", missing}
function times(p) {
  const r = pick(p.rows), f = R(p.minF ?? 1, p.maxF ?? 10), prod = r * f;
  const mode = p.mode === "mix" ? pick(["mul", "div"]) : (p.mode || "mul");
  const [a, b] = Math.random() < 0.5 ? [r, f] : [f, r];
  if (mode === "div") return { q: `${F(prod)} : ${F(r)} = □`, type: "number", answer: f, hint: `Tipp: Wie oft passt ${r} in ${F(prod)}? Denk an ${r}er-Reihe.`, explain: `${F(f)} · ${F(r)} = ${F(prod)}` };
  if (p.missing && Math.random() < 0.6) return { q: `${a} · □ = ${F(prod)}`, type: "number", answer: b, hint: `Tipp: ${F(prod)} : ${a}`, explain: `${a} · ${b} = ${F(prod)}` };
  return { q: `${a} · ${b} = □`, type: "number", answer: prod, hint: f > 5 ? `Tipp: ${r} · 5 = ${r * 5}, dann weiter.` : `Tipp: ${Array(b).fill(a).join(" + ")}`, explain: `${a} · ${b} = ${F(prod)}` };
}

// Teilen mit Rest. p: {rows, maxQ}
function divRest(p) {
  const d = pick(p.rows), q = R(1, p.maxQ ?? 10), r = R(0, d - 1), a = d * q + r;
  return { q: `${F(a)} : ${d} = □  (mit Rest)`, type: "remainder", keys: ["R"], answer: `${q} R ${r}`, hint: `Tipp: Welche Zahl aus der ${d}er-Reihe ist knapp unter ${a}? Schreib z. B. 4 R 2.`, explain: `${q} · ${d} = ${q * d}, Rest ${r}` };
}

// Stellenwerte. p: {digits, modes}
const PLACES = ["E", "Z", "H", "T", "ZT", "HT", "M"];
const PLACE_NAMES = ["Einer", "Zehner", "Hunderter", "Tausender", "Zehntausender", "Hunderttausender", "Millionen"];
function placeValue(p) {
  const n = R(10 ** (p.digits - 1), 10 ** p.digits - 1), ds = String(n).split("").reverse().map(Number);
  const mode = pick(p.modes || ["compose", "digit"]);
  if (mode === "compose") {
    const parts = ds.map((d, i) => `${d} ${PLACES[i]}`).reverse().join(" + ");
    return { q: parts + " = □", type: "number", answer: n, hint: "Tipp: E = Einer, Z = Zehner, H = Hunderter, T = Tausender", explain: `= ${F(n)}` };
  }
  if (mode === "count") {
    const i = R(1, Math.min(2, p.digits - 1));
    return { q: `Wie viele ${PLACE_NAMES[i]} hat ${F(n)} insgesamt?`, type: "number", answer: Math.floor(n / 10 ** i), hint: `Tipp: Streiche hinten ${i} Stelle${i > 1 ? "n" : ""} weg.`, explain: `${F(n)} hat ${F(Math.floor(n / 10 ** i))} ${PLACE_NAMES[i]}.` };
  }
  const i = R(0, p.digits - 1);
  return { q: `Welche Ziffer steht bei den ${PLACE_NAMES[i]} in ${F(n)}?`, type: "number", answer: ds[i], hint: "Tipp: Zähle von rechts: Einer, Zehner, Hunderter …", explain: `${PLACE_NAMES[i]}: ${ds[i]}` };
}

// Runden. p: {digits, to}
function roundTask(p) {
  const to = pick(p.to), n = R(10 ** (p.digits - 1), 10 ** p.digits - 1);
  const ans = Math.round(n / to) * to, name = { 10: "Zehner", 100: "Hunderter", 1000: "Tausender", 10000: "Zehntausender", 100000: "Hunderttausender" }[to];
  return { q: `Runde ${F(n)} auf ${name}.`, type: "number", answer: ans, hint: "Tipp: Schau auf die Ziffer rechts daneben: 0–4 abrunden, 5–9 aufrunden.", explain: `${F(n)} ≈ ${F(ans)}` };
}

// Malnehmen mit großen Zahlen. p: {aMin, aMax, bMin, bMax, step}
function mulBig(p) {
  const a = R(p.aMin, p.aMax, p.step || 1), b = R(p.bMin, p.bMax);
  return { q: `${F(a)} · ${F(b)} = □`, type: "number", answer: a * b, hint: a >= 10 ? `Tipp: Zerlege ${F(a)} in Zehner und Einer.` : "", explain: `${F(a)} · ${F(b)} = ${F(a * b)}` };
}

// Teilen großer Zahlen (ohne Rest). p: {dMin, dMax, qMin, qMax}
function divBig(p) {
  const d = R(p.dMin, p.dMax), q = R(p.qMin, p.qMax), a = d * q;
  return { q: `${F(a)} : ${F(d)} = □`, type: "number", answer: q, hint: "Tipp: Teile Stelle für Stelle – oder rechne rückwärts mit Mal.", explain: `${F(q)} · ${F(d)} = ${F(a)}` };
}

// Größen umrechnen. p: {kinds, mixed, decimal}
const UNITS = {
  money: [["€", "ct", 100]],
  time: [["h", "min", 60], ["min", "s", 60], ["Tage", "h", 24]],
  length: [["m", "cm", 100], ["km", "m", 1000], ["cm", "mm", 10]],
  mass: [["kg", "g", 1000], ["t", "kg", 1000]],
};
function units(p) {
  const kind = pick(p.kinds), [big, small, f] = pick(UNITS[kind]);
  const mode = pick(p.modes || ["down"]);
  if (mode === "mixed") { const a = R(1, 9), b = R(1, f - 1); return { q: `${a} ${big} ${b} ${small} = □ ${small}`, type: "number", answer: a * f + b, hint: `Tipp: 1 ${big} = ${f} ${small}`, explain: `${a} · ${f} + ${b} = ${a * f + b}` }; }
  if (mode === "decimal" && f !== 60 && f !== 24) {
    const v = R(11, 99) / 10;
    return { q: `${F(v)} ${big} = □ ${small}`, type: "number", answer: round6(v * f), hint: `Tipp: 1 ${big} = ${f} ${small}`, explain: `${F(v)} · ${f} = ${F(v * f)}` };
  }
  if (mode === "up") { const a = R(1, 9); return { q: `${F(a * f)} ${small} = □ ${big}`, type: "number", answer: a, hint: `Tipp: ${f} ${small} = 1 ${big}`, explain: `${F(a * f)} : ${f} = ${a}` }; }
  const a = R(1, 9); return { q: `${a} ${big} = □ ${small}`, type: "number", answer: a * f, hint: `Tipp: 1 ${big} = ${f} ${small}`, explain: `${a} · ${f} = ${F(a * f)}` };
}

// ---------------- Klasse 5–6 ----------------

// Punkt vor Strich & Klammern. p: {forms, max}
const ORDER_FORMS = ["a + b · c", "a · b + c", "a · b − c", "a − b · c", "(a + b) · c", "a · (b − c)", "a + b : c", "(a − b) : c", "a · b + c · d", "a · (b + c) − d"];
function orderOps(p) {
  return tries(() => {
    const form = pick(p.forms ? p.forms.map((i) => ORDER_FORMS[i]) : ORDER_FORMS);
    const v = { a: R(2, p.max), b: R(2, p.max), c: R(2, 10), d: R(2, 10) };
    if (form === "a + b : c") v.b = v.c * R(2, 10);
    if (form === "(a − b) : c") { v.b = R(1, 20); v.a = v.b + v.c * R(1, 10); }
    const val = evalExpr(form.replace(/−/g, "-"), v);
    if (val < 0 || !Number.isInteger(val)) return null;
    const q = form.replace(/[abcd]/g, (k) => v[k]);
    return { q: q + " = □", type: "number", answer: val, hint: form.includes("(") ? "Tipp: Klammern zuerst!" : "Tipp: Punkt (· :) vor Strich (+ −)!", explain: `${q} = ${val}` };
  });
}

// Potenzen. p: {kinds}
function powers(p) {
  const kind = pick(p.kinds), sup = { 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶" };
  if (kind === "sq") { const n = R(2, p.sqMax || 15); return { q: `${n}² = □`, type: "number", answer: n * n, hint: `Tipp: ${n}² = ${n} · ${n}`, explain: `${n} · ${n} = ${n * n}` }; }
  if (kind === "cube") { const n = R(2, 5); return { q: `${n}³ = □`, type: "number", answer: n ** 3, hint: `Tipp: ${n} · ${n} · ${n}`, explain: `${n} · ${n} · ${n} = ${n ** 3}` }; }
  if (kind === "ten") { const e = R(2, 6); return { q: `10${sup[e]} = □`, type: "number", answer: 10 ** e, hint: `Tipp: Eine 1 mit ${e} Nullen.`, explain: `10${sup[e]} = ${F(10 ** e)}` }; }
  if (kind === "root") { const n = R(2, p.sqMax || 15); return { q: `Welche Zahl mal sich selbst ergibt ${n * n}?`, type: "number", answer: n, explain: `${n} · ${n} = ${n * n}` }; }
  const e = R(2, 6); return { q: `2${sup[e]} = □`, type: "number", answer: 2 ** e, hint: "Tipp: Immer verdoppeln!", explain: `2${sup[e]} = ${2 ** e}` };
}

// Teilbarkeit. p: {divs, max}
const DIV_RULE = { 2: "Letzte Ziffer gerade?", 3: "Quersumme durch 3 teilbar?", 4: "Letzte zwei Ziffern durch 4 teilbar?", 5: "Letzte Ziffer 0 oder 5?", 6: "Durch 2 UND durch 3 teilbar?", 9: "Quersumme durch 9 teilbar?", 10: "Letzte Ziffer 0?" };
function divisible(p) {
  const d = pick(p.divs);
  let n = R(20, p.max);
  if (Math.random() < 0.5) n = n - (n % d);
  if (n < d) n = d * R(2, 9);
  const yes = n % d === 0;
  return { q: `Ist ${F(n)} durch ${d} teilbar?`, type: "choice", choices: ["Ja", "Nein"], answer: yes ? "Ja" : "Nein", hint: "Tipp: " + DIV_RULE[d], explain: yes ? `${F(n)} : ${d} = ${F(n / d)}` : `${F(n)} : ${d} geht nicht ohne Rest.` };
}

// Negative Zahlen. p: {max, ops}
function negatives(p) {
  return tries(() => {
    const op = pick(p.ops), a = R(-p.max, p.max), b = R(-p.max, p.max);
    if (a === 0 || b === 0) return null;
    if (op === "+") return { q: `${neg(a)} + ${neg(b)} = □`, type: "number", keys: ["−"], answer: a + b, hint: "Tipp: Denk an ein Thermometer.", explain: `${neg(a)} + ${neg(b)} = ${F(a + b)}` };
    if (op === "-") return { q: `${neg(a)} ${MINUS} ${neg(b)} = □`, type: "number", keys: ["−"], answer: a - b, hint: "Tipp: Minus eine Minuszahl ist wie Plus!", explain: `${neg(a)} ${MINUS} ${neg(b)} = ${F(a - b)}` };
    const x = R(-9, 9), y = R(-9, 9); if (!x || !y) return null;
    return { q: `${neg(x)} · ${neg(y)} = □`, type: "number", keys: ["−"], answer: x * y, hint: "Tipp: Minus mal Minus gibt Plus.", explain: `${neg(x)} · ${neg(y)} = ${F(x * y)}` };
  });
}

// Geometrie. p: {kinds, max}
function rectSvg(a, b, unit) {
  const s = 120 / Math.max(a, b), w = Math.max(30, a * s), h = Math.max(24, b * s);
  return `<svg viewBox="0 0 ${w + 70} ${h + 50}" class="shape" aria-hidden="true"><rect x="35" y="10" width="${w}" height="${h}" rx="4"/><text x="${35 + w / 2}" y="${h + 34}">${a} ${unit}</text><text x="${w + 42}" y="${10 + h / 2 + 6}" text-anchor="start">${b} ${unit}</text></svg>`;
}
function geometry(p) {
  const kind = pick(p.kinds), a = R(2, p.max), b = R(2, Math.max(2, a - 1));
  if (kind === "perim") return { q: `Ein Rechteck ist ${a} cm lang und ${b} cm breit. Wie groß ist der Umfang? (in cm)`, svg: rectSvg(a, b, "cm"), type: "number", answer: 2 * (a + b), hint: "Tipp: Umfang = einmal rundherum: a + b + a + b", explain: `2 · (${a} + ${b}) = ${2 * (a + b)} cm` };
  if (kind === "area") return { q: `Ein Rechteck ist ${a} m lang und ${b} m breit. Wie groß ist die Fläche? (in m²)`, svg: rectSvg(a, b, "m"), type: "number", answer: a * b, hint: "Tipp: Fläche = Länge · Breite", explain: `${a} · ${b} = ${a * b} m²` };
  if (kind === "square") { const s = R(2, 12); return { q: `Ein Quadrat hat die Seitenlänge ${s} cm. Wie groß ist seine Fläche? (in cm²)`, svg: rectSvg(s, s, "cm"), type: "number", answer: s * s, hint: "Tipp: Seite · Seite", explain: `${s} · ${s} = ${s * s} cm²` }; }
  if (kind === "side") { const area = a * b; return { q: `Ein Rechteck hat die Fläche ${area} cm² und ist ${a} cm lang. Wie breit ist es? (in cm)`, type: "number", answer: b, hint: "Tipp: Fläche : Länge", explain: `${area} : ${a} = ${b} cm` }; }
  const c = R(2, 8); return { q: `Ein Quader ist ${a} cm lang, ${b} cm breit und ${c} cm hoch. Wie groß ist sein Volumen? (in cm³)`, type: "number", answer: a * b * c, hint: "Tipp: Länge · Breite · Höhe", explain: `${a} · ${b} · ${c} = ${a * b * c} cm³` };
}

// Bruchteil einer Zahl. p: {dens}
function fracOf(p) {
  const d = pick(p.dens), n = R(1, d - 1), k = R(1, p.kMax || 10), whole = d * k;
  return { q: `[${n}/${d}] von ${whole} = □`, type: "number", answer: n * k, hint: `Tipp: Erst durch ${d} teilen, dann mal ${n}.`, explain: `${whole} : ${d} = ${k}, ${k} · ${n} = ${n * k}` };
}

// Kürzen & Erweitern. p: {modes, dMax}
function fracBasic(p) {
  const mode = pick(p.modes);
  return tries(() => {
    const d = R(2, p.dMax || 12), n = R(1, d - 1);
    if (gcd(n, d) !== 1) return null;
    const k = R(2, 6);
    if (mode === "expand") return { q: `[${n}/${d}] = [□/${d * k}]`, type: "number", answer: n * k, hint: `Tipp: Mit welcher Zahl wurde ${d} malgenommen?`, explain: `[${n}/${d}] = [${n * k}/${d * k}] (erweitert mit ${k})` };
    return { q: `Kürze so weit wie möglich: [${n * k}/${d * k}]`, type: "fraction", exact: true, keys: ["/"], answer: `${n}/${d}`, hint: `Tipp: Teile oben und unten durch dieselbe Zahl. Schreib z. B. 2/3.`, explain: `[${n * k}/${d * k}] = [${n}/${d}] (gekürzt mit ${k})` };
  });
}

// Brüche addieren/subtrahieren. p: {same, ops, dMax}
function fracAdd(p) {
  return tries(() => {
    const op = pick(p.ops), d1 = R(2, p.dMax || 10), d2 = p.same ? d1 : R(2, p.dMax || 10);
    const n1 = R(1, d1 - 1), n2 = R(1, d2 - 1), L = lcm(d1, d2);
    if (L > 60) return null;
    let n = op === "+" ? n1 * (L / d1) + n2 * (L / d2) : n1 * (L / d1) - n2 * (L / d2);
    if (n <= 0) return null;
    const g = gcd(n, L), sym = op === "+" ? "+" : MINUS;
    return { q: `[${n1}/${d1}] ${sym} [${n2}/${d2}] = □`, type: "fraction", keys: ["/"], answer: `${n / g}/${L / g}`, hint: d1 === d2 ? "Tipp: Gleicher Nenner – nur die Zähler rechnen!" : `Tipp: Mach die Nenner gleich: ${L}`, explain: `= [${n}/${L}]${g > 1 ? ` = [${n / g}/${L / g}]` : ""}` };
  });
}

// Brüche vergleichen
function fracCompare(p) {
  return tries(() => {
    const d1 = R(2, p.dMax || 10), d2 = Math.random() < 0.3 ? d1 : R(2, p.dMax || 10), n1 = R(1, d1 - 1), n2 = R(1, d2 - 1);
    if (n1 === n2 && d1 === d2) return null;
    const v = n1 * d2 - n2 * d1, ans = v < 0 ? "<" : v > 0 ? ">" : "=";
    return { q: `[${n1}/${d1}]  ○  [${n2}/${d2}]`, type: "choice", choices: ["<", "=", ">"], answer: ans, hint: "Tipp: Mach die Nenner gleich – oder stell dir Pizzastücke vor! 🍕", explain: `[${n1 * d2}/${d1 * d2}] ${ans} [${n2 * d1}/${d1 * d2}]` };
  });
}

// Dezimalzahlen. p: {modes}
function decimals(p) {
  const mode = pick(p.modes), x = R(11, 999) / 10, y = R(11, 499) / 10;
  if (mode === "add") return { q: `${F(x)} + ${F(y)} = □`, type: "number", keys: [","], answer: round6(x + y), hint: "Tipp: Komma unter Komma!", explain: `= ${F(x + y)}` };
  if (mode === "sub") { const [a, b] = x >= y ? [x, y] : [y, x]; return { q: `${F(a)} ${MINUS} ${F(b)} = □`, type: "number", keys: [","], answer: round6(a - b), hint: "Tipp: Komma unter Komma!", explain: `= ${F(a - b)}` }; }
  if (mode === "mul10") { const f = pick([10, 100, 1000]), v = R(1, 9999) / 1000; return { q: `${F(v)} · ${F(f)} = □`, type: "number", keys: [","], answer: round6(v * f), hint: `Tipp: Komma um ${String(f).length - 1} Stelle(n) nach rechts.`, explain: `= ${F(v * f)}` }; }
  if (mode === "div10") { const f = pick([10, 100]), v = R(1, 999); return { q: `${F(v)} : ${F(f)} = □`, type: "number", keys: [","], answer: round6(v / f), hint: `Tipp: Komma um ${String(f).length - 1} Stelle(n) nach links.`, explain: `= ${F(v / f)}` }; }
  if (mode === "mulInt") { const v = R(11, 99) / 10, k = R(2, 9); return { q: `${F(v)} · ${k} = □`, type: "number", keys: [","], answer: round6(v * k), hint: "Tipp: Erst ohne Komma rechnen, dann Komma setzen.", explain: `= ${F(v * k)}` }; }
  // compare
  const a = R(100, 999) / 100, b = Math.random() < 0.5 ? round6(Math.floor(a * 10) / 10) : R(100, 999) / 100;
  const ans = a < b ? "<" : a > b ? ">" : "=";
  return { q: `${F(a)}  ○  ${F(b)}`, type: "choice", choices: ["<", "=", ">"], answer: ans, hint: "Tipp: Vergleiche Stelle für Stelle nach dem Komma.", explain: `${F(a)} ${ans} ${F(b)}` };
}

// ggT / kgV. p: {modes, max}
function ggtKgv(p) {
  return tries(() => {
    const mode = pick(p.modes), k = R(2, 8), a = k * R(1, 6), b = k * R(1, 6);
    if (a === b || a > p.max || b > p.max) return null;
    if (mode === "kgv") { const ans = lcm(a, b); if (ans > 120) return null; return { q: `kgV(${a}, ${b}) = □`, type: "number", answer: ans, hint: `Tipp: Schreib die Vielfachen von ${Math.max(a, b)} auf, bis eins auch durch ${Math.min(a, b)} teilbar ist.`, explain: `Kleinstes gemeinsames Vielfaches: ${ans}` }; }
    return { q: `ggT(${a}, ${b}) = □`, type: "number", answer: gcd(a, b), hint: "Tipp: Welche größte Zahl teilt beide?", explain: `Größter gemeinsamer Teiler: ${gcd(a, b)}` };
  });
}

// Prozent (Einstieg). p: {pcts}
function percent(p) {
  const pc = pick(p.pcts), base = pick([20, 40, 60, 80, 100, 120, 200, 300, 400, 500]);
  const ans = (pc * base) / 100;
  if (!Number.isInteger(ans)) return percent(p);
  return { q: `${pc} % von ${base} = □`, type: "number", answer: ans, hint: pc === 50 ? "Tipp: 50 % ist die Hälfte." : pc === 25 ? "Tipp: 25 % ist ein Viertel." : "Tipp: 10 % ist ein Zehntel.", explain: `${base} : 100 · ${pc} = ${ans}` };
}

// Rechengeschichten aus content.js. p: {grade}
function wordProblem(p) {
  const pool = WORD_PROBLEMS.filter((w) => w.grade === p.grade);
  return tries(() => {
    const w = pick(pool), v = {};
    for (const [k, [a, b, s]] of Object.entries(w.vars)) v[k] = R(a, b, s || 1);
    for (const [k, ex] of Object.entries(w.let || {})) v[k] = evalExpr(ex, v);
    const ans = evalExpr(w.answer, v);
    if (!Number.isInteger(ans) || ans < 0 || (w.max != null && ans > w.max)) return null;
    const q = w.text.replace(/\{(\w+)\}/g, (_, k) => F(v[k]));
    return { q, type: "number", answer: ans, story: true, hint: "Tipp: Was weißt du? Was wird gefragt? Plus, Minus, Mal oder Geteilt?", explain: `${w.answer.replace(/[a-z]\w*/g, (k) => F(v[k])).replace(/\*/g, " · ").replace(/\//g, " : ").replace(/-/g, " − ").replace(/\+/g, " + ")} = ${F(ans)}${w.unit ? " " + w.unit : ""}` };
  });
}

// Zahlzerlegung (Klasse 1): "7 = 3 + □". p: {max}
function decompose(p) {
  const n = R(2, p.max), a = R(1, n - 1);
  return { q: `${n} = ${a} + □`, type: "number", answer: n - a, hint: `Tipp: Zähle von ${a} weiter bis ${n}.`, explain: `${n} = ${a} + ${n - a}` };
}

// Gleichungen (Klasse 6). p: {forms}
function equations(p) {
  return tries(() => {
    const form = pick(p.forms), x = R(1, 12), a = R(2, 9), b = R(1, 20);
    if (form === "add") return { q: `x + ${b} = ${x + b}`, sub: "Wie groß ist x?", type: "number", answer: x, hint: `Tipp: Rechne ${x + b} ${MINUS} ${b}.`, explain: `x = ${x + b} ${MINUS} ${b} = ${x}` };
    if (form === "sub") return { q: `x ${MINUS} ${b} = ${x}`, sub: "Wie groß ist x?", type: "number", answer: x + b, hint: `Tipp: Rechne rückwärts: ${x} + ${b}.`, explain: `x = ${x} + ${b} = ${x + b}` };
    if (form === "mul") return { q: `${a} · x = ${a * x}`, sub: "Wie groß ist x?", type: "number", answer: x, hint: `Tipp: ${a * x} : ${a}`, explain: `x = ${a * x} : ${a} = ${x}` };
    return { q: `${a} · x + ${b} = ${a * x + b}`, sub: "Wie groß ist x?", type: "number", answer: x, hint: `Tipp: Erst ${b} abziehen, dann durch ${a} teilen.`, explain: `${a} · x = ${a * x}, also x = ${x}` };
  });
}

// Daten lesen: Säulendiagramm. p: {max, ask}
const CHART_ITEMS = [["🐰", "Hasen"], ["🦊", "Füchse"], ["🐿️", "Eichhörnchen"], ["🦔", "Igel"], ["🐦", "Vögel"]];
function chart(p) {
  return tries(() => {
    const items = shuffle(CHART_ITEMS).slice(0, 4), step = p.step || 1, vals = items.map(() => R(1, p.max / step) * step);
    if (new Set(vals).size < 4) return null;
    const ask = pick(p.ask), i = R(0, 3); let j = R(0, 3); if (i === j) j = (j + 1) % 4;
    const top = Math.max(...vals), W = 260, H = 150;
    const bars = vals.map((v, k) => `<rect x="${20 + k * 60}" y="${H - 20 - (v / top) * 110}" width="40" height="${(v / top) * 110}" rx="4" class="bar"/><text x="${40 + k * 60}" y="${H - 26 - (v / top) * 110}">${v}</text><text x="${40 + k * 60}" y="${H - 2}" class="emo">${items[k][0]}</text>`).join("");
    const svg = `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="Säulendiagramm: ${items.map((it, k) => it[1] + " " + vals[k]).join(", ")}">${bars}</svg>`;
    if (ask === "diff") { const [a, b] = vals[i] >= vals[j] ? [i, j] : [j, i]; if (vals[a] === vals[b]) return null; return { q: `Wie viele ${items[a][1]} mehr als ${items[b][1]} wurden gezählt?`, svg, type: "number", answer: vals[a] - vals[b], hint: "Tipp: Lies beide Säulen ab und rechne den Unterschied.", explain: `${vals[a]} ${MINUS} ${vals[b]} = ${vals[a] - vals[b]}` }; }
    if (ask === "sum") return { q: "Wie viele Tiere wurden insgesamt gezählt?", svg, type: "number", answer: vals.reduce((s, v) => s + v, 0), hint: "Tipp: Zähle alle Säulen zusammen.", explain: vals.join(" + ") + " = " + vals.reduce((s, v) => s + v, 0) };
    return { q: `Wie viele ${items[i][1]} wurden gezählt?`, svg, type: "number", answer: vals[i], hint: "Tipp: Schau auf die Zahl über der Säule.", explain: `${items[i][1]}: ${vals[i]}` };
  });
}

// Zufall: sicher / möglich / unmöglich (Klasse 3–4). Glücksrad mit Farben.
function chance() {
  const colors = [["🔴", "rot"], ["🔵", "blau"], ["🟢", "grün"], ["🟡", "gelb"]];
  const used = shuffle(colors).slice(0, R(1, 3)), wheel = Array.from({ length: 6 }, (_, k) => used[k % used.length]);
  const kind = pick(["sicher", "möglich", "unmöglich"]);
  let c;
  if (kind === "unmöglich") c = colors.find((x) => !used.includes(x));
  else if (kind === "sicher" && used.length === 1) c = used[0];
  else c = used[0];
  const ans = !used.includes(c) ? "unmöglich" : used.length === 1 ? "sicher" : "möglich";
  return { q: `Glücksrad: ${shuffle(wheel).map((w) => w[0]).join(" ")}  –  Der Zeiger bleibt auf ${c[1]} stehen. Das ist …`, type: "choice", choices: ["sicher", "möglich", "unmöglich"], answer: ans, hint: "Tipp: Gibt es die Farbe auf dem Rad? Gibt es noch andere Farben?", explain: `Auf dem Rad: ${used.map((u) => u[1]).join(", ")} → ${ans}` };
}

export const GENERATORS = { decompose, equations, chart, chance, addSub, compare, neighbors, doubleHalf, sequence, times, divRest, placeValue, round: roundTask, mulBig, divBig, units, orderOps, powers, divisible, negatives, geometry, fracOf, fracBasic, fracAdd, fracCompare, decimals, ggtKgv, percent, wordProblem };
