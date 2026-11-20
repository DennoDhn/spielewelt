# Tier-Memory – Spielewelt

Kindgerechtes, kostenloses Tier-Memory für iPhone, iPad und Desktop. GitHub Pages ohne Server.

## Spielen
Öffne https://dennodhn.github.io/spielewelt/ . Über das Zahnrad lassen sich 2, 3, 4 oder 6 Tierpaare wählen. Keine Werbung, Konten, Timer oder Punkte.

## Offline-PWA
Die Seite einmal online öffnen und vollständig laden. Danach lässt sie sich offline nutzen. Unter iOS/iPadOS in Safari über **Teilen → Zum Home-Bildschirm** installieren. Nach Updates bei bestehender Internetverbindung einmal neu laden; der Service Worker hält eine lokale Version bereit. Bei privaten Browsersitzungen kann die Offline-Speicherung eingeschränkt sein.

## Entwicklung und Qualität
Statische Dateien `index.html`, `kids.css`, `kids.js`, `sw.js`, `manifest.webmanifest`, `icon.svg`. Test: `node tests/kids-smoke.cjs` nach Installation von Playwright. GitHub Actions führt Chromium- und WebKit-Tests aus. Veröffentlichungen erfolgen erst nach erfolgreicher Prüfung.

## Lizenz
Die importierte Grundlage stammt von https://github.com/sen-ltd/memory-game (MIT); siehe LICENSE. Die aktuelle Kinderversion verwendet eigene Darstellung und Spiellogik.
