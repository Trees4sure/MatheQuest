// Antworten lesen, prüfen und hübsch anzeigen.

export function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a || 1; }
export function lcm(a, b) { return Math.abs(a * b) / gcd(a, b); }
export const round6 = (x) => Math.round(x * 1e6) / 1e6;

// "3,5" / "3.5" / "−4" → Zahl, sonst null
export function parseNum(s) {
  const t = String(s).replace(/\s/g, "").replace("−", "-").replace(",", ".");
  if (!/^-?\d+(\.\d+)?$/.test(t)) return null;
  return Number(t);
}

// "3/4" oder "5" → {n, d}, sonst null
export function parseFrac(s) {
  const t = String(s).replace(/\s/g, "").replace("−", "-");
  let m = /^(-?\d+)\/(\d+)$/.exec(t);
  if (m) return { n: Number(m[1]), d: Number(m[2]) };
  m = /^-?\d+$/.exec(t);
  if (m) return { n: Number(t), d: 1 };
  return null;
}

// Zahl im deutschen Format: Komma, Minuszeichen, schmale Tausender-Lücke ab 5 Stellen
export function fmtNum(x) {
  const v = round6(Number(x));
  const neg = v < 0;
  let [int, dec] = String(Math.abs(v)).split(".");
  if (int.length > 4) int = int.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return (neg ? "−" : "") + int + (dec ? "," + dec : "");
}

export function check(task, input) {
  const raw = String(input).trim();
  if (!raw) return false;
  switch (task.type) {
    case "choice":
      return raw === String(task.answer);
    case "fraction": {
      const f = parseFrac(raw), a = parseFrac(task.answer);
      if (!f || !a || f.d === 0) return false;
      if (task.exact) return f.n === a.n && f.d === a.d;
      return f.n * a.d === a.n * f.d;
    }
    case "remainder": {
      const got = raw.replace(/\s/g, "").toUpperCase(), want = String(task.answer).replace(/\s/g, "").toUpperCase();
      return got === want || (want.endsWith("R0") && got === want.slice(0, -2));
    }
    default: {
      const v = parseNum(raw);
      return v !== null && Math.abs(v - Number(task.answer)) < 1e-9;
    }
  }
}

export function showAnswer(task) {
  if (task.type === "number") return fmtNum(task.answer);
  if (task.type === "fraction") return `[${task.answer}]`;
  return String(task.answer);
}

// ---------- kleiner, sicherer Rechenausdruck-Auswerter (für Rechengeschichten) ----------
// unterstützt Zahlen, Variablen, + - * / : · × und Klammern
export function evalExpr(src, vars = {}) {
  const toks = String(src).replace(/[·×]/g, "*").replace(/:/g, "/").replace(/−/g, "-").match(/\d+(\.\d+)?|[a-zA-Z_]\w*|[-+*/()]/g) || [];
  let i = 0;
  const peek = () => toks[i], next = () => toks[i++];
  function primary() {
    const t = next();
    if (t === "(") { const v = sum(); if (next() !== ")") throw new Error("Klammer fehlt"); return v; }
    if (t === "-") return -primary();
    if (/^\d/.test(t)) return Number(t);
    if (t in vars) return Number(vars[t]);
    throw new Error("Unbekannt: " + t);
  }
  function prod() {
    let v = primary();
    while (peek() === "*" || peek() === "/") { const op = next(), r = primary(); v = op === "*" ? v * r : v / r; }
    return v;
  }
  function sum() {
    let v = prod();
    while (peek() === "+" || peek() === "-") { const op = next(), r = prod(); v = op === "+" ? v + r : v - r; }
    return v;
  }
  const v = sum();
  if (i !== toks.length) throw new Error("Ausdruck kaputt: " + src);
  return round6(v);
}
