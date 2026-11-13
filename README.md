# MatheQuest v7 – Abenteuer in Rechenbach

**Mathematik lernen, im Dorf helfen und gemeinsam ein Fest vorbereiten.**

MatheQuest ist ein Mathematik-Abenteuerspiel für die Klassen 1–6. Im Dorf Rechenbach begleiten Lina oder Ben und der Hund Fips die Kinder durch alltägliche Aufgaben. Zählobjekte, Bilder, Tipps und erklärte Rechenwege unterstützen das Lernen ohne Zeitdruck. Ein zusätzliches Übungslabor bietet Aufgaben für Klasse 7.

Die Anwendung besteht aus HTML, CSS und JavaScript und lässt sich als Offline-PWA installieren. Sie benötigt kein Backend, kein Benutzerkonto und keinen Build-Schritt. Spielstände werden auf dem jeweiligen Gerät gespeichert.

![Dorfkarte von Rechenbach](assets/scenes/rechenbach-karte.webp)

## Spielen

Profil anlegen, Klassenstufe und Lina oder Ben auswählen. Auf der Dorfkarte einen Ort antippen und gemeinsam mit Fips helfen. Jedes der sechs Kapitel hat fünf Aufträge. Nach 30 erledigten Aufträgen öffnet sich das Dorffest mit einer druckbaren Urkunde. Alle Orte bleiben mit neuen Zahlen wiederholbar. Die Zahlen und Rechenarten richten sich nach der Klassenstufe; Tipps, Rechenwege und eine leichtere Aufgabe helfen beim Lernen. Angezeigte Lösungen zählen nicht als gelöst.

## Enthalten

- Sechs Kapitel: Bauernhof, Bäckerei, Bahnhof, Feuerwehr, Schreinerei und Dorfplatz.
- 47 Trainingsthemen für Klassen 1–6, fünf adaptive Schwierigkeitsstufen.
- Sechs dauerhafte Lernräume mit insgesamt 30 wiederholbaren Mitmach-Aufgabentypen.
- Brücken- und Gartenabenteuer, erkundbare Szenen und Waldbach.
- Zusätzliches Klasse-7-Labor mit acht Themen.
- Punkte, Dorfpass, Sammlung, lokale Profile und lokale Rangliste.
- Gestufte Hilfen, anschauliche Zählobjekte und mathematische Darstellungen, optionales Vorlesen.
- Automatisches Speichern auf dem Gerät; Sicherung und Wiederherstellung als JSON unter „Erwachsene“.
- Gemalte Dorfkarte, Szenenkulissen und Figuren; vollständig mitgelieferte Bilder und Schriftdateien.

## ZIP lokal starten

ZIP vollständig entpacken. Python 3 wird für den kleinen lokalen Webserver benötigt.

**Windows:** `START_MATHEQUEST.bat` starten. Sollte der Browser vor dem Server öffnen, die Seite einmal neu laden.

**macOS / Linux:** Im entpackten Ordner `sh START_MATHEQUEST.sh` ausführen.

Danach `http://127.0.0.1:8765/` öffnen. Das Terminalfenster offen lassen. Alternativ direkt `python3 -m http.server 8765 --bind 127.0.0.1` im Spielordner ausführen. Ein Doppelklick auf `index.html` startet ES-Module und Service Worker nicht zuverlässig.

## Mit GitHub Pages veröffentlichen

1. Den entpackten Spielinhalt in das Repository übernehmen. `index.html` muss direkt im Hauptverzeichnis liegen, neben `assets/`, `css/`, `js/`, `sw.js` und `manifest.webmanifest`. Nicht nur die ZIP hochladen.
2. Eine leere Datei namens `.nojekyll` im Hauptverzeichnis ergänzen, damit GitHub die statischen Dateien ohne Jekyll-Verarbeitung ausliefert.
3. Im Repository **Settings → Pages** öffnen.
4. Unter **Build and deployment → Source** die Option **Deploy from a branch** wählen.
5. Den Branch mit den Spieldateien, beispielsweise **main**, und den Ordner **/ (root)** auswählen; mit **Save** speichern.
6. Nach erfolgreicher Bereitstellung die auf der Pages-Einstellungsseite angezeigte Spieladresse öffnen.

Bei GitHub Free ist Pages für öffentliche Repositories verfügbar. Die Spieladresse ist dann öffentlich erreichbar. Für dieses Projekt ist kein eigener Server erforderlich.

Offizielle Anleitung: [Veröffentlichungsquelle für GitHub Pages konfigurieren](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) · [Statische Website ohne Jekyll](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site).

## Auf dem Handy installieren

Voraussetzung ist eine per HTTPS erreichbare Spieladresse, beispielsweise über GitHub Pages wie oben beschrieben.

Spieladresse einmal online öffnen und auf der Dorfkarte auf „Für das Offline-Spielen bereit“ warten. In Chrome unter Android „App installieren“ / „Zum Startbildschirm hinzufügen“ auswählen; unter Safari auf iPhone/iPad „Teilen → Zum Home-Bildschirm“. Die jeweilige Menübezeichnung kann abweichen. Die Version in diesem Repository benötigt kein Konto.

Vorlesen nutzt die Stimmen des Geräts und kann offline je nach installierter Stimme eingeschränkt sein. Spielstände sind an Browser und Adresse gebunden. Vor einem Umzug oder dem Löschen von Browserdaten unter „Erwachsene“ eine Sicherung herunterladen.

## Projektaufbau

| Datei / Ordner | Inhalt |
| --- | --- |
| `index.html` | Einstieg in das Spiel |
| `manifest.webmanifest` | Name, Symbole und Einstellungen für die PWA |
| `sw.js` | Service Worker und Offline-Dateiliste |
| `js/` | Navigation, Aufgaben, Fortschritt und Spielmechanik |
| `js/journey.js`, `js/journey-logic.js` | Sechs Kapitel und Dorffest-Kampagne |
| `js/adventures/` | Brücken- und Gartenabenteuer |
| `css/` | Gestaltung und responsive Ansichten |
| `assets/` | Szenen, Figuren und mathematische Grafiken |
| `fonts/` | Lokale Schriftdateien und Schriftlizenzen |
| `tests/` | Automatische Mathematik- und Strukturtests |
| `docs/` | Dokumentation, Grafikherkunft und Prüfberichte |

## Entwickeln und prüfen

Die vollständigen Quellen, Grafiken und Tests liegen bei. Mit einer aktuellen Node.js-Version:

```sh
node tests/generators.test.mjs
node tests/logic.test.mjs
node tests/lernorte.test.mjs
node tests/anschaulich.test.mjs
node tests/klasse7.test.mjs
node tests/journey.test.mjs
node tests/integrity.test.mjs
```

Aktuelle Prüfung und Grenzen: `docs/QA-v7.md`. Herkunft der Grafiken: `docs/ASSETS.md`. Frühere Übergaben und Planungsdokumente in `docs/` sind historische Projektunterlagen. Diese README beschreibt die ausgelieferte Version.


Nach Änderungen an Spieldateien die Cache-Version `VERSION` in `sw.js` erhöhen. Neue Dateien, die offline verfügbar sein sollen, in `CORE` aufnehmen. Anschließend die Integritätsprüfung ausführen und die Seite nach der Bereitstellung neu laden.

## Prüfstand und Grenzen

Die sieben oben genannten Testsuiten bestehen. Die Kampagne mit 30 Aufträgen wurde in Klasse 1 vollständig im Browser durchgespielt; ihre Aufgabengeneratoren wurden für Klassen 1–7 automatisch geprüft. Neuladen, gespeicherter Fortschritt, Tipps, Wiederholung und Offlinebetrieb wurden ebenfalls geprüft. Schmale Ansichten wurden bei 360 und 412 Pixel Breite getestet.

Eine Installation auf physischen Android- oder iOS-Geräten wurde noch nicht geprüft. Nicht alle älteren Zusatzspiele wurden vollständig manuell durchgespielt. Die Grafiken liegen nicht durchgehend in 4K vor. Einzelheiten stehen im [Prüfbericht](docs/QA-v7.md).

## Daten und Sicherung

Das Spiel verwendet keine extern geladenen Schriften oder Bilder, keine Werbung und keine eingebauten Trackingdienste. Der jeweilige Hostinganbieter kann unabhängig davon technische Zugriffsdaten verarbeiten.

Profile, Punkte und Lernfortschritte bleiben im lokalen Browserspeicher. Es gibt keine automatische Synchronisation zwischen Geräten. Unter **Erwachsene** lassen sich Spielstände als JSON exportieren und wieder importieren. Ein anderer Browser, eine neue Spieladresse oder das Löschen von Browserdaten kann einen neuen Spielstand bedeuten; vorher eine Sicherung erstellen.

## Grafiken und Nutzungsrechte

Die Herkunft der Bilder, Figuren und Schriften ist in [docs/ASSETS.md](docs/ASSETS.md) dokumentiert. Die mitgelieferten Schriftdateien besitzen eigene Lizenztexte im Ordner `fonts/`. Für Code und Projektgrafiken wird mit dieser README keine zusätzliche Open-Source-Lizenz vergeben.
