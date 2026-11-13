// Lehrplan: 6 Orte im Dorf Rechenbach (Schwerpunkt je Klassenstufe), je Ort mehrere Themen, je Thema 5 Stufen.
// Regionen sind nicht starr an die Klasse gebunden: Kinder dürfen jederzeit leichter oder schwerer üben.
// Orientiert an den KMK-Bildungsstandards Primarstufe und den gängigen Lehrplänen Klasse 5/6
// (Reihenfolge der Themen weicht je Bundesland leicht ab).
// "gen" ist der Name eines Generators aus generators.js, "levels" die Parameter je Stufe.

import { WORLD_STORY } from "./content.js";

const T = (id, name, emoji, gen, levels) => ({ id, name, emoji, gen, levels });
const ALL = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const TOPICS = {
  w1: [
    T("k1-compare", "Größer oder kleiner?", "🐊", "compare", [{ max: 5 }, { max: 10 }, { max: 15 }, { max: 20 }, { max: 20, expr: true }]),
    T("k1-plus10", "Plus & Minus bis 10", "🍌", "addSub", [
      { max: 5, ops: ["+"] }, { max: 10, ops: ["+"] }, { max: 10, ops: ["-"] }, { max: 10, ops: ["+", "-"] }, { max: 10, ops: ["+", "-"], missing: true }]),
    T("k1-decompose", "Zahlen zerlegen", "🧩", "decompose", [{ max: 5 }, { max: 7 }, { max: 10 }, { max: 10 }, { max: 20 }]),
    T("k1-plus20", "Plus & Minus bis 20", "🐒", "addSub", [
      { max: 20, min: 10, ops: ["+"], cross: "no" }, { max: 20, min: 10, ops: ["+", "-"], cross: "no" }, { max: 20, ops: ["+"], cross: "yes", bMax: 9 },
      { max: 20, ops: ["-"], cross: "yes", bMax: 9 }, { max: 20, ops: ["+", "-"], missing: true }]),
    T("k1-neighbors", "Nachbarzahlen", "🏠", "neighbors", [{ max: 10 }, { max: 20 }, { max: 20 }, { max: 50 }, { max: 100 }]),
    T("k1-double", "Verdoppeln & Halbieren", "🪞", "doubleHalf", [{ max: 5 }, { max: 10 }, { max: 10 }, { max: 15 }, { max: 20 }]),
    T("k1-pattern", "Zahlen-Muster", "🕵️", "sequence", [{ max: 10, steps: [1] }, { max: 20, steps: [1, 2] }, { max: 20, steps: [2, 3] }, { max: 20, steps: [2, 3, 5] }, { max: 30, steps: [2, 3, 4, 5] }]),
    T("k1-word", "Rechengeschichten", "📖", "wordProblem", Array(5).fill({ grade: 1 })),
  ],
  w2: [
    T("k2-plus100", "Plus & Minus bis 100", "🪙", "addSub", [
      { max: 100, ops: ["+", "-"], step: 10 }, { max: 100, ops: ["+", "-"], bMax: 9, cross: "no" }, { max: 100, ops: ["+", "-"], bMax: 9, cross: "yes" },
      { max: 100, ops: ["+", "-"], min: 10 }, { max: 100, ops: ["+", "-"], min: 10, missing: true }]),
    T("k2-times", "Einmaleins-Start", "✖️", "times", [
      { rows: [2, 10] }, { rows: [2, 5, 10] }, { rows: [1, 2, 4, 5, 10] }, { rows: [3, 4, 5, 6] }, { rows: ALL, missing: true }]),
    T("k2-div", "Teilen", "🍕", "times", [
      { rows: [2, 10], mode: "div" }, { rows: [2, 5, 10], mode: "div" }, { rows: [2, 3, 4, 5], mode: "div" }, { rows: [2, 3, 4, 5, 10], mode: "mix" }, { rows: ALL, mode: "mix" }]),
    T("k2-money", "Euro & Cent", "💶", "units", [
      { kinds: ["money"] }, { kinds: ["money"], modes: ["down", "up"] }, { kinds: ["money"], modes: ["mixed"] }, { kinds: ["money"], modes: ["down", "up", "mixed"] }, { kinds: ["money"], modes: ["mixed"] }]),
    T("k2-time", "Uhr & Zeit", "⏰", "units", [
      { kinds: ["time"] }, { kinds: ["time"], modes: ["down", "up"] }, { kinds: ["time"], modes: ["mixed"] }, { kinds: ["time"], modes: ["down", "up", "mixed"] }, { kinds: ["time", "money"], modes: ["mixed"] }]),
    T("k2-pattern", "Muster-Detektiv", "🔎", "sequence", [{ max: 50, steps: [2, 5] }, { max: 100, steps: [5, 10] }, { max: 100, steps: [3, 4, 6] }, { max: 100, steps: [7, 8, 9, 11], mult: [2] }, { max: 100, steps: [6, 7, 8, 9, 12, 15], mult: [2, 3] }]),
    T("k2-word", "Rechengeschichten", "📖", "wordProblem", Array(5).fill({ grade: 2 })),
  ],
  w3: [
    T("k3-place", "Stellenwerte bis 1000", "🧱", "placeValue", [
      { digits: 3, modes: ["compose"] }, { digits: 3, modes: ["digit"] }, { digits: 3, modes: ["compose", "digit"] }, { digits: 3, modes: ["count"] }, { digits: 4, modes: ["compose", "digit", "count"] }]),
    T("k3-plus1000", "Plus & Minus bis 1000", "🪜", "addSub", [
      { max: 1000, ops: ["+", "-"], step: 100 }, { max: 1000, ops: ["+", "-"], step: 10 }, { max: 1000, ops: ["+", "-"], bMax: 99, min: 100 },
      { max: 1000, ops: ["+", "-"], min: 100 }, { max: 1000, ops: ["+", "-"], min: 100, missing: true }]),
    T("k3-1x1", "Einmaleins-Profi", "🏅", "times", [
      { rows: ALL }, { rows: [6, 7, 8, 9] }, { rows: ALL, mode: "mix" }, { rows: ALL, missing: true }, { rows: [6, 7, 8, 9], mode: "mix", missing: true }]),
    T("k3-big1x1", "Großes Einmaleins", "🗼", "mulBig", [
      { aMin: 10, aMax: 90, step: 10, bMin: 2, bMax: 9 }, { aMin: 11, aMax: 19, bMin: 2, bMax: 9 }, { aMin: 11, aMax: 25, bMin: 2, bMax: 9 },
      { aMin: 20, aMax: 99, bMin: 2, bMax: 5 }, { aMin: 20, aMax: 99, bMin: 2, bMax: 9 }]),
    T("k3-rest", "Teilen mit Rest", "🍪", "divRest", [
      { rows: [2, 5, 10], maxQ: 5 }, { rows: [2, 3, 4, 5], maxQ: 10 }, { rows: [3, 4, 6] }, { rows: [6, 7, 8, 9] }, { rows: ALL.slice(1) }]),
    T("k3-units", "Längen & Gewichte", "📏", "units", [
      { kinds: ["length"] }, { kinds: ["mass"] }, { kinds: ["length", "mass"], modes: ["down", "up"] }, { kinds: ["length", "mass", "time"], modes: ["mixed"] }, { kinds: ["length", "mass", "time", "money"], modes: ["down", "up", "mixed"] }]),
    T("k3-data", "Tiere zählen (Diagramme)", "📊", "chart", [{ max: 10, ask: ["read"] }, { max: 10, ask: ["read", "diff"] }, { max: 20, ask: ["diff"] }, { max: 20, ask: ["diff", "sum"] }, { max: 50, step: 5, ask: ["diff", "sum"] }]),
    T("k3-word", "Rechengeschichten", "📖", "wordProblem", Array(5).fill({ grade: 3 })),
  ],
  w4: [
    T("k4-place", "Große Zahlen", "🏘️", "placeValue", [
      { digits: 4, modes: ["compose", "digit"] }, { digits: 5, modes: ["compose", "digit"] }, { digits: 6, modes: ["digit"] }, { digits: 6, modes: ["compose", "count"] }, { digits: 7, modes: ["compose", "digit", "count"] }]),
    T("k4-round", "Runden", "🎯", "round", [
      { digits: 3, to: [10] }, { digits: 3, to: [10, 100] }, { digits: 4, to: [100, 1000] }, { digits: 5, to: [1000, 10000] }, { digits: 6, to: [1000, 10000, 100000] }]),
    T("k4-written", "Schriftlich plus & minus", "📝", "addSub", [
      { max: 10000, min: 1000, ops: ["+"] }, { max: 10000, min: 1000, ops: ["-"] }, { max: 100000, min: 10000, ops: ["+", "-"] },
      { max: 1000000, min: 100000, ops: ["+", "-"] }, { max: 1000000, min: 100000, ops: ["+", "-"], missing: true }]),
    T("k4-mult", "Malnehmen", "⛏️", "mulBig", [
      { aMin: 100, aMax: 900, step: 100, bMin: 2, bMax: 9 }, { aMin: 11, aMax: 99, bMin: 3, bMax: 9 }, { aMin: 101, aMax: 999, bMin: 2, bMax: 9 },
      { aMin: 11, aMax: 99, bMin: 11, bMax: 30 }, { aMin: 101, aMax: 999, bMin: 11, bMax: 40 }]),
    T("k4-div", "Dividieren", "🪓", "divBig", [
      { dMin: 2, dMax: 5, qMin: 10, qMax: 50 }, { dMin: 2, dMax: 9, qMin: 11, qMax: 99 }, { dMin: 3, dMax: 9, qMin: 100, qMax: 999 },
      { dMin: 10, dMax: 20, qMin: 10, qMax: 99 }, { dMin: 11, dMax: 50, qMin: 20, qMax: 300 }]),
    T("k4-units", "Größen-Profi", "⚖️", "units", [
      { kinds: ["length", "mass"], modes: ["down", "up"] }, { kinds: ["length", "mass"], modes: ["mixed"] }, { kinds: ["length", "mass", "money"], modes: ["decimal"] },
      { kinds: ["time"], modes: ["mixed", "up"] }, { kinds: ["length", "mass", "money", "time"], modes: ["decimal", "mixed", "up"] }]),
    T("k4-data", "Daten & Zufall", "🎡", "chance", Array(5).fill({})),
    T("k4-word", "Rechengeschichten", "📖", "wordProblem", Array(5).fill({ grade: 4 })),
  ],
  w5: [
    T("k5-order", "Punkt vor Strich", "🧮", "orderOps", [
      { forms: [0, 1], max: 10 }, { forms: [0, 1, 2, 3], max: 20 }, { forms: [4, 5], max: 20 }, { forms: [0, 1, 2, 3, 4, 5, 6, 7], max: 30 }, { max: 40 }]),
    T("k5-powers", "Quadrat- & Hochzahlen", "🔺", "powers", [
      { kinds: ["sq"], sqMax: 10 }, { kinds: ["sq", "ten"], sqMax: 12 }, { kinds: ["sq", "two", "ten"], sqMax: 15 }, { kinds: ["sq", "cube", "root"], sqMax: 15 }, { kinds: ["sq", "cube", "root", "two", "ten"], sqMax: 20 }]),
    T("k5-divisible", "Teilbarkeit", "🧩", "divisible", [
      { divs: [2, 5, 10], max: 200 }, { divs: [2, 5, 10, 3], max: 500 }, { divs: [3, 9], max: 1000 }, { divs: [4, 6], max: 1000 }, { divs: [2, 3, 4, 5, 6, 9, 10], max: 5000 }]),
    T("k5-negative", "Minus-Zahlen", "🌡️", "negatives", [
      { max: 5, ops: ["+"] }, { max: 10, ops: ["+"] }, { max: 10, ops: ["+", "-"] }, { max: 20, ops: ["+", "-"] }, { max: 20, ops: ["+", "-", "*"] }]),
    T("k5-geo", "Umfang & Fläche", "📐", "geometry", [
      { kinds: ["perim"], max: 10 }, { kinds: ["area"], max: 10 }, { kinds: ["perim", "area", "square"], max: 15 }, { kinds: ["side", "area"], max: 15 }, { kinds: ["perim", "area", "side", "square"], max: 25 }]),
    T("k5-fracof", "Bruchteile", "🍰", "fracOf", [
      { dens: [2], kMax: 10 }, { dens: [2, 4], kMax: 10 }, { dens: [3, 4, 5], kMax: 10 }, { dens: [5, 8, 10], kMax: 12 }, { dens: [3, 4, 6, 8, 10, 12], kMax: 15 }]),
    T("k5-word", "Rechengeschichten", "📖", "wordProblem", Array(5).fill({ grade: 5 })),
  ],
  w6: [
    T("k6-fracbasic", "Kürzen & Erweitern", "✂️", "fracBasic", [
      { modes: ["expand"], dMax: 6 }, { modes: ["expand"], dMax: 10 }, { modes: ["simplify"], dMax: 6 }, { modes: ["simplify"], dMax: 10 }, { modes: ["expand", "simplify"], dMax: 12 }]),
    T("k6-fraccmp", "Brüche vergleichen", "⚖️", "fracCompare", [{ dMax: 4 }, { dMax: 6 }, { dMax: 8 }, { dMax: 10 }, { dMax: 12 }]),
    T("k6-fracadd", "Brüche plus & minus", "🥧", "fracAdd", [
      { same: true, ops: ["+"], dMax: 8 }, { same: true, ops: ["+", "-"], dMax: 12 }, { same: false, ops: ["+"], dMax: 6 }, { same: false, ops: ["+", "-"], dMax: 8 }, { same: false, ops: ["+", "-"], dMax: 12 }]),
    T("k6-decimal", "Kommazahlen", "🔢", "decimals", [
      { modes: ["compare"] }, { modes: ["mul10", "div10"] }, { modes: ["add", "sub"] }, { modes: ["mulInt"] }, { modes: ["add", "sub", "mul10", "div10", "mulInt", "compare"] }]),
    T("k6-ggt", "Teiler & Vielfache", "🔗", "ggtKgv", [
      { modes: ["ggt"], max: 30 }, { modes: ["kgv"], max: 30 }, { modes: ["ggt", "kgv"], max: 40 }, { modes: ["ggt"], max: 48 }, { modes: ["ggt", "kgv"], max: 48 }]),
    T("k6-percent", "Prozent-Start", "💯", "percent", [
      { pcts: [50, 100] }, { pcts: [10, 50] }, { pcts: [25, 50, 75] }, { pcts: [10, 20, 30, 40] }, { pcts: [5, 10, 20, 25, 50, 75] }]),
    T("k6-equations", "Gleichungen knacken", "🔐", "equations", [{ forms: ["add"] }, { forms: ["add", "sub"] }, { forms: ["mul"] }, { forms: ["add", "sub", "mul"] }, { forms: ["two", "mul", "sub"] }]),
    T("k6-volume", "Volumen", "📦", "geometry", Array(5).fill({ kinds: ["volume"], max: 10 })),
    T("k6-word", "Rechengeschichten", "📖", "wordProblem", Array(5).fill({ grade: 6 })),
  ],
};

// ---------- Kompetenzmodell: Metadaten je Thema ----------
// area: Kompetenzbereich (Bildungsstandards), goal: Lernziel, pre: Vorkenntnisse (Themen-IDs),
// miscon: typische Fehlvorstellungen (für Hilfen und für Erwachsene in der Übersicht).
// Prozessbezogene Kompetenzen (Problemlösen, Argumentieren, Darstellen) stecken vor allem in den Abenteuern
// und Rechengeschichten.
export const AREAS = { Z: "Zahlen und Operationen", G: "Größen und Messen", R: "Raum und Form", M: "Muster und Strukturen", D: "Daten und Zufall" };
const META = {
  "k1-compare": ["Z", "Zahlen bis 20 der Größe nach vergleichen und <, =, > benutzen", [], ["Zeichen < und > werden verwechselt", "Die Zahl mit der größeren Ziffer vorne gilt immer als größer"]],
  "k1-plus10": ["Z", "Im Zahlenraum bis 10 sicher addieren und subtrahieren", [], ["Beim Weiterzählen wird die Startzahl mitgezählt", "Minus wird als Plus gerechnet"]],
  "k1-decompose": ["Z", "Zahlen bis 10 (20) in zwei Teile zerlegen (Zahlenhaus)", ["k1-plus10"], ["Zerlegung nur in gleich große Teile gedacht"]],
  "k1-plus20": ["Z", "Bis 20 rechnen, auch mit Zehnerübergang", ["k1-plus10", "k1-decompose"], ["Zehnerübergang: Einer werden einfach zusammengezählt (8 + 5 = 3)"]],
  "k1-neighbors": ["Z", "Vorgänger, Nachfolger und Zahlenreihe sicher kennen", [], ["Vorgänger und Nachfolger verwechselt"]],
  "k1-double": ["Z", "Verdoppeln und Halbieren als Rechenhilfe nutzen", ["k1-plus10"], ["Halbieren wird als „minus 2“ verstanden"]],
  "k1-pattern": ["M", "Regeln in einfachen Zahlenfolgen erkennen und fortsetzen", ["k1-neighbors"], ["Nur die letzte Zahl wird betrachtet, nicht die Regel"]],
  "k1-word": ["Z", "Rechengeschichten verstehen und die passende Rechnung finden", ["k1-plus10"], ["Signalwörter („dazu“, „weg“) werden überlesen"]],
  "k2-plus100": ["Z", "Bis 100 addieren und subtrahieren (Zehner und Einer getrennt)", ["k1-plus20"], ["Zehner und Einer werden vertauscht", "Zehnerübergang wird vergessen"]],
  "k2-times": ["Z", "Kernaufgaben des Einmaleins (2er, 5er, 10er) und Tauschaufgaben", ["k1-double"], ["Malnehmen als Plus gerechnet (3 · 4 = 7)"]],
  "k2-div": ["Z", "Teilen als Umkehrung des Malnehmens verstehen", ["k2-times"], ["Dividend und Divisor vertauscht"]],
  "k2-money": ["G", "Mit Euro und Cent umgehen und umrechnen", ["k2-plus100"], ["1 € = 10 ct statt 100 ct"]],
  "k2-time": ["G", "Zeitspannen und Zeiteinheiten (h, min, s) umrechnen", ["k2-plus100"], ["1 h = 100 min (Dezimaldenken)"]],
  "k2-pattern": ["M", "Zahlenfolgen bis 100 mit Plus-, Minus- und Mal-Regeln", ["k1-pattern"], ["Wechselnde Regeln werden nicht erkannt"]],
  "k2-word": ["Z", "Sachaufgaben bis 100 lösen", ["k2-plus100", "k2-times"], ["Rechenart nach Zahlengröße statt nach Inhalt gewählt"]],
  "k3-place": ["Z", "Stellenwerte bis 1000 verstehen (H, Z, E)", ["k2-plus100"], ["Ziffer und Stellenwert verwechselt", "Nullen als Platzhalter vergessen"]],
  "k3-plus1000": ["Z", "Bis 1000 halbschriftlich addieren und subtrahieren", ["k3-place"], ["Übertrag vergessen"]],
  "k3-1x1": ["Z", "Das ganze kleine Einmaleins automatisiert abrufen", ["k2-times", "k2-div"], ["Schwierige Reihen (6–9) nur durch Zählen"]],
  "k3-big1x1": ["Z", "Zehnerzahlen und zweistellige Zahlen mit Einern malnehmen", ["k3-1x1"], ["Nur die Einer werden malgenommen"]],
  "k3-rest": ["Z", "Teilen mit Rest und Rest kleiner als Teiler", ["k3-1x1"], ["Rest größer als der Teiler"]],
  "k3-units": ["G", "Längen, Gewichte und Zeiten umrechnen", ["k2-money", "k2-time"], ["Falsche Umrechnungszahl (1 km = 100 m)"]],
  "k3-data": ["D", "Säulendiagramme ablesen und vergleichen", ["k2-plus100"], ["Unterschied wird mit Summe verwechselt"]],
  "k3-word": ["Z", "Mehrschrittige Sachaufgaben bis 1000", ["k3-plus1000", "k3-1x1"], ["Nur ein Rechenschritt wird ausgeführt"]],
  "k4-place": ["Z", "Große Zahlen bis 1 Million lesen und zerlegen", ["k3-place"], ["Stellen beim Lesen langer Zahlen verrutscht"]],
  "k4-round": ["Z", "Auf Zehner, Hunderter, Tausender … runden", ["k4-place"], ["Immer abgerundet", "Falsche Rundungsstelle"]],
  "k4-written": ["Z", "Schriftlich addieren und subtrahieren", ["k3-plus1000", "k4-place"], ["Stellen nicht untereinander", "Übertrag vergessen"]],
  "k4-mult": ["Z", "Halbschriftlich und schriftlich multiplizieren", ["k3-big1x1"], ["Teilprodukte nicht addiert"]],
  "k4-div": ["Z", "Schriftlich und halbschriftlich dividieren", ["k3-rest", "k4-mult"], ["Nullen im Ergebnis vergessen"]],
  "k4-units": ["G", "Größen mit Komma (Kommaschreibweise) umrechnen", ["k3-units"], ["2,5 m = 25 cm"]],
  "k4-data": ["D", "Wahrscheinlichkeiten als sicher, möglich, unmöglich einschätzen", [], ["„Möglich“ und „sicher“ verwechselt"]],
  "k4-word": ["Z", "Sachaufgaben mit großen Zahlen", ["k4-written", "k4-mult"], ["Überflüssige Angaben werden mitgerechnet"]],
  "k5-order": ["Z", "Rechenregeln: Klammer vor Punkt vor Strich", ["k4-mult"], ["Strikt von links nach rechts gerechnet"]],
  "k5-powers": ["Z", "Quadrat- und Potenzschreibweise verstehen", ["k3-1x1"], ["7² = 14 (Basis mal Hochzahl)"]],
  "k5-divisible": ["M", "Teilbarkeitsregeln (2, 3, 4, 5, 6, 9, 10) anwenden", ["k3-1x1"], ["Quersummenregel auf 4 übertragen"]],
  "k5-negative": ["Z", "Mit negativen Zahlen rechnen (Thermometer, Zahlengerade)", ["k4-written"], ["−3 − 4 = −1", "Minus mal Minus = Minus"]],
  "k5-geo": ["R", "Umfang und Flächeninhalt von Rechteck und Quadrat", ["k3-1x1"], ["Umfang und Fläche verwechselt"]],
  "k5-fracof": ["Z", "Bruchteile von Mengen und Größen bestimmen", ["k3-1x1", "k4-div"], ["Nur durch den Zähler geteilt"]],
  "k5-word": ["Z", "Sachaufgaben mit Rechenregeln und Größen", ["k5-order"], ["Klammern beim Aufschreiben vergessen"]],
  "k6-fracbasic": ["Z", "Brüche kürzen und erweitern", ["k5-fracof", "k5-divisible"], ["Nur Zähler oder nur Nenner verändert"]],
  "k6-fraccmp": ["Z", "Brüche vergleichen (gleichnamig machen)", ["k6-fracbasic"], ["Größerer Nenner = größerer Bruch"]],
  "k6-fracadd": ["Z", "Brüche addieren und subtrahieren", ["k6-fracbasic", "k6-ggt"], ["Zähler plus Zähler, Nenner plus Nenner"]],
  "k6-decimal": ["Z", "Dezimalzahlen vergleichen und rechnen", ["k4-units"], ["3,45 > 3,5, weil 45 > 5"]],
  "k6-ggt": ["M", "ggT und kgV bestimmen", ["k5-divisible"], ["ggT und kgV verwechselt"]],
  "k6-percent": ["Z", "Einfache Prozentangaben als Anteile verstehen", ["k5-fracof", "k6-decimal"], ["Prozent wird als absolute Zahl gelesen"]],
  "k6-equations": ["M", "Einfache Gleichungen durch Rückwärtsrechnen lösen", ["k5-order"], ["Umkehroperation falsch gewählt"]],
  "k6-volume": ["R", "Volumen von Quadern berechnen", ["k5-geo"], ["Volumen mit Oberfläche verwechselt"]],
  "k6-word": ["Z", "Sachaufgaben mit Brüchen, Volumen und Gleichungen", ["k6-fracadd", "k6-equations"], ["Gesuchte Größe nicht erkannt"]],
};
for (const list of Object.values(TOPICS)) for (const t of list) {
  const m = META[t.id];
  if (!m) throw new Error("Metadaten fehlen: " + t.id);
  [t.area, t.goal, t.pre, t.miscon] = m;
}

export const WORLDS = Object.keys(TOPICS).map((id, i) => ({
  id, grade: i + 1, ...WORLD_STORY[id], topics: TOPICS[id],
  bossHp: 10 + 2 * i,
}));

export const TOPIC_BY_ID = Object.fromEntries(WORLDS.flatMap((w) => w.topics.map((t) => [t.id, { ...t, world: w }])));
export const STAGES = 5;
