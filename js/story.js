/* Geschichte der Kampagne „Der Festkuchen“ – reine Texte, keine Logik.
   Roter Faden: Heute ist Dorffest. Bürgermeisterin Nolte will um sechs Uhr den großen Festkuchen anschneiden,
   aber für den Kuchen fehlt an jedem Ort noch etwas. Jeder Ort liefert ein Stück davon.
   Platzhalter: {name} = Name des Kindes, {held} = Lina oder Ben, {ergebnis} = Ergebnis des gerade gelösten Auftrags,
   {a} {b} … = Ergebnisse vom Lieferschein (Dorfpass-Satz). Fips ist ein Hund: er reagiert, er spricht nie.
   Porträts: img = Brustbild in der Sprechblase, froh = Bild beim Lob (aus JPs Bogen, tools/cut-sheet.py). */

export const FADEN = 'Heute Abend wird der große Festkuchen angeschnitten. Doch an jedem Ort fehlt noch etwas dafür.';

export const PEOPLE = {
  w1: { name: 'Frau Hoppe', emoji: '👩‍🌾', img: 'assets/chars/portrait-hoppe.webp', froh: 'assets/chars/portrait-hoppe-froh.webp', trait: 'vergisst ständig, wo sie etwas hingelegt hat' },
  w2: { name: 'Bäckerin Mehl', emoji: '👩‍🍳', img: 'assets/chars/portrait-mehl.webp', froh: 'assets/chars/portrait-mehl-froh.webp', trait: 'verzählt sich gern' },
  w3: { name: 'Schaffner Schulz', emoji: '👨‍✈️', img: 'assets/chars/portrait-schulz.webp', froh: 'assets/chars/portrait-schulz-froh.webp', trait: 'ist immer ein bisschen zu spät' },
  w4: { name: 'Feuerwehrfrau Fiete', emoji: '👩‍🚒', img: 'assets/chars/portrait-fiete.webp', froh: 'assets/chars/portrait-fiete-froh.webp', trait: 'sagt bei allem „Kein Problem!“' },
  w5: { name: 'Schreinermeister Brumm', emoji: '🧔', img: 'brumm', trait: 'brummt erst und freut sich dann' },
  w6: { name: 'Bürgermeisterin Nolte', emoji: '👩‍💼', img: 'assets/chars/portrait-nolte.webp', froh: 'assets/chars/portrait-nolte-froh.webp', trait: 'hält gern Reden' }
};

/* Je Kapitel: was der Ort zum Kuchen beiträgt, Begrüßung, fünf Auftragssätze, fünf Lobsätze,
   das Missgeschick vor Auftrag 3 (fips: true = Fips hat es ausgelöst), die Rettung,
   der Satz vor dem letzten Auftrag (rechnet mit dem Lieferschein), der Schluss mit Ausblick und der Dorfpass-Satz. */
export const STORY = {
  w1: {
    beitrag: 'die Eier',
    hallo: 'Guten Morgen, {name}! Für den Festkuchen brauchen wir Eier. Nur – wo habe ich bloß meinen Korb hingestellt?',
    ask: [
      'Ah, da ist der Korb ja! Zähl bitte mit mir die Eier zusammen.',
      'Ein paar Eier hat Hoppel schon angestupst. Schau, wie viele noch heil sind.',
      'Jetzt füllen wir die Kartons. Wie viele fehlen noch?',
      'Zwei Hühner haben heute gelegt. Welches war fleißiger?',
      'Auf deinem Lieferschein steht schon einiges. Rechne mit, was zusammenkommt.'
    ],
    lob: [
      '{ergebnis}! Genau so viele habe ich auch gezählt – glaube ich.',
      'Richtig, {ergebnis}. Das reicht für den Kuchen.',
      'Prima, {ergebnis}. Jetzt passt alles in die Kartons.',
      'Stimmt! Ich hätte schwören können, es war andersherum.',
      '{ergebnis} – wunderbar! Das schreibe ich mir auf. Wo ist nur mein Stift?'
    ],
    patzer: { fips: true, text: 'Oh nein! Fips hat am Korb geschnüffelt und ihn umgestoßen. Die Eier kullern ins Stroh!' },
    rettung: 'Kein Unglück, {name}. Hilf mir, die Eier wieder in die Kartons zu legen.',
    kette: 'Jetzt zählen wir alles zusammen, was auf deinem Lieferschein steht.',
    schluss: 'Die Eier sind gut verpackt. Aber ohne Mehl wird es kein Kuchen – ab zur Bäckerei!',
    pass: 'Auf dem Bauernhof hast du Frau Hoppe {a} Eier gezählt.'
  },
  w2: {
    beitrag: 'den Teig',
    hallo: 'Da bist du ja, {name}! Die Eier sind angekommen. Jetzt rühre ich den Teig – wenn ich mich nicht wieder verzähle.',
    ask: [
      'Ich backe Brötchen für die Helfer. Rechne für mich, wie viele es werden.',
      'Die Brötchen kommen in Tüten. Verteile sie gerecht.',
      'Wie viel Mehl kommt in die Schüssel? Ich habe zweimal abgewogen.',
      'Zwei Bleche sind fertig. Auf welchem liegt mehr?',
      'Ein Teil wird schon verkauft. Wie viel bleibt für das Fest?'
    ],
    lob: [
      '{ergebnis}! Ich hatte {ergebnis} … oder war es eins mehr? Nein, du hast recht.',
      'Genau {ergebnis} in jede Tüte. Keiner wird benachteiligt.',
      '{ergebnis} – so stimmt das Rezept.',
      'Richtig! Du hast schärfere Augen als ich.',
      'Rest: {ergebnis}. Damit wird der Teig genau richtig.'
    ],
    patzer: { fips: false, text: 'Hoppla! Mir ist die Mehltüte vom Regal gefallen. Jetzt weiß ich nicht mehr, wie viel ich schon hatte.' },
    rettung: 'Rechne du für mich nach, {name}. Ich verzähle mich sonst schon wieder.',
    kette: 'Schau auf deinen Lieferschein: Damit rechnen wir den Rest aus.',
    schluss: 'Der Teig ist im Ofen! Aber die Kirschen für oben drauf kommen erst mit dem Zug …',
    pass: 'In der Bäckerei hast du Bäckerin Mehl beim Teig geholfen: {a} Brötchen für die Helfer.'
  },
  w3: {
    beitrag: 'die Kirschen',
    hallo: 'Puh, {name}, entschuldige, ich bin zu spät! Mit dem Zug kommen die Kirschen für den Festkuchen.',
    ask: [
      'Im Zug sitzen schon Gäste. Rechne mit mir, wie viele noch Platz haben.',
      'Am nächsten Halt steigen noch welche ein. Wie viele sind es dann?',
      'Zwei Wagen sind angekommen. Wo sitzen mehr Gäste?',
      'Eine Kiste Kirschen fehlt noch auf meiner Liste. Welche Zahl gehört hin?',
      'Die Fahrkarten liegen in Umschlägen. Wie viele sind es insgesamt?'
    ],
    lob: [
      '{ergebnis}! Schneller als mein Zug, {name}.',
      'Genau {ergebnis}. Das trage ich gleich ein – wenn ich meinen Stift finde.',
      'Richtig! Und ich dachte, der erste Wagen wäre voller.',
      '{ergebnis} – jetzt ist meine Liste vollständig.',
      '{ergebnis} Fahrkarten. Alles pünktlich, ausnahmsweise!'
    ],
    patzer: { fips: false, text: 'Der Zug hat Verspätung – genau wie ich. Die Kirschkisten stehen noch auf dem Bahnsteig durcheinander.' },
    rettung: 'Hilf mir, {name}, die Kisten zu ordnen, bevor der Zug weiterfährt.',
    kette: 'Mit deinem Lieferschein rechnen wir die letzte Lieferung aus.',
    schluss: 'Die Kirschen sind da! Aber Bäckerin Mehl ruft: Ohne Wasser wird der Guss nichts. Auf zur Feuerwehr!',
    pass: 'Am Bahnhof hast du Schaffner Schulz geholfen, die Kirschen zu holen: {a} Gäste fuhren mit.'
  },
  w4: {
    beitrag: 'das Wasser',
    hallo: 'Hallo, {name}! Wasser für den Zuckerguss? Kein Problem! Wir füllen gleich die Flaschen ab.',
    ask: [
      'Wir brauchen eine bestimmte Menge. Wie viel fehlt noch?',
      'Ein Teil ist schon ausgegeben. Wie viel bleibt übrig?',
      'Die Flaschen stehen in Kisten. Wie viele sind es zusammen?',
      'Der Tankwagen bringt noch mehr. Rechne mit.',
      'Jetzt verteilen wir alles gerecht auf die Kisten.'
    ],
    lob: [
      '{ergebnis}! Kein Problem – mit dir schon gar nicht.',
      'Richtig, {ergebnis}. Das reicht für alle Helfer.',
      '{ergebnis} Flaschen. Kein Problem!',
      'Genau {ergebnis}. Du rechnest wie eine echte Einsatzleitung.',
      '{ergebnis} in jede Kiste. Gerecht verteilt!'
    ],
    patzer: { fips: true, text: 'Fips ist auf den Schlauch getreten – platsch! Jetzt ist eine Kiste nass und alles durcheinander.' },
    rettung: 'Kein Problem, {name}! Wir zählen einfach neu.',
    kette: 'Nimm die Zahlen von deinem Lieferschein dazu.',
    schluss: 'Das Wasser steht bereit. Aber wo soll der große Kuchen stehen? Brumm baut gerade den Tisch!',
    pass: 'Bei der Feuerwehr hast du Fiete mit dem Wasser geholfen: {a} Flaschen für die Helfer.'
  },
  w5: {
    beitrag: 'den Kuchentisch',
    hallo: 'Hm. Da bist du ja, {name}. Der Kuchentisch braucht noch Beine. Und Schrauben. Und Hilfe.',
    ask: [
      'Zwei Kisten mit Bauteilen. Hm. Welche hat mehr?',
      'Die Teile kommen in Bausätze. Wie viele brauchen wir?',
      'Ein paar Teile sind schon verbaut. Was bleibt übrig?',
      'Die Schrauben sollen gerecht auf die Tischbeine. Wie viele für jedes?',
      'Auf deinem Lieferschein steht, was wir schon haben. Wie viel fehlt?'
    ],
    lob: [
      'Hm. Richtig. … Gut gemacht!',
      '{ergebnis}. Das hätte ich auch gesagt. Wirklich!',
      '{ergebnis} übrig. Ordentlich gerechnet.',
      '{ergebnis} für jedes Bein. Dann wackelt nichts.',
      '{ergebnis}! Jetzt freue ich mich doch.'
    ],
    patzer: { fips: true, text: 'Fips hat ein Tischbein für einen Stock gehalten und ist damit weggelaufen!' },
    rettung: 'Hm! Na gut, {name}. Wir zählen die Teile eben noch einmal.',
    kette: 'Schau auf deinen Lieferschein. Was fehlt noch bis zum fertigen Tisch?',
    schluss: 'Der Tisch steht fest. Jetzt fehlt nur noch eins: der Kuchen selbst – auf zum Dorfplatz!',
    pass: 'In der Schreinerei hast du Brumm beim Kuchentisch geholfen: {a} Bauteile gezählt.'
  },
  w6: {
    beitrag: 'das Anschneiden',
    hallo: 'Hallo {name}, hallo liebe Gäste! Alles ist da: Eier, Teig, Kirschen, Wasser und der Tisch. Jetzt wird der Kuchen verteilt!',
    ask: [
      'Der Kuchen wird auf Teller verteilt. Jeder bekommt gleich viel.',
      'Es kommen noch Gäste. Wie viele Stücke brauchen wir jetzt?',
      'Auf jeden Teller kommen gleich viele Stücke. Wie viele sind es zusammen?',
      'Ein paar Stücke sind schon gegessen. Wie viele sind noch da?',
      'Zum Schluss rechnen wir mit deinem Lieferschein. Was fehlt noch?'
    ],
    lob: [
      '{ergebnis} für jeden. Gerechter geht es nicht!',
      '{ergebnis}! Ich halte dazu gleich eine kleine Rede … später.',
      'Genau {ergebnis}. Das ganze Dorf wird satt.',
      'Noch {ergebnis} übrig. Genug für einen Nachschlag.',
      '{ergebnis}! Damit ist der Festkuchen vollständig verteilt.'
    ],
    patzer: { fips: true, text: 'Fips hat unter dem Tisch ein Kuchenstück stibitzt! Jetzt stimmt die Zählung nicht mehr.' },
    rettung: 'Halb so schlimm, {name}. Wir zählen schnell neu, bevor es jemand merkt.',
    kette: 'Nimm die Zahlen von deinem Lieferschein.',
    schluss: 'Der Festkuchen ist angeschnitten! Rechenbach feiert – und alle wissen, wer geholfen hat.',
    pass: 'Auf dem Dorfplatz hast du den Festkuchen gerecht verteilt: {a} Stücke für jeden Teller.'
  }
};

/* Wenn die Klassenstufe eine andere Rechenart vorgibt als die Geschichte (Klasse 1 rechnet plus statt mal,
   ab Klasse 5 Brüche, Prozent …), spricht die Person einen allgemeinen Satz, der zur Rechenart passt. */
export const ASK_OP = {
  add: 'Kommt noch etwas dazu? Rechne mit mir, wie viel es zusammen ist.',
  sub: 'Ein Teil ist schon weg. Wie viel bleibt übrig?',
  missing: 'Wir haben schon etwas, aber nicht genug. Wie viel fehlt noch?',
  compare: 'Zwei Lieferungen – welche ist größer?',
  mul: 'Alles ist in gleich großen Packungen. Wie viel ist es insgesamt?',
  div: 'Das soll gerecht verteilt werden. Wie viel bekommt jeder?',
  frac: 'Nur ein Teil davon ist für den Festkuchen. Wie viel ist das?',
  decimal: 'Die Kasse muss stimmen. Rechnest du für mich?',
  percent: 'Ein Teil wird für die Helfer zurückgelegt. Wie viel ist das?',
  ratio: 'Gleicher Preis für jede Karte – was kostet es dann?',
  equation: 'Auf meinem Zettel steht eine Rechnung mit x. Welche Zahl ist x?',
  area: 'Wie viel Platz ist dort? Miss für mich aus.'
};
export const LOB_OP = ['{ergebnis}! Genau richtig, {name}.', 'Stimmt, {ergebnis}. Danke dir!', '{ergebnis} – prima gerechnet.', 'Richtig! Das hilft mir sehr.', '{ergebnis}! Damit kommen wir weiter.'];
export const PASS_OP = '{ort}: Du hast {person} geholfen. Auf deinem Lieferschein: {a}.';
export const HALLO_OP = 'Hallo {name}! Bevor es {beitrag} für den Festkuchen gibt, ist hier noch viel zu tun.';

/* Satz mit Platzhaltern füllen. Fehlt ein Wert, bleibt kein {…} stehen. */
export function fill(text, values = {}) {
  return String(text).replace(/\{(\w+)\}/g, (_, k) => (values[k] ?? '') === '' ? '' : String(values[k])).replace(/ {2,}/g, ' ').trim();
}
