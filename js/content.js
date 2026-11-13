// MatheQuest – Texte, Figuren und Geschichte im Dorf Rechenbach.
// Keine Fantasy: echte Menschen, echte Tiere (Tiere sprechen nicht), echte Orte.
// Reine Daten: neue Ideen (z. B. aus docs/CHATGPT-PROMPT.md) lassen sich hier einfügen,
// ohne die Spiellogik anzufassen.

export const VILLAGE = "Rechenbach";
export const GUIDE = { name: "Lina", dog: "Fips", desc: "Lina (9) wohnt in Rechenbach. Ihr Hund Fips ist überall dabei." };

export const STORY = {
  intro: "In zwei Wochen ist Dorffest in Rechenbach! Überall im Dorf wird noch Hilfe gebraucht – und fast überall muss dabei gerechnet werden. Lina und ihr Hund Fips zeigen dir das Dorf. Für jede Hilfe bekommst du einen Stempel in deinen Dorfpass. Wer alle sechs Stempel hat, ist Ehrengast beim Dorffest!",
};

// Sechs Orte im Dorf (Schwerpunkt je Klassenstufe). Übungsthemen: curriculum.js, Abenteuer: adventures/.
// "boss" ist die Person, gegen die man im Rechen-Wettstreit antritt (freundlicher Wettkampf).
export const WORLD_STORY = {
  w1: { name: "Bauernhof & Dorfbach", emoji: "🐄", color: "#3c9d4e",
        intro: "Kühe, Hühner, ein Gemüsegarten und der Dorfbach mit der alten Holzbrücke. Der Sturm letzte Nacht hat hier einiges durcheinandergebracht.",
        cast: ["👧 Lina", "🐕 Fips", "👴 Schreiner Brumm", "👩‍🌾 Bäuerin Hoppe", "🐇 Hase Hoppel"],
        boss: { name: "Bäuerin Hoppe", emoji: "👩‍🌾", taunt: "Wer schneller zählt als meine Hühner gackern, kriegt ein frisches Ei!", defeat: "Donnerwetter! Du rechnest ja flinker als ich Eier sammle." } },
  w2: { name: "Bäckerei & Wochenmarkt", emoji: "🥨", color: "#d9822b",
        intro: "Brezeln in Reihen, Brötchen in Tüten, Äpfel in Kisten – auf dem Markt geht nichts ohne Einmaleins.",
        cast: ["👩‍🍳 Bäckerin Bettina", "🧑‍🌾 Marktmann Karl", "🐈 Kater Moritz"],
        boss: { name: "Bäckerin Bettina", emoji: "👩‍🍳", taunt: "Meine Kasse rechnet schnell. Bist du schneller?", defeat: "Ha! Du bist schneller als meine Kasse. Eine Brezel aufs Haus!" } },
  w3: { name: "Bahnhof", emoji: "🚉", color: "#7c5cd6",
        intro: "Fahrpläne, Gleise, Koffer und eine große Bahnhofsuhr. Hier zählen Minuten und Meter.",
        cast: ["👨‍✈️ Schaffner Schulz", "👵 Frau Lindner mit Koffer", "🐦 die Spatzen am Bahnsteig"],
        boss: { name: "Schaffner Schulz", emoji: "👨‍✈️", taunt: "Mein Zug fährt pünktlich – deine Antworten auch?", defeat: "Alle einsteigen! Du hast gewonnen – pünktlich auf die Minute." } },
  w4: { name: "Feuerwehr & Rathaus", emoji: "🚒", color: "#d2412b",
        intro: "Tausende Liter Wasser, Einwohnerzahlen, Pläne fürs Dorffest – hier wird mit großen Zahlen gerechnet.",
        cast: ["👩‍🚒 Feuerwehrfrau Fiete", "👩‍💼 Bürgermeisterin Nolte", "🐕‍🦺 Feuerwehrhund Balu"],
        boss: { name: "Feuerwehrfrau Fiete", emoji: "👩‍🚒", taunt: "Bei der Feuerwehr muss jede Zahl sitzen. Schaffst du das?", defeat: "Respekt! Dich nehmen wir in die Jugendfeuerwehr." } },
  w5: { name: "Schreinerei & Baustelle", emoji: "🔨", color: "#8a5a33",
        intro: "Der neue Spielplatz fürs Dorffest wird gebaut: Flächen, Zäune, Bretter – und Rechenregeln, damit nichts schief wird.",
        cast: ["👴 Schreiner Brumm", "👷 Bauarbeiterin Ayla", "🐿️ das Eichhörnchen im Holzlager"],
        boss: { name: "Schreiner Brumm", emoji: "👴", taunt: "Erst messen, dann sägen – und vorher richtig rechnen!", defeat: "Saubere Arbeit! Aus dir wird mal eine richtige Schreinerin oder ein richtiger Schreiner." } },
  w6: { name: "Dorffest", emoji: "🎪", color: "#2b6fd6",
        intro: "Losbude, Kuchenstand, Preise und Rabatte – beim Dorffest brauchst du Brüche, Kommazahlen und Prozente.",
        cast: ["👩‍💼 Bürgermeisterin Nolte", "🧑‍🎤 DJ Ole", "👧 Lina mit Fips"],
        boss: { name: "Bürgermeisterin Nolte", emoji: "👩‍💼", taunt: "Wer mein Rätsel löst, darf das Fest eröffnen!", defeat: "Herzlichen Glückwunsch! Du eröffnest das Dorffest von Rechenbach!" } },
};

// Lob – bewusst knapp und sachlich, damit es etwas wert bleibt
export const PRAISE = ["Richtig!", "Stimmt genau.", "Gut gerechnet!", "Genau so.", "Treffer!", "Passt!", "Sauber gelöst.", "Fips wedelt mit dem Schwanz."];
// Lob für Ausdauer, Hilfe und Verbessern – genauso wichtig wie schnelle Treffer
export const PRAISE_EFFORT = {
  secondTry: ["Beim zweiten Anlauf geschafft – dranbleiben lohnt sich!", "Nicht aufgegeben. Stark!"],
  withHint: ["Mit dem Tipp hast du's geknackt. Klug, sich Hilfe zu holen!", "Tipp genutzt und verstanden – genau so lernt man."],
  fixed: ["Diesen Fehler hast du repariert! 🔧", "Früher falsch, jetzt richtig – das ist echtes Lernen."],
};
export const COMBO_PRAISE = { 3: "Drei hintereinander!", 5: "Fünf am Stück – du bist richtig drin!", 10: "Zehn am Stück! Fips bellt vor Freude." };

// Bei falscher Antwort: nie beschämend, immer mit neuer Denkidee
export const COMFORT_RETRY = ["Hmm, noch nicht. Schau nochmal genau hin. 🔍", "Fast! Probier einen anderen Weg.", "Noch ein Versuch – das schaffst du."];
export const COMFORT_SOLUTION = ["Jetzt weißt du, wie es geht. Die Aufgabe kommt später nochmal vorbei.", "Auch Profis verrechnen sich. Wir üben das wieder.", "Fehler sind Spuren für Detektive – wir merken sie uns."];

export const GREETINGS = {
  morning: ["Guten Morgen, {name}! Fips hat schon seine Leine geholt.", "Morgen, {name}! In Rechenbach ist heute viel los."],
  day: ["Hallo {name}! Wo im Dorf helfen wir heute?", "Hey {name}! Lina hat eine neue Aufgabe für dich."],
  evening: ["Guten Abend, {name}! Eine kleine Runde?", "Na, {name}? Ein kurzes Abenteuer vor dem Schlafen?"],
};

// Pause-Empfehlung nach sinnvoller Lernzeit (Minuten einstellbar im Erwachsenenbereich)
export const BREAK_TEXT = ["Du hast richtig viel geschafft! Dein Gehirn freut sich jetzt über eine Pause. Trink was, beweg dich – vielleicht mit einem echten Spaziergang? 🌳",
  "Fips will Gassi gehen. Zeit für eine Pause! Morgen geht's in Rechenbach weiter."];

export const RANKS = [
  { level: 1, title: "Neu im Dorf", emoji: "🎒" },
  { level: 3, title: "Brückenbauer", emoji: "🌉" },
  { level: 6, title: "Dorf-Helfer", emoji: "🤝" },
  { level: 10, title: "Dorf-Detektiv", emoji: "🔎" },
  { level: 15, title: "Rechen-Profi", emoji: "🧮" },
  { level: 20, title: "Dorf-Held", emoji: "🏅" },
  { level: 30, title: "Ehrenbürger von Rechenbach", emoji: "👑" },
];

// Abzeichen. Keine Serien-Abzeichen (keine Pflicht, täglich zu spielen): Übungstage zählen insgesamt.
export const BADGES = [
  { id: "first", emoji: "🐣", name: "Erster Schritt", desc: "Löse deine erste Aufgabe." },
  { id: "bridge", emoji: "🌉", name: "Brückenbauer", desc: "Repariere die Brücke am Dorfbach." },
  { id: "solved100", emoji: "💯", name: "Hunderter-Held", desc: "Löse 100 Aufgaben." },
  { id: "solved500", emoji: "🏔️", name: "Gipfelstürmer", desc: "Löse 500 Aufgaben." },
  { id: "persist", emoji: "🐢", name: "Dranbleiber", desc: "Löse 10 Aufgaben im zweiten Anlauf." },
  { id: "hints", emoji: "💡", name: "Kluger Kopf", desc: "Löse 10 Aufgaben mit Hilfe eines Tipps." },
  { id: "fixer10", emoji: "🔧", name: "Fehler-Mechaniker", desc: "Repariere 10 alte Fehler." },
  { id: "combo10", emoji: "🔥", name: "Im Fluss", desc: "Schaffe 10 richtige Antworten hintereinander." },
  { id: "boss1", emoji: "🏆", name: "Wettstreit-Sieger", desc: "Gewinne deinen ersten Rechen-Wettstreit." },
  { id: "helper", emoji: "🤝", name: "Fürs Dorf da", desc: "Hilf bei den Dorfaufträgen an allen sechs Orten." },
  { id: "days5", emoji: "📅", name: "Stammgast", desc: "Übe an 5 verschiedenen Tagen." },
  { id: "master", emoji: "👑", name: "Themen-Meister", desc: "Erreiche in einem Thema die höchste Stufe." },
  { id: "secret", emoji: "🔍", name: "Spürnase", desc: "Entdecke etwas Verstecktes im Dorf." },
];

// Kleidung für Fips (wird durch Abenteuer freigeschaltet oder mit Münzen gekauft)
export const COSMETICS = {
  none: { name: "Ohne", emoji: "" },
  scarf: { name: "Rotes Halstuch", emoji: "🧣" },
  flower: { name: "Gänseblümchen-Kranz", emoji: "🌼" },
  partyhat: { name: "Partyhütchen", emoji: "🥳" },
};

// Rechengeschichten (Sachaufgaben). {a}, {b} … sind Zufallszahlen aus "vars" ([von, bis, Schrittweite?]).
// "let" berechnet weitere Werte, "answer" ist ein Rechenausdruck, "max" begrenzt das Ergebnis.
// Jede Vorlage wird von tests/generators.test.mjs automatisch auf ganze, nicht negative Lösungen geprüft.
export const WORD_PROBLEMS = [
  { grade: 1, text: "Lina sammelt {a} Kastanien. Ihr Bruder schenkt ihr noch {b}. Wie viele hat Lina jetzt?", vars: { a: [2, 8], b: [1, 9] }, answer: "a+b", max: 10, unit: "Kastanien" },
  { grade: 1, text: "Auf dem Zaun sitzen {a} Spatzen. {b} fliegen weg, weil Fips bellt. Wie viele sitzen noch da?", vars: { a: [5, 15], b: [1, 5] }, answer: "a-b", unit: "Spatzen" },
  { grade: 1, text: "Im Hühnerstall liegen {a} Eier. Frau Hoppe findet noch {b} im Heu. Wie viele Eier sind es?", vars: { a: [3, 12], b: [2, 8] }, answer: "a+b", max: 20, unit: "Eier" },
  { grade: 1, text: "Hoppel hat {a} Möhren. Er knabbert {b} davon weg. Wie viele bleiben übrig?", vars: { a: [6, 10], b: [1, 5] }, answer: "a-b", unit: "Möhren" },
  { grade: 2, text: "Bettina backt {a} Brezeln. {b} sind schon verkauft. Wie viele liegen noch in der Auslage?", vars: { a: [40, 99], b: [11, 39] }, answer: "a-b", unit: "Brezeln" },
  { grade: 2, text: "{a} Brötchen werden in Tüten gepackt. In jede Tüte kommen {b}. Wie viele Tüten werden voll?", vars: { b: [2, 5], c: [2, 10] }, let: { a: "b*c" }, answer: "c", unit: "Tüten" },
  { grade: 2, text: "Ein Apfel kostet {a} Cent. Lina kauft {b} Äpfel. Wie viel Cent muss sie bezahlen?", vars: { a: [5, 10], b: [2, 9] }, answer: "a*b", max: 100, unit: "ct" },
  { grade: 2, text: "Karl hat {a} Erdbeerschalen, Bettina hat {b} mehr. Wie viele hat Bettina?", vars: { a: [20, 60], b: [5, 30] }, answer: "a+b", max: 100, unit: "Schalen" },
  { grade: 3, text: "{a} Fahrgäste verteilen sich gleichmäßig auf {b} Wagen. Wie viele sitzen in jedem Wagen?", vars: { b: [3, 9], c: [5, 12] }, let: { a: "b*c" }, answer: "c", unit: "Fahrgäste" },
  { grade: 3, text: "Der Zug fährt {a} km weit. {b} km hat er schon geschafft. Wie viele Kilometer fehlen noch?", vars: { a: [400, 999], b: [120, 380] }, answer: "a-b", unit: "km" },
  { grade: 3, text: "Schaffner Schulz kontrolliert jeden Tag {a} Züge. Wie viele Züge sind das in {b} Tagen?", vars: { a: [3, 9], b: [4, 9] }, answer: "a*b", unit: "Züge" },
  { grade: 4, text: "Das Löschfahrzeug pumpt {a} Liter pro Minute. Wie viele Liter sind das in {b} Minuten?", vars: { a: [120, 480, 10], b: [3, 9] }, answer: "a*b", unit: "l" },
  { grade: 4, text: "Rechenbach hat {a} Einwohner. {b} davon kommen zum Dorffest. Wie viele bleiben zu Hause?", vars: { a: [10000, 90000, 100], b: [1000, 9000, 50] }, answer: "a-b", unit: "Einwohner" },
  { grade: 4, text: "{a} Helfer verteilen {c} Flyer gerecht. Wie viele Flyer bekommt jeder?", vars: { a: [4, 9], b: [12, 99] }, let: { c: "a*b" }, answer: "b", unit: "Flyer" },
  { grade: 5, text: "Der neue Spielplatz ist {a} m lang und {b} m breit. Wie viele Meter Zaun braucht man rundherum?", vars: { a: [8, 30], b: [4, 20] }, answer: "2*(a+b)", unit: "m" },
  { grade: 5, text: "Ayla verbaut jeden Tag {a} Bretter. Wie viele sind das in {b} Wochen (7 Tage pro Woche)?", vars: { a: [3, 12], b: [2, 6] }, answer: "a*b*7", unit: "Bretter" },
  { grade: 5, text: "Schwimmbadkarten kosten {a} € pro Kind. {b} Kinder gehen hin und bekommen zusammen {c} € Rabatt. Was zahlen sie?", vars: { a: [6, 9], b: [3, 8], c: [2, 10] }, answer: "a*b-c", unit: "€" },
  { grade: 6, text: "Am Kuchenstand gibt es {a} Stück Kuchen. Ein Viertel ist schon verkauft. Wie viele Stücke sind noch da?", vars: { b: [10, 80] }, let: { a: "b*4" }, answer: "a-b", unit: "Stück" },
  { grade: 6, text: "Eine Getränkekiste ist {a} dm lang, {b} dm breit und {c} dm hoch. Wie groß ist ihr Volumen in dm³?", vars: { a: [2, 9], b: [2, 6], c: [2, 5] }, answer: "a*b*c", unit: "dm³" },
  { grade: 6, text: "Ole denkt sich eine Zahl, nimmt sie mal {a} und zählt {b} dazu. Heraus kommt {c}. Welche Zahl war es?", vars: { a: [2, 6], b: [1, 9], x: [2, 12] }, let: { c: "a*x+b" }, answer: "x", unit: "" },
];
