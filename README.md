# Kleine Spielewelt

Kostenlose, werbefreie, statische Kinder-PWA für iPad, iPhone und andere Touch-Geräte. Keine Konten, kein Tracking, keine externen Skripte, keine In-App-Käufe.

## Spiele
- Kindermemory mit 2, 3, 4 oder 6 Paaren, ohne Zeitlimit
- Xylophon mit acht spielbaren Tönen
- Formen und Farben erkennen
- Seifenblasen platzen lassen
- Tiere füttern
- Bauernhof, Entdeckerwiese, Fahrzeugwelt und Kinderzimmer

## Installation und Offline-Nutzung
1. https://dennodhn.github.io/spielewelt/ einmal mit Internet öffnen.
2. Warten, bis die Seite vollständig geladen ist. Der Service Worker speichert HTML, CSS, JavaScript, Icon und Manifest.
3. Auf iPad/iPhone in Safari „Teilen“ → „Zum Home-Bildschirm“ auswählen.
4. Offline-Modus nach vollständiger Erstinstallation testen. Nach Updates ist für die neue Version zunächst eine Internetverbindung erforderlich.

## Technik
GitHub Pages, reine HTML/CSS/JS-PWA. Einstieg in `index.html`, Gestaltung in `style.css`, Spiellogik in `app.js`, Offline-Cache in `sw.js`. Alle Assets liegen lokal im Repository.

## Prüfungen und Einschränkungen
`python3 scripts/validate.py` kontrolliert Struktur, Dateien, Manifest und Offline-Cache-Einträge. Diese Prüfungen ersetzen keine echten Browser- und Touchtests. Die Tier- und Fahrzeuglaute sind synthetische Bestätigungstöne, keine authentischen Aufnahmen. Die Symbole sind systemabhängige Emojis, keine individuell gezeichneten Sprites. Für eine vollständige Premium-Grafikproduktion sind weitere Assets und reale Gerätetests erforderlich.

## Datenschutz
Einstellungen werden ausschließlich lokal gespeichert. Keine externen Netzwerkanfragen für Inhalte und keine Nutzungsanalyse.
