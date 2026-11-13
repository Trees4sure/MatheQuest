// Klänge (WebAudio, ohne Dateien), Konfetti, Vibration und Vorlesen (Sprachausgabe des Geräts).
import { settings } from "./store.js";

let ctx = null;
function ac() {
  if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}
function tone(freq, start, dur, type = "sine", vol = 0.18) {
  const a = ac(); if (!a) return;
  const o = a.createOscillator(), g = a.createGain(), t = a.currentTime + start;
  o.type = type; o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur + 0.05);
}
const SOUNDS = {
  tap: () => tone(660, 0, 0.06, "triangle", 0.08),
  place: () => { tone(220, 0, 0.08, "square", 0.06); tone(330, 0.04, 0.1, "triangle", 0.1); },
  right: () => { tone(660, 0, 0.12, "triangle"); tone(990, 0.1, 0.18, "triangle"); },
  wrong: () => { tone(260, 0, 0.18, "sine", 0.12); tone(220, 0.12, 0.22, "sine", 0.1); },
  hop: () => { const a = ac(); if (!a) return; const o = a.createOscillator(), g = a.createGain(), t = a.currentTime; o.frequency.setValueAtTime(300, t); o.frequency.exponentialRampToValueAtTime(700, t + 0.12); g.gain.setValueAtTime(0.1, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.16); o.connect(g).connect(a.destination); o.start(t); o.stop(t + 0.2); },
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.3, "triangle", 0.16)),
  level: () => [392, 523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.08, 0.25, "square", 0.07)),
  secret: () => [880, 1175, 1568].forEach((f, i) => tone(f, i * 0.09, 0.25, "sine", 0.12)),
  creak: () => { tone(140, 0, 0.25, "sawtooth", 0.04); tone(120, 0.12, 0.25, "sawtooth", 0.04); },
};
export function sound(name) { if (settings().sound) try { SOUNDS[name]?.(); } catch (e) { /* stumm */ } }
export function buzz(ms = 30) { if (settings().sound && navigator.vibrate) try { navigator.vibrate(ms); } catch (e) { /* egal */ } }

// ---------- Vorlesen ----------
export const canSpeak = () => "speechSynthesis" in window;
export function speak(text, force = false) {
  if (!canSpeak() || (!settings().speech && !force)) return;
  try {
    speechSynthesis.cancel();
    const clean = String(text).replace(/<[^>]+>/g, " ").replace(/\[(\d+)\/(\d+)\]/g, "$1 $2-tel").replace(/□/g, "wie viel").replace(/·/g, " mal ").replace(/:/g, " geteilt durch ").replace(/−/g, " minus ").replace(/[\u{1F300}-\u{1FAFF}]/gu, "");
    const u = new SpeechSynthesisUtterance(clean); u.lang = "de-DE"; u.rate = 0.95; u.pitch = 1.1;
    const v = speechSynthesis.getVoices().find((x) => x.lang?.startsWith("de")); if (v) u.voice = v;
    speechSynthesis.speak(u);
  } catch (e) { /* kein Vorlesen */ }
}
export function stopSpeaking() { try { canSpeak() && speechSynthesis.cancel(); } catch (e) { /* egal */ } }

// ---------- Konfetti ----------
export function confetti(n = 80, origin) {
  if (reduced()) return;
  const c = document.createElement("canvas"); c.className = "confetti";
  const W = (c.width = innerWidth), H = (c.height = innerHeight), g = c.getContext("2d");
  document.body.appendChild(c);
  const colors = ["#ffd23f", "#ff7aa8", "#4fb6e8", "#8fd16a", "#a78bfa", "#ff9f43"];
  const ox = origin?.x ?? W / 2, oy = origin?.y ?? H / 3;
  const ps = Array.from({ length: n }, () => ({ x: ox, y: oy, vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 12 - 4, r: Math.random() * 6 + 4, c: colors[(Math.random() * colors.length) | 0], a: Math.random() * 6, va: (Math.random() - 0.5) * 0.4 }));
  let t = 0;
  (function frame() {
    g.clearRect(0, 0, W, H);
    for (const p of ps) { p.vy += 0.35; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.a += p.va; g.save(); g.translate(p.x, p.y); g.rotate(p.a); g.fillStyle = p.c; g.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); g.restore(); }
    if (++t < 110) requestAnimationFrame(frame); else c.remove();
  })();
}

// kleine Sterne an einer Stelle aufsteigen lassen
export function sparkle(el, emoji = "✨", n = 6) {
  if (reduced() || !el) return;
  const r = el.getBoundingClientRect();
  for (let i = 0; i < n; i++) {
    const s = document.createElement("span"); s.className = "sparkle"; s.textContent = emoji;
    s.style.left = r.left + r.width / 2 + (Math.random() - 0.5) * r.width + "px"; s.style.top = r.top + r.height / 2 + "px";
    s.style.animationDelay = i * 60 + "ms"; document.body.appendChild(s); setTimeout(() => s.remove(), 1400);
  }
}

export function reduced() { return settings().reducedMotion || matchMedia("(prefers-reduced-motion: reduce)").matches; }
