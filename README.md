# Spectroton

Eine Farbe rein, elf abgestimmte Stufen raus. Erzeugt perzeptuell gleichmäßige Farbrampen in OKLCH, prüft jede Stufe nach WCAG 2.2 und schreibt das Ergebnis direkt als Datei auf die Platte — offline, ohne Konto, ohne Server.

**Live:** https://dennismit2n.github.io/spectroton/

## Features

- Basisfarbe per Picker, HEX-Eingabe oder Namenssuche (deutsche, RAL- und internationale Farbnamen über [color.pizza](https://api.color.pizza))
- Elf Stufen (50–950) in OKLCH, mit Reglern für Helligkeit, Buntheit und Farbdrift
- WCAG-2.2-Kontrast je Stufe gegen Weiß und Schwarz
- Gamut-Mapping statt hartem Clipping — sRGB- und Display-P3-Warnung
- Export als CSS Custom Properties, Tailwind, DTCG-Tokens oder reine HEX-Liste
- Hintergrund folgt live der gewählten Basisfarbe
- Installierbar als PWA, läuft komplett offline

## Stack

Eine einzige HTML-Datei, keine Abhängigkeiten, keine Build-Kette. Die Farbmathematik (sRGB ⇄ Oklab ⇄ OKLCH, WCAG-Kontrast, Gamut-Mapping) ist selbst implementiert.

## Lizenz

MIT
