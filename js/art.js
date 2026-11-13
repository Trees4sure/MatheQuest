// Figuren und Landschaften als SVG – wiederverwendbar, skalierbar, offline.
// Keine Fantasy: Menschen, echte Tiere, ein echtes Dorf.
// Animationen laufen über CSS-Klassen (siehe css/style.css: .char, .body-wrap, .blink, .wag …),
// Gesichtsausdrücke über data-mood am äußeren Element (versteckte Varianten haben display="none").
//
// Asset-Konvention: viewBox mit den Füßen unten in der Mitte, Umrisse 3–4 px in dunklem Braun,
// flache Farben mit einem hellen Glanzlicht.

const INK = "#3a2416";
const inner = (svg) => svg.replace(/^<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
export const viewBoxOf = (svg) => svg.match(/viewBox="([^"]+)"/)[1];
export { inner };

// ---------------- Fips, Linas Hund ----------------
export function fips({ hat = "none", mood = "idle" } = {}) {
  const extra = {
    scarf: `<g class="hat"><path d="M80 50 L104 56 L94 80 Z" fill="#e2483d" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><circle cx="86" cy="54" r="2" fill="#fff"/><circle cx="95" cy="62" r="2" fill="#fff"/><circle cx="93" cy="71" r="2" fill="#fff"/></g>`,
    flower: `<g class="hat">${[[80, 24], [89, 18], [99, 16], [109, 19]].map(([x, y]) => `<g transform="translate(${x} ${y})">${[0, 72, 144, 216, 288].map((a) => `<ellipse rx="3.5" ry="5" transform="rotate(${a}) translate(0 -4.5)" fill="#fff" stroke="${INK}" stroke-width="1.2"/>`).join("")}<circle r="3" fill="#ffd23f"/></g>`).join("")}</g>`,
    partyhat: `<g class="hat"><path d="M88 22 L100 -8 L110 21 Z" fill="#4fb6e8" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M92 13 L106 11 M95 3 L103 2" stroke="#ffd23f" stroke-width="3.5"/><circle cx="100" cy="-9" r="4.5" fill="#ff7aa8" stroke="${INK}" stroke-width="2"/></g>`,
  };
  return `<svg class="char fips" data-mood="${mood}" viewBox="0 -14 132 124" aria-hidden="true">
  <g class="body-wrap">
    <ellipse cx="66" cy="106" rx="42" ry="4" fill="#0002"/>
    <g class="wag" style="transform-origin:36px 60px"><path d="M38 60 Q14 54 16 28 Q26 46 42 52 Z" fill="#fbf7f0" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M16 28 Q15 36 19 40 Q22 34 16 28 Z" fill="#c58a4e"/></g>
    <rect x="52" y="70" width="11" height="33" rx="5" fill="#ece4d8" stroke="${INK}" stroke-width="3"/>
    <rect x="88" y="70" width="11" height="33" rx="5" fill="#ece4d8" stroke="${INK}" stroke-width="3"/>
    <rect x="38" y="70" width="12" height="34" rx="5" fill="#fbf7f0" stroke="${INK}" stroke-width="3"/>
    <rect x="76" y="70" width="12" height="34" rx="5" fill="#fbf7f0" stroke="${INK}" stroke-width="3"/>
    <ellipse cx="64" cy="62" rx="35" ry="19" fill="#fbf7f0" stroke="${INK}" stroke-width="3.5"/>
    <ellipse cx="52" cy="55" rx="15" ry="10" fill="#c58a4e"/>
    <path d="M80 48 Q86 60 82 74" stroke="#e2483d" stroke-width="5" fill="none" stroke-linecap="round"/>
    <circle cx="83" cy="70" r="3.5" fill="#ffd23f" stroke="${INK}" stroke-width="1.5"/>
    <g class="head" style="transform-origin:96px 52px">
      <path d="M100 20 Q116 20 113 44 Q104 40 100 30 Z" fill="#a8693a" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="96" cy="40" r="21" fill="#fbf7f0" stroke="${INK}" stroke-width="3.5"/>
      <ellipse cx="100" cy="33" rx="9.5" ry="8.5" fill="#c58a4e"/>
      <ellipse cx="114" cy="48" rx="12.5" ry="9" fill="#fbf7f0" stroke="${INK}" stroke-width="3"/>
      <ellipse cx="124" cy="44.5" rx="4.8" ry="3.8" fill="#1d1d2b"/><ellipse cx="123" cy="43.3" rx="1.6" ry="1" fill="#fff" opacity=".7"/>
      <g class="blink"><circle class="pupil" cx="101" cy="35" r="3.8" fill="#1d1d2b"/></g><circle cx="102.4" cy="33.6" r="1.3" fill="#fff"/>
      <path d="M84 20 Q70 20 72 48 Q81 44 88 30 Z" fill="#a8693a" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path class="m-smile" d="M110 54 Q116 58 122 53" stroke="${INK}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <g class="m-open" display="none"><path d="M108 53 Q116 59 123 52" stroke="${INK}" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M112 55 Q113 67 118 66 Q122 63 119 55 Z" fill="#ff7a8a" stroke="${INK}" stroke-width="2"/></g>
      ${extra[hat] || ""}
    </g>
  </g>
</svg>`;
}

// ---------------- Lina (9), die Begleiterin ----------------
export function lina({ mood = "idle" } = {}) {
  const SKIN = "#f7cfa8", HAIR = "#8a4b23";
  return `<svg class="char lina" data-mood="${mood}" viewBox="0 0 100 182" aria-hidden="true">
  <g class="body-wrap">
    <ellipse cx="50" cy="177" rx="28" ry="4" fill="#0002"/>
    <rect x="22" y="76" width="20" height="40" rx="7" fill="#2fa36b" stroke="${INK}" stroke-width="3"/>
    <rect x="36" y="116" width="12" height="50" rx="5" fill="#3d5a99" stroke="${INK}" stroke-width="3"/>
    <rect x="52" y="116" width="12" height="50" rx="5" fill="#3d5a99" stroke="${INK}" stroke-width="3"/>
    <ellipse cx="40" cy="169" rx="11" ry="6.5" fill="#e2483d" stroke="${INK}" stroke-width="3"/><ellipse cx="60" cy="169" rx="11" ry="6.5" fill="#e2483d" stroke="${INK}" stroke-width="3"/>
    <path d="M31 168 L48 168 M51 168 L68 168" stroke="#fff" stroke-width="2"/>
    <path d="M30 116 L70 116 L68 128 L32 128 Z" fill="#3d5a99" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M31 120 Q20 98 24 114" stroke="${INK}" stroke-width="0" fill="none"/>
    <path d="M32 80 Q22 98 25 116" stroke="${INK}" stroke-width="11" fill="none" stroke-linecap="round"/><path d="M32 80 Q22 98 25 116" stroke="${SKIN}" stroke-width="6" fill="none" stroke-linecap="round"/>
    <g class="wave" style="transform-origin:68px 80px"><path d="M68 80 Q80 96 76 114" stroke="${INK}" stroke-width="11" fill="none" stroke-linecap="round"/><path d="M68 80 Q80 96 76 114" stroke="${SKIN}" stroke-width="6" fill="none" stroke-linecap="round"/></g>
    <path d="M30 78 Q50 68 70 78 L72 120 L28 120 Z" fill="#ffcf3f" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M30 78 L24 92 L33 95 M70 78 L76 92 L67 95" fill="#ffcf3f" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M38 80 L38 118 M62 80 L62 118" stroke="#24805a" stroke-width="4"/>
    <circle cx="50" cy="98" r="6" fill="#fff" stroke="${INK}" stroke-width="2"/><path d="M47 98 L50 101 L54 95" stroke="#3c9d4e" stroke-width="2" fill="none"/>
    <rect x="45" y="66" width="10" height="10" fill="${SKIN}"/>
    <g class="head" style="transform-origin:50px 66px">
      <g class="wag" style="transform-origin:72px 34px"><path d="M70 30 Q96 32 88 66 Q80 50 68 44 Z" fill="${HAIR}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><circle cx="72" cy="34" r="4" fill="#e2483d" stroke="${INK}" stroke-width="2"/></g>
      <circle cx="25.5" cy="47" r="5" fill="${SKIN}" stroke="${INK}" stroke-width="2.5"/><circle cx="74.5" cy="47" r="5" fill="${SKIN}" stroke="${INK}" stroke-width="2.5"/>
      <circle cx="50" cy="44" r="25" fill="${SKIN}" stroke="${INK}" stroke-width="3.5"/>
      <path d="M25 44 Q22 16 50 16 Q78 16 75 42 Q70 30 60 28 Q56 36 46 34 Q50 30 46 28 Q34 30 27 46 Z" fill="${HAIR}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M37 39 Q41 36 45 39 M55 39 Q59 36 63 39" stroke="${HAIR}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <g class="blink"><ellipse class="pupil" cx="41" cy="46" rx="3.6" ry="4.6" fill="#2a1a10"/><ellipse class="pupil" cx="59" cy="46" rx="3.6" ry="4.6" fill="#2a1a10"/></g>
      <circle cx="42.2" cy="44.4" r="1.3" fill="#fff"/><circle cx="60.2" cy="44.4" r="1.3" fill="#fff"/>
      <circle cx="34" cy="54" r="4" fill="#f59a9a" opacity=".55"/><circle cx="66" cy="54" r="4" fill="#f59a9a" opacity=".55"/>
      <path d="M49 50 Q50 53 52 52" stroke="#c98a60" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path class="m-smile" d="M43 57 Q50 63 57 57" stroke="${INK}" stroke-width="2.8" fill="none" stroke-linecap="round"/>
      <path class="m-open" display="none" d="M42 56 Q50 68 58 56 Z" fill="#8a2e2e" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M33 30 Q44 22 56 26" stroke="#fff" stroke-width="2.5" opacity=".35" fill="none" stroke-linecap="round"/>
    </g>
  </g>
</svg>`;
}

// ---------------- Schreinermeister Brumm ----------------
export function brumm({ mood = "grumpy" } = {}) {
  const SKIN = "#f0c19c";
  return `<svg class="char brumm" data-mood="${mood}" viewBox="0 0 160 190" aria-hidden="true">
  <g class="body-wrap">
    <ellipse cx="80" cy="184" rx="52" ry="6" fill="#0002"/>
    <ellipse cx="58" cy="178" rx="18" ry="8" fill="#5a3a22" stroke="${INK}" stroke-width="3.5"/>
    <ellipse cx="102" cy="178" rx="18" ry="8" fill="#5a3a22" stroke="${INK}" stroke-width="3.5"/>
    <path d="M30 172 Q24 112 80 108 Q136 112 130 172 Z" fill="#c8553d" stroke="${INK}" stroke-width="4"/>
    <path d="M40 130 L120 130 M36 150 L124 150 M60 112 L56 172 M100 112 L104 172" stroke="#a63d2a" stroke-width="3" opacity=".7"/>
    <path d="M52 124 L108 124 L112 172 L48 172 Z" fill="#3f6fb5" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M56 124 L50 110 M104 124 L110 110" stroke="#3f6fb5" stroke-width="7" stroke-linecap="round"/>
    <rect x="66" y="134" width="28" height="18" rx="3" fill="#355f9c" stroke="${INK}" stroke-width="2.5"/>
    <rect x="86" y="124" width="7" height="22" rx="1" fill="#ffd23f" stroke="${INK}" stroke-width="2"/><path d="M86 130 h4 M86 136 h4 M86 142 h4" stroke="${INK}" stroke-width="1.5"/>
    <g class="arm-l"><ellipse cx="28" cy="140" rx="13" ry="24" fill="#c8553d" stroke="${INK}" stroke-width="3.5" transform="rotate(18 28 140)"/><circle cx="22" cy="162" r="9" fill="${SKIN}" stroke="${INK}" stroke-width="3"/></g>
    <g class="arm-r"><ellipse cx="132" cy="140" rx="13" ry="24" fill="#c8553d" stroke="${INK}" stroke-width="3.5" transform="rotate(-18 132 140)"/><circle cx="138" cy="162" r="9" fill="${SKIN}" stroke="${INK}" stroke-width="3"/></g>
    <g class="head">
      <ellipse cx="40" cy="72" rx="8" ry="11" fill="${SKIN}" stroke="${INK}" stroke-width="3"/>
      <ellipse cx="120" cy="72" rx="8" ry="11" fill="${SKIN}" stroke="${INK}" stroke-width="3"/>
      <ellipse cx="80" cy="70" rx="40" ry="41" fill="${SKIN}" stroke="${INK}" stroke-width="4"/>
      <path d="M42 56 Q40 70 46 80 M118 56 Q120 70 114 80" stroke="#9a8a7a" stroke-width="8" fill="none" stroke-linecap="round"/>
      <circle cx="64" cy="62" r="8" fill="#fff" stroke="${INK}" stroke-width="2.5"/><circle cx="96" cy="62" r="8" fill="#fff" stroke="${INK}" stroke-width="2.5"/>
      <g class="blink"><circle class="pupil" cx="65" cy="63" r="4" fill="#1d1d2b"/><circle class="pupil" cx="95" cy="63" r="4" fill="#1d1d2b"/></g>
      <path class="brow-grumpy" d="M52 48 L73 54 M108 48 L87 54" stroke="#8a7a6a" stroke-width="6" stroke-linecap="round"/>
      <path class="brow-happy" display="none" d="M53 50 Q62 42 73 48 M107 50 Q98 42 87 48" stroke="#8a7a6a" stroke-width="6" stroke-linecap="round" fill="none"/>
      <path d="M44 84 Q80 150 116 84 Q100 98 80 98 Q60 98 44 84 Z" fill="#a89584" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M60 102 Q64 118 70 126 M80 104 L80 132 M100 102 Q96 118 90 126" stroke="#8c7968" stroke-width="3" fill="none"/>
      <path d="M58 92 Q80 82 102 92" stroke="#a89584" stroke-width="10" fill="none" stroke-linecap="round"/>
      <ellipse cx="80" cy="78" rx="10" ry="9" fill="#e9a986" stroke="${INK}" stroke-width="3"/>
      <ellipse cx="77" cy="75" rx="3" ry="2" fill="#fff" opacity=".6"/>
      <path class="m-grumpy" d="M68 100 Q80 95 92 100" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/>
      <g class="m-happy" display="none"><path d="M66 97 Q80 114 94 97 Z" fill="#6b1f1f" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><rect x="70" y="97" width="20" height="5" rx="2" fill="#fffbe6"/></g>
      <g class="cap"><path d="M40 44 Q80 -6 120 44 Z" fill="#e2483d" stroke="${INK}" stroke-width="4"/><path d="M38 44 Q80 32 122 44" stroke="#c43a30" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M50 40 L52 28 M64 37 L65 22 M80 36 L80 18 M96 37 L95 22 M110 40 L108 28" stroke="#c43a30" stroke-width="2.5"/></g>
    </g>
  </g>
</svg>`;
}

// ---------------- Hase Hoppel (echter Hase) ----------------
export function hoppel({ mood = "idle" } = {}) {
  return `<svg class="char hoppel" data-mood="${mood}" viewBox="0 0 100 130" aria-hidden="true">
  <g class="body-wrap">
    <ellipse cx="50" cy="126" rx="26" ry="4" fill="#0002"/>
    <g class="ears"><ellipse cx="38" cy="26" rx="8" ry="25" fill="#c9b49a" stroke="${INK}" stroke-width="3" transform="rotate(-10 38 26)"/><ellipse cx="38" cy="28" rx="3.5" ry="16" fill="#e8b8b0" transform="rotate(-10 38 28)"/>
    <ellipse cx="62" cy="26" rx="8" ry="25" fill="#c9b49a" stroke="${INK}" stroke-width="3" transform="rotate(12 62 26)"/><ellipse cx="62" cy="28" rx="3.5" ry="16" fill="#e8b8b0" transform="rotate(12 62 28)"/></g>
    <ellipse cx="50" cy="98" rx="26" ry="26" fill="#c9b49a" stroke="${INK}" stroke-width="3"/>
    <ellipse cx="50" cy="104" rx="14" ry="16" fill="#efe6d8"/>
    <circle cx="75" cy="110" r="8" fill="#fff" stroke="${INK}" stroke-width="2.5"/>
    <ellipse cx="38" cy="122" rx="10" ry="5" fill="#b8a184" stroke="${INK}" stroke-width="2.5"/><ellipse cx="62" cy="122" rx="10" ry="5" fill="#b8a184" stroke="${INK}" stroke-width="2.5"/>
    <g class="head"><circle cx="50" cy="62" r="23" fill="#d3bea4" stroke="${INK}" stroke-width="3"/>
      <g class="blink"><circle class="pupil" cx="40" cy="58" r="4" fill="#1d1d2b"/><circle class="pupil" cx="60" cy="58" r="4" fill="#1d1d2b"/></g>
      <circle cx="38.5" cy="56.5" r="1.4" fill="#fff"/><circle cx="58.5" cy="56.5" r="1.4" fill="#fff"/>
      <ellipse cx="50" cy="68" rx="4" ry="3" fill="#c46f80"/>
      <path d="M45 73 Q50 77 55 73" stroke="${INK}" stroke-width="2.5" fill="none"/>
      <path d="M36 68 L24 66 M36 71 L24 73 M64 68 L76 66 M64 71 L76 73" stroke="${INK}" stroke-width="1.3"/>
    </g>
  </g>
</svg>`;
}

// ---------------- Kleinkram ----------------
export const carrot = (s = 30) => `<svg viewBox="0 0 30 40" width="${s}" height="${s * 4 / 3}" aria-hidden="true"><path d="M15 38 L6 12 Q15 6 24 12 Z" fill="#ff8a1f" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><path d="M10 20 L14 21 M12 27 L16 27" stroke="${INK}" stroke-width="2"/><path d="M15 10 Q10 0 6 2 M15 10 Q15 -2 18 0 M15 10 Q22 0 26 4" stroke="#3c9d4e" stroke-width="3.5" fill="none" stroke-linecap="round"/></svg>`;

// Sticker fürs Sammelalbum
export const sticker = (s = 40) => `<svg viewBox="0 0 44 44" width="${s}" height="${s}" class="sticker" aria-hidden="true"><circle cx="22" cy="22" r="20" fill="#fff" stroke="#d9c7a0" stroke-width="2.5"/><path d="M22 6 L26.5 16.5 L38 17.5 L29.2 25 L32 36 L22 30 L12 36 L14.8 25 L6 17.5 L17.5 16.5 Z" fill="#ffd23f" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/><path d="M34 38 Q38 34 40 30 L36 30 Q35 35 34 38 Z" fill="#eee2c8" stroke="#d9c7a0" stroke-width="1.5"/></svg>`;

// Entenfamilie (Überraschung an der Brücke) – Ursprung: Füße der Mutter
export function ducks() {
  const duck = (x, s, body, head) => `<g transform="translate(${x} 0) scale(${s})"><g class="waddle"><ellipse cx="0" cy="-12" rx="16" ry="11" fill="${body}" stroke="${INK}" stroke-width="2.5"/><path d="M-14 -16 Q-22 -22 -20 -12 Z" fill="${body}" stroke="${INK}" stroke-width="2"/><circle cx="12" cy="-26" r="8" fill="${head}" stroke="${INK}" stroke-width="2.5"/><path d="M19 -27 L28 -24 L19 -22 Z" fill="#ff9f1c" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/><circle cx="14" cy="-28" r="1.8" fill="${INK}"/><path d="M-4 -1 L-4 3 M4 -1 L4 3" stroke="#ff9f1c" stroke-width="3" stroke-linecap="round"/></g></g>`;
  return duck(0, 1, "#b08a5f", "#8a6a45") + duck(-34, 0.55, "#ffe066", "#ffe066") + duck(-56, 0.55, "#ffe066", "#ffe066") + duck(-78, 0.55, "#ffe066", "#ffe066");
}

// ---------------- Dorf-Bausteine ----------------
const house = (x, y, s, wall = "#f5e6c8", roof = "#c8553d") => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-30" y="-40" width="60" height="40" fill="${wall}" stroke="${INK}" stroke-width="2.5"/><path d="M-38 -38 L0 -72 L38 -38 Z" fill="${roof}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><rect x="-21" y="-31" width="12" height="12" fill="#bfe3ff" stroke="${INK}" stroke-width="2"/><rect x="9" y="-31" width="12" height="12" fill="#bfe3ff" stroke="${INK}" stroke-width="2"/><rect x="-6" y="-18" width="12" height="18" fill="#8a5a33" stroke="${INK}" stroke-width="2"/><rect x="14" y="-66" width="8" height="16" fill="#9a8a7a" stroke="${INK}" stroke-width="2"/></g>`;
const church = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="0" y="-46" width="70" height="46" fill="#f2ebe0" stroke="${INK}" stroke-width="2.5"/><path d="M-4 -44 L35 -70 L74 -44 Z" fill="#8a5a33" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><rect x="-26" y="-110" width="30" height="110" fill="#f2ebe0" stroke="${INK}" stroke-width="2.5"/><path d="M-30 -108 L-11 -160 L8 -108 Z" fill="#3c7d5a" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><circle cx="-11" cy="-86" r="9" fill="#fff" stroke="${INK}" stroke-width="2"/><path d="M-11 -86 L-11 -92 M-11 -86 L-7 -86" stroke="${INK}" stroke-width="2"/><path d="M-11 -160 L-11 -172 M-15 -167 L-7 -167" stroke="${INK}" stroke-width="2.5"/><path d="M14 -30 h12 v-10 a6 6 0 0 0 -12 0 z M44 -30 h12 v-10 a6 6 0 0 0 -12 0 z" fill="#bfe3ff" stroke="${INK}" stroke-width="2"/></g>`;
const tree = (x, y, s, c = "#2f8a4a") => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-7" y="-10" width="14" height="40" rx="4" fill="#7a4d2b"/><circle cx="0" cy="-34" r="34" fill="${c}"/><circle cx="-22" cy="-16" r="24" fill="${c}"/><circle cx="22" cy="-16" r="24" fill="${c}"/><circle cx="-8" cy="-48" r="12" fill="#fff" opacity=".12"/></g>`;
const pine = (x, y, s, c = "#23704a") => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-5" y="-6" width="10" height="20" fill="#6b4226"/><path d="M0 -90 L-30 -40 L-16 -40 L-36 -6 L36 -6 L16 -40 L30 -40 Z" fill="${c}"/></g>`;
const flower = (x, y, c) => `<g transform="translate(${x} ${y})"><g class="sway"><path d="M0 0 L0 -18" stroke="#3c8d3c" stroke-width="3"/><circle cy="-20" r="6" fill="${c}"/><circle cy="-20" r="2.5" fill="#ffe17a"/></g></g>`;
const sun = (x, y) => `<g class="sun" data-hot="sun"><circle cx="${x}" cy="${y}" r="90" fill="url(#sunglow)"/><g class="spin" style="transform-origin:${x}px ${y}px">${Array.from({ length: 12 }, (_, i) => `<rect x="${x - 4}" y="${y - 72}" width="8" height="22" rx="4" fill="#ffd23f" transform="rotate(${i * 30} ${x} ${y})"/>`).join("")}</g><circle cx="${x}" cy="${y}" r="38" fill="#ffd23f" stroke="#e9a516" stroke-width="4"/><circle cx="${x - 12}" cy="${y - 12}" r="10" fill="#fff6b0" opacity=".6"/></g>`;
const SKYDEFS = `<radialGradient id="sunglow"><stop offset="0" stop-color="#fff6b0"/><stop offset="1" stop-color="#fff6b0" stop-opacity="0"/></radialGradient>`;

// ---------------- Szene: Dorfbach mit Brücke ----------------
// viewBox 0 0 1000 560. Ebenen: sky, far (Hügel + Dorf), mid (Bäume), ground (Bach, Brücke, Wiese), fx.
// Wichtiges liegt zwischen x = 130 und 870 (bleibt im Hochformat-Ausschnitt sichtbar).
export function clearing() {
  return `<svg class="scene-svg" viewBox="0 0 1000 560" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd3ff"/><stop offset="1" stop-color="#e8f8ff"/></linearGradient>
    <linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4fb6e8"/><stop offset="1" stop-color="#2f86c4"/></linearGradient>
    <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd16a"/><stop offset="1" stop-color="#5daa48"/></linearGradient>
    ${SKYDEFS}
  </defs>
  <g class="layer sky"><rect width="1000" height="560" fill="url(#sky)"/>${sun(790, 90)}
    <g class="cloud drift1"><ellipse cx="160" cy="90" rx="60" ry="22" fill="#fff"/><ellipse cx="190" cy="74" rx="34" ry="24" fill="#fff"/><ellipse cx="135" cy="80" rx="26" ry="18" fill="#fff"/></g>
    <g class="cloud drift2"><ellipse cx="540" cy="60" rx="50" ry="18" fill="#fff" opacity=".9"/><ellipse cx="565" cy="48" rx="28" ry="18" fill="#fff" opacity=".9"/></g>
    <g class="birds drift2"><path d="M300 120 q8 -8 16 0 q8 -8 16 0 M350 140 q6 -6 12 0 q6 -6 12 0" stroke="#3a2416" stroke-width="2.5" fill="none"/></g>
  </g>
  <g class="layer far" data-depth="0.15">
    <path d="M-40 300 Q120 190 300 260 Q430 200 560 250 Q720 180 880 240 Q960 215 1060 250 L1060 360 L-40 360 Z" fill="#a8d99a"/>
    <path d="M-40 335 Q200 270 420 318 Q640 270 860 310 L1060 300 L1060 380 L-40 380 Z" fill="#8cc97c"/>
    ${house(560, 300, 0.62, "#f5e6c8", "#c8553d")}${church(640, 300, 0.7)}${house(770, 296, 0.7, "#fff4e0", "#a5452f")}${house(865, 306, 0.6, "#efe0c0", "#c8553d")}${house(250, 300, 0.55, "#fff4e0", "#a5452f")}
  </g>
  <g class="layer mid" data-depth="0.35">
    ${pine(40, 360, 1.3)}${tree(120, 370, 1.1, "#2f9a50")}${tree(820, 362, 1.0, "#34a057")}${pine(930, 365, 1.4)}${tree(700, 356, 0.8, "#3aa65c")}
  </g>
  <g class="layer ground">
    <path d="M-20 360 Q300 340 1020 360 L1020 580 L-20 580 Z" fill="url(#grass)"/>
    <path class="river" d="M420 360 Q470 420 440 470 Q420 520 460 580 L620 580 Q590 520 610 470 Q640 420 590 360 Z" fill="url(#water)"/>
    <g class="ripples"><path d="M470 420 q12 -6 24 0" stroke="#bfeaff" stroke-width="3" fill="none"/><path d="M520 470 q12 -6 24 0" stroke="#bfeaff" stroke-width="3" fill="none"/><path d="M490 530 q12 -6 24 0" stroke="#bfeaff" stroke-width="3" fill="none"/></g>
    <g class="fish" data-hot="fish"><g class="fish-jump"><path d="M520 470 q16 -12 32 0 q-16 12 -32 0 Z M552 470 l10 -7 l0 14 Z" fill="#9aa7a0" stroke="#3a2416" stroke-width="2.5"/><path d="M528 468 q10 -4 18 0" stroke="#e98a8a" stroke-width="2" fill="none"/><circle cx="527" cy="467" r="1.8" fill="#3a2416"/></g></g>
    <!-- Brücke: links und rechts Pfosten, dazwischen die Bretter (werden von bridge.js ein- und ausgeblendet) -->
    <g class="bridge">
      <rect x="388" y="372" width="14" height="70" rx="4" fill="#7a4d2b" stroke="#3a2416" stroke-width="3"/>
      <rect x="644" y="372" width="14" height="70" rx="4" fill="#7a4d2b" stroke="#3a2416" stroke-width="3"/>
      <path class="rope" d="M395 376 Q523 410 651 376" stroke="#c49a5a" stroke-width="5" fill="none"/>
      <g class="planks">${Array.from({ length: 12 }, (_, i) => `<rect class="plank p${i}" x="${402 + i * 20.2}" y="${400 + Math.sin((i + 0.5) / 12 * Math.PI) * 14}" width="18" height="16" rx="3" fill="#b07a45" stroke="#3a2416" stroke-width="2.5"/>`).join("")}</g>
      <g class="barrier"><rect x="660" y="352" width="70" height="12" rx="6" fill="#fff" stroke="#3a2416" stroke-width="3"/><path d="M672 352 l-6 12 M688 352 l-6 12 M704 352 l-6 12 M720 352 l-6 12" stroke="#e2483d" stroke-width="6"/></g>
      <g class="sign"><rect x="673" y="374" width="6" height="40" fill="#7a4d2b"/><rect x="636" y="354" width="80" height="24" rx="4" fill="#ffd23f" stroke="#3a2416" stroke-width="2.5"/><text x="676" y="371" text-anchor="middle" font-size="13" font-family="sans-serif" font-weight="700" fill="#3a2416">GESPERRT</text></g>
    </g>
    <g class="stump" data-hot="stump"><ellipse cx="290" cy="452" rx="36" ry="12" fill="#c8915a" stroke="#3a2416" stroke-width="3"/><path d="M254 452 L258 486 Q290 496 322 486 L326 452" fill="#8a5a33" stroke="#3a2416" stroke-width="3"/><ellipse cx="290" cy="452" rx="20" ry="6" fill="none" stroke="#9c6b3d" stroke-width="2"/>
      <g class="toolbox"><rect x="272" y="432" width="36" height="16" rx="3" fill="#e2483d" stroke="#3a2416" stroke-width="2.5"/><path d="M282 432 v-6 h16 v6" stroke="#3a2416" stroke-width="2.5" fill="none"/></g>
      <g class="woodpile"><rect x="318" y="494" width="64" height="12" rx="5" fill="#c08850" stroke="#3a2416" stroke-width="2.5"/><rect x="324" y="482" width="52" height="12" rx="5" fill="#b07a45" stroke="#3a2416" stroke-width="2.5"/><rect x="332" y="470" width="38" height="12" rx="5" fill="#c08850" stroke="#3a2416" stroke-width="2.5"/></g></g>
    <g class="bush" data-hot="bush"><circle cx="180" cy="470" r="38" fill="#3f9a4e"/><circle cx="214" cy="482" r="28" fill="#4aab5a"/><circle cx="150" cy="488" r="26" fill="#3a8f48"/><circle cx="190" cy="456" r="6" fill="#e2483d"/><circle cx="208" cy="470" r="6" fill="#e2483d"/>
      <g class="hedgehog"><ellipse cx="190" cy="500" rx="22" ry="15" fill="#7a5a3a"/><path d="M170 498 l-6 -10 l10 2 l2 -12 l8 8 l6 -12 l4 12 l8 -8 l2 12" fill="#5b3f26"/><circle cx="208" cy="500" r="2.5" fill="#000"/><circle cx="213" cy="504" r="2.5" fill="#222"/></g></g>
    <g class="mushrooms" data-hot="mushrooms">${[[196, 540], [224, 550], [250, 534]].map(([x, y], i) => `<g transform="translate(${x} ${y})"><g class="shroom s${i}"><rect x="-4" y="-14" width="8" height="16" rx="3" fill="#fff4dc" stroke="#3a2416" stroke-width="2"/><path d="M-16 -12 Q0 -30 16 -12 Z" fill="#b5651d" stroke="#3a2416" stroke-width="2.5"/></g></g>`).join("")}</g>
    <path d="M660 420 Q760 440 1020 430" stroke="#c7a46b" stroke-width="26" fill="none" stroke-linecap="round" opacity=".7"/>
    ${flower(40, 545, "#ff7aa8")}${flower(380, 548, "#ffd23f")}${flower(700, 540, "#a78bfa")}${flower(760, 552, "#ff7aa8")}${flower(940, 548, "#ffd23f")}${flower(200, 552, "#a78bfa")}
  </g>
  <g class="layer fx"><g class="butterfly"><path d="M0 0 q-10 -12 -14 0 q4 10 14 0 q10 -12 14 0 q-4 10 -14 0" fill="#ff9fd1" stroke="#3a2416" stroke-width="1.5"/></g></g>
</svg>`;
}

// ---------------- Szene: Frau Hoppes Gemüsegarten ----------------
export function meadow() {
  const bed = (x, y, w) => `<g transform="translate(${x} ${y})"><rect x="0" y="0" width="${w}" height="22" rx="8" fill="#8a5a33" stroke="#3a2416" stroke-width="2.5"/>${Array.from({ length: Math.floor(w / 26) }, (_, i) => `<circle cx="${14 + i * 26}" cy="2" r="9" fill="#5fb04a" stroke="#2d6b2f" stroke-width="2"/>`).join("")}</g>`;
  return `<svg class="scene-svg" viewBox="0 0 1000 560" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
  <defs><linearGradient id="sky2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a6e0ff"/><stop offset="1" stop-color="#f2fbff"/></linearGradient>
  <linearGradient id="grass2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9edb74"/><stop offset="1" stop-color="#62b04b"/></linearGradient>${SKYDEFS}</defs>
  <rect width="1000" height="560" fill="url(#sky2)"/>${sun(160, 80)}
  <g class="cloud drift1"><ellipse cx="420" cy="80" rx="60" ry="20" fill="#fff"/><ellipse cx="450" cy="66" rx="30" ry="20" fill="#fff"/></g>
  <g class="cloud drift2"><ellipse cx="700" cy="110" rx="46" ry="16" fill="#fff"/><ellipse cx="724" cy="98" rx="24" ry="16" fill="#fff"/></g>
  <g class="layer far" data-depth="0.15"><path d="M-40 260 Q200 180 420 240 Q640 170 1060 230 L1060 330 L-40 330 Z" fill="#b6e2a4"/>${church(330, 280, 0.5)}${house(450, 284, 0.45)}</g>
  <g class="layer mid" data-depth="0.35"><path d="M-40 300 Q260 255 560 290 Q800 265 1060 280 L1060 340 L-40 340 Z" fill="#94cf80"/>
  ${tree(60, 305, 0.9, "#2f9a50")}${tree(150, 315, 0.7, "#3aa65c")}
  <g transform="translate(780 330)"><rect x="-90" y="-80" width="180" height="80" fill="#f5e6c8" stroke="#3a2416" stroke-width="3"/><path d="M-104 -78 L0 -150 L104 -78 Z" fill="#c8553d" stroke="#3a2416" stroke-width="3" stroke-linejoin="round"/><path d="M-90 -58 h180 M-90 -40 h180" stroke="#8a5a33" stroke-width="3" opacity=".5"/><rect x="-60" y="-60" width="26" height="22" fill="#bfe3ff" stroke="#3a2416" stroke-width="2.5"/><rect x="34" y="-60" width="26" height="22" fill="#bfe3ff" stroke="#3a2416" stroke-width="2.5"/><rect x="-14" y="-44" width="28" height="44" fill="#7a4d2b" stroke="#3a2416" stroke-width="2.5"/><path d="M-50 -100 h16 v-30 h-16 z" fill="#9a8a7a" stroke="#3a2416" stroke-width="2.5"/></g>
  </g>
  <path d="M-20 320 Q500 300 1020 320 L1020 580 L-20 580 Z" fill="url(#grass2)"/>
  <g class="fence">${Array.from({ length: 9 }, (_, i) => `<rect x="${40 + i * 50}" y="312" width="12" height="46" rx="3" fill="#c8915a" stroke="#3a2416" stroke-width="2.5"/>`).join("")}<rect x="32" y="322" width="430" height="9" rx="4" fill="#b07a45" stroke="#3a2416" stroke-width="2"/><rect x="32" y="340" width="430" height="9" rx="4" fill="#b07a45" stroke="#3a2416" stroke-width="2"/></g>
  ${bed(250, 400, 220)}${bed(520, 430, 240)}${bed(300, 470, 200)}
  ${[[60, 540, "#ff7aa8"], [140, 520, "#ffd23f"], [240, 548, "#a78bfa"], [610, 545, "#ffd23f"], [880, 530, "#a78bfa"], [950, 550, "#ff7aa8"]].map(([x, y, c]) => flower(x, y, c)).join("")}
  <g class="butterfly"><path d="M0 0 q-10 -12 -14 0 q4 10 14 0 q10 -12 14 0 q-4 10 -14 0" fill="#ffd23f" stroke="#3a2416" stroke-width="1.5"/></g>
</svg>`;
}

// Lina mit Fips nebeneinander (Startseite, Begrüßung, Ergebnisse)
export function mascot({ mood = "idle", hat = "none" } = {}) {
  const n = (art, x, y, w, h) => art.replace(/^<svg /, `<svg x="${x}" y="${y}" width="${w}" height="${h}" `);
  return `<svg class="mascot" viewBox="0 0 190 182" aria-hidden="true">${n(lina({ mood }), 0, 0, 100, 182)}${n(fips({ hat, mood }), 86, 94, 100, 94)}</svg>`;
}
