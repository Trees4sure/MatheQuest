// Adaptives Kompetenzmodell – bewusst einfach und nachvollziehbar (auch für Eltern erklärbar).
//
// Je Fähigkeit (Themen-ID oder Abenteuer-Fähigkeit) wird gespeichert:
//   m      Beherrschung 0…1 (gleitender Mittelwert der Ergebnisse)
//   level  aktuelle Stufe 1…5
//   run    richtige Antworten in Folge (ohne Hilfe), fails: Fehlversuche in Folge
//   n, ok, hint, second   Anzahl Aufgaben, richtig im 1. Versuch, mit Tipp, im 2. Versuch
//   errs   Zähler je Fehlerart (z. B. "zehneruebergang"), ms: typische Bearbeitungszeit (nur Info!)
//   box, due   Wiederholungs-Kasten (Leitner) und nächster Wiederholungstag
//
// Regeln:
//   Ergebnis-Wert: 1. Versuch ohne Hilfe = 1, mit Tipp = 0,7, 2. Versuch = 0,5, gar nicht = 0
//   3 sichere Treffer in Folge → Stufe +1;  2 Fehlschläge in Folge → erst Tipp, dann Stufe −1
//   Die Zeit fließt NICHT in die Stufe ein – sie wird nur für die Übersicht gemerkt.
//   Wiederholung: Abstände 1, 3, 7, 14, 30 Tage; wer eine Wiederholung nicht schafft, fängt bei 1 Tag an.

export const INTERVALS = [0, 1, 3, 7, 14, 30];
export const MAX_LEVEL = 5;

const todayStr = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return todayStr(d); };

export function rec(profile, skill, startLevel = 1) {
  profile.skills ||= {};
  return profile.skills[skill] ||= { m: 0, level: startLevel, run: 0, fails: 0, n: 0, ok: 0, hint: 0, second: 0, errs: {}, ms: 0, box: 0, due: null, last: null };
}

export function scoreOf({ correct, attempts = 1, hint = false }) {
  if (!correct) return 0;
  if (attempts > 1) return 0.5;
  return hint ? 0.7 : 1;
}

// Eine Antwort eintragen. Gibt die Stufenänderung zurück (+1, −1 oder 0).
export function update(profile, skill, result) {
  const r = rec(profile, skill), s = scoreOf(result);
  r.n++; r.last = todayStr();
  if (result.correct && (result.attempts || 1) === 1 && !result.hint) r.ok++;
  if (result.hint) r.hint++;
  if (result.correct && result.attempts > 1) r.second++;
  if (result.errType) r.errs[result.errType] = (r.errs[result.errType] || 0) + 1;
  if (result.ms) r.ms = r.ms ? Math.round(r.ms * 0.8 + result.ms * 0.2) : result.ms;
  r.m = Math.round((r.m + 0.25 * (s - r.m)) * 1000) / 1000;
  if (s >= 0.7) { r.run++; r.fails = 0; } else if (s === 0) { r.fails++; r.run = 0; } else { r.run = 0; }
  if (r.run >= 3 && r.level < MAX_LEVEL) { r.level++; r.run = 0; return +1; }
  if (r.fails >= 2 && r.level > 1) { r.level--; r.fails = 0; return -1; }
  return 0;
}

// Nach einer abgeschlossenen Runde: Wiederholungstermin setzen
export function scheduleReview(profile, skill, accuracy) {
  const r = rec(profile, skill);
  if (accuracy >= 0.8) r.box = Math.min(r.box + 1, INTERVALS.length - 1);
  else if (accuracy < 0.5) r.box = 1;
  else r.box = Math.max(r.box, 1);
  r.due = addDays(INTERVALS[r.box]);
}

// Fällige Wiederholungen (älteste zuerst)
export function dueSkills(profile) {
  const t = todayStr();
  return Object.entries(profile.skills || {})
    .filter(([, r]) => r.due && r.due <= t && r.box > 0)
    .sort((a, b) => a[1].due.localeCompare(b[1].due))
    .map(([id]) => id);
}

// Häufigste Fehlerart (für passende Hilfen)
export function topError(profile, skill) {
  const e = Object.entries(rec(profile, skill).errs).sort((a, b) => b[1] - a[1])[0];
  return e && e[1] >= 2 ? e[0] : null;
}

// Beschreibung für den Erwachsenenbereich
export function describe(r) {
  if (!r || !r.n) return "noch nicht geübt";
  if (r.m >= 0.85) return "sicher";
  if (r.m >= 0.6) return "auf gutem Weg";
  if (r.m >= 0.35) return "im Aufbau";
  return "braucht Unterstützung";
}
