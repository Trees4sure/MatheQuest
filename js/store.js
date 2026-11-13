// Spielstand: Profile, XP, Münzen, Sticker, Dorfpass-Stempel, Abenteuer, Abzeichen, Fehler-Werkstatt.
// Alles bleibt im localStorage dieses Geräts – kein Konto, kein Server, kein Tracking.

import { RANKS, BADGES } from "./content.js";
import { WORLDS } from "./curriculum.js";
import { rec } from "./competence.js";

const KEY = "mathequest-v2";
const OLD_KEY = "mathequest-v1"; // Prototyp: {grade, coins, stars, done, day, today}
let db = load();

function load() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY));
    if (d && d.profiles) {
      // Version 1 hatte eine Trollmütze und eine Krone: werden zu Halstuch und Partyhütchen
      const MAP = { trollhat: "scarf", crown: "partyhat" };
      for (const p of d.profiles) { p.owned = (p.owned || ["none"]).map((o) => MAP[o] || o); p.cosmetic = MAP[p.cosmetic] || p.cosmetic; }
      return d;
    }
  } catch (e) { /* leer */ }
  return { profiles: [], current: null, settings: { sound: true, speech: false, reducedMotion: false, breakMinutes: 20 } };
}
export function save() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { /* voll/privat */ } }
// Lokale Sicherung für Gerätewechsel oder Neuinstallation; kein Upload, kein Konto.
export function exportBackup() {return JSON.stringify({format:"mathequest-backup",version:1,created:today(),data:db},null,2);}
export function importBackup(text) {
  const obj=JSON.parse(text);
  if(obj?.format!=="mathequest-backup"||obj.version!==1)throw new Error("Keine gültige MatheQuest-Sicherung.");
  const d=obj.data;
  if(!d||!Array.isArray(d.profiles)||d.profiles.length>30||!d.settings||typeof d.settings!=="object")throw new Error("Ungültige Profildaten.");
  const ids=new Set();
  for(const p of d.profiles){
    if(!p||typeof p.id!=="string"||!/^p[a-z0-9]+$/.test(p.id)||ids.has(p.id)||typeof p.name!=="string"||p.name.length>16||!Number.isInteger(p.grade)||p.grade<1||p.grade>7||typeof p.avatar!=="string"||p.avatar.length>12||/[<>]/.test(p.avatar)||typeof p.stats!=="object"||!p.stats||!p.skills||!p.best||!p.adv||!p.bosses||!p.badges||!Array.isArray(p.mistakes)||!Array.isArray(p.owned))throw new Error("Ein Profil in der Sicherung ist ungültig.");
    ids.add(p.id);
  }
  if(d.current!==null&&!ids.has(d.current))throw new Error("Das aktive Profil fehlt.");
  db=d;save();return d.profiles.length;
}
export const settings = () => db.settings;
export function setSetting(k, v) { db.settings[k] = v; save(); }

export const today = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// ---------- Profile ----------
export const profiles = () => db.profiles;
export const current = () => db.profiles.find((p) => p.id === db.current) || null;
export function useProfile(id) { db.current = id; save(); }

export function createProfile({ name, avatar, grade, hero="lina" }) {
  const p = {
    id: "p" + Date.now().toString(36) + Math.random().toString(36).slice(2,5), name: name.trim().slice(0, 16) || "Rechenkind", avatar, grade, hero:hero==="ben"?"ben":"lina",
    xp: 0, coins: 0, shards: 0 /* Sticker */, dailyGoal: 15, created: today(),
    days: [], day: null,
    skills: {},           // Kompetenzmodell (competence.js)
    best: {},             // beste Sterne je Thema
    adv: {},              // Abenteuer-Fortschritt
    bosses: {}, badges: {},
    stats: { solved: 0, correct: 0, second: 0, withHint: 0, bestCombo: 0, mistakesFixed: 0, rounds: 0, minutes: 0 },
    mistakes: [], cosmetic: "none", owned: ["none"],
  };
  // Prototyp-Spielstand übernehmen (Münzen und Klasse), damit nichts verloren geht
  try {
    const old = JSON.parse(localStorage.getItem(OLD_KEY));
    if (old && !db.profiles.length) { p.coins = old.coins || 0; p.stats.solved = old.done || 0; p.stats.correct = old.done || 0; }
  } catch (e) { /* kein alter Stand */ }
  db.profiles.push(p); db.current = p.id; save(); return p;
}
export function updateProfile(fields) { Object.assign(current(), fields); save(); }
export function deleteProfile(id) { db.profiles = db.profiles.filter((p) => p.id !== id); if (db.current === id) db.current = db.profiles[0]?.id || null; save(); }

// ---------- Tag ----------
export function day() {
  const p = current(), t = today();
  if (!p.day || p.day.date !== t) p.day = { date: t, solved: 0, correct: 0, minutes: 0 };
  if (!p.days.includes(t)) { p.days.push(t); p.days = p.days.slice(-400); }
  return p.day;
}
export function addMinute() { const p = current(); if (!p) return; day().minutes++; p.stats.minutes++; save(); }

// ---------- XP / Level ----------
export const xpForLevel = (lvl) => 100 + 25 * (lvl - 1);
export function levelInfo(xp = current().xp) {
  let level = 1, rest = xp;
  while (rest >= xpForLevel(level)) { rest -= xpForLevel(level); level++; }
  const rank = [...RANKS].reverse().find((r) => level >= r.level);
  return { level, into: rest, need: xpForLevel(level), rank };
}
// XP und Münzen gutschreiben. Gibt das neue Level zurück, falls eines erreicht wurde.
export function reward(xp, coins = 0) {
  const p = current(), before = levelInfo().level;
  p.xp += Math.round(xp); p.coins += Math.round(coins); save();
  const after = levelInfo().level;
  return after > before ? after : 0;
}

// ---------- Antworten ----------
export function recordAnswer({ correct, attempts, hint, combo }) {
  const p = current(), d = day();
  d.solved++; p.stats.solved++;
  if (correct) { d.correct++; p.stats.correct++; }
  if (correct && attempts > 1) p.stats.second++;
  if (correct && hint) p.stats.withHint++;
  p.stats.bestCombo = Math.max(p.stats.bestCombo, combo || 0);
  save();
}

// ---------- Themen ----------
export const topicLevel = (topicId) => rec(current(), topicId).level;
export const topicStars = (topicId) => current().best[topicId] || 0;
export function finishRound(topicId, stars) {
  const p = current(), had = p.best[topicId] || 0;
  p.best[topicId] = Math.max(had, stars); p.stats.rounds++; p.lastTopic = topicId; save();
  return stars - had > 0 ? stars - had : 0;
}
export const worldStars = (w) => w.topics.reduce((s, t) => s + topicStars(t.id), 0);
export const bossReady = (w) => w.topics.filter((t) => topicStars(t.id) > 0).length >= Math.ceil(w.topics.length / 2);
export function bossBeaten(w) { current().bosses[w.id] = today(); save(); }

// ---------- Fehler-Werkstatt ----------
export function addMistake(task, skill) {
  const p = current();
  if (p.mistakes.some((m) => m.q === task.q)) return;
  p.mistakes.unshift({ ...task, skill, at: today() });
  p.mistakes = p.mistakes.slice(0, 40); save();
}
export function fixMistake(task) {
  const p = current();
  p.mistakes = p.mistakes.filter((m) => m.q !== task.q);
  p.stats.mistakesFixed++; save();
}

// ---------- Abenteuer & Sammelsachen ----------
export function adv(id) { const p = current(); return (p.adv[id] ||= { done: false, step: 0, secrets: [] }); }
export function addShard(n = 1) { current().shards += n; save(); } // Sticker fürs Album
export function unlockCosmetic(id) { const p = current(); if (!p.owned.includes(id)) p.owned.push(id); save(); }
export function findSecret(advId, secretId) {
  const a = adv(advId); if (a.secrets.includes(secretId)) return false;
  a.secrets.push(secretId); save(); return true;
}

// ---------- Abzeichen ----------
const BADGE_CHECKS = {
  first: (p) => p.stats.solved >= 1,
  bridge: (p) => !!p.adv.bridge?.done,
  solved100: (p) => p.stats.solved >= 100,
  solved500: (p) => p.stats.solved >= 500,
  persist: (p) => p.stats.second >= 10,
  hints: (p) => p.stats.withHint >= 10,
  fixer10: (p) => p.stats.mistakesFixed >= 10,
  combo10: (p) => p.stats.bestCombo >= 10,
  boss1: (p) => Object.keys(p.bosses).length > 0,
  helper: (p) => Object.keys(p.rooms||{}).filter(id=>p.rooms[id]?._mission?.done).length>=6,
  days5: (p) => p.days.length >= 5,
  master: (p) => Object.values(p.skills).some((s) => s.level >= 5 && s.m >= 0.85),
  secret: (p) => Object.values(p.adv).some((a) => a.secrets?.length),
};
export function checkBadges() {
  const p = current(), fresh = [];
  for (const b of BADGES) if (!p.badges[b.id] && BADGE_CHECKS[b.id]?.(p)) { p.badges[b.id] = today(); fresh.push(b); }
  if (fresh.length) save();
  return fresh;
}

// ---------- Vorschläge ----------
export function homeWorld() { return WORLDS.find((w) => w.grade === current().grade) || WORLDS[WORLDS.length-1]; }
export function goals() {
  const p = current(), d = day(), li = levelInfo(), out = [];
  if (!p.adv.bridge?.done) out.push({ emoji: "🌉", text: "Hilf Schreiner Brumm an der kaputten Brücke!" });
  else if (!p.adv.hoppel?.done) out.push({ emoji: "🐇", text: "Bäuerin Hoppes Hase ist ausgebüxt – hilfst du?" });
  if (d.solved < p.dailyGoal) out.push({ emoji: "🎯", text: `Tagesziel: noch ${p.dailyGoal - d.solved} Aufgaben (wenn du magst)` });
  else out.push({ emoji: "✅", text: "Tagesziel geschafft! Du darfst stolz sein." });
  if (p.mistakes.length) out.push({ emoji: "🔧", text: `${p.mistakes.length} Aufgabe${p.mistakes.length > 1 ? "n" : ""} in der Fehler-Werkstatt` });
  out.push({ emoji: "⬆️", text: `Noch ${li.need - li.into} XP bis Level ${li.level + 1}` });
  return out.slice(0, 3);
}
