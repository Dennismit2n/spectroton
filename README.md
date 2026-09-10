# Spectroton

Eine Farbe rein, elf abgestimmte Stufen raus. Erzeugt perzeptuell gleichmäßige Farbrampen in OKLCH, prüft jede Stufe nach WCAG 2.2 und schreibt das Ergebnis direkt als Datei auf die Platte — offline, ohne Konto, ohne Server.

**Live:** https://dennismit2n.github.io/spectroton/

<table>
<tr>
<td align="center" width="33%">
<img src="uebersicht.jpg" alt="Basisfarbe, Akzentfarben, Farbname, Kontrastmodus"><br>
<sub>Basisfarbe · Akzentfarben · Farbname</sub>
</td>
<td align="center" width="33%">
<img src="rampe.jpg" alt="Elf Stufen mit WCAG-Kontrast und Sperren"><br>
<sub>Stufen mit Kontrast und Sperren</sub>
</td>
<td align="center" width="33%">
<img src="export.jpg" alt="Export, Bibliothek, Zurücksetzen"><br>
<sub>Export · Bibliothek</sub>
</td>
</tr>
</table>

## Features

- Basisfarbe per Picker, HEX-Eingabe oder Namenssuche (deutsche, RAL- und internationale Farbnamen über [color.pizza](https://api.color.pizza))
- Elf Stufen (50–950) in OKLCH, mit Reglern für Helligkeit, Buntheit und Farbdrift
- Akzentfarben per Farbharmonie dazu (komplementär, triadisch, analog, split-komplementär) — jede mit eigener Rampe, gleiche Feinjustage
- WCAG-2.2-Kontrast je Stufe gegen Weiß und Schwarz, wahlweise APCA-Lc-Werte daneben (WCAG-3-Entwurf, nicht normativ)
- Einzelne Stufen sperren — bleiben stehen, wenn Regler oder Basisfarbe sich ändern
- Gamut-Mapping statt hartem Clipping — sRGB- und Display-P3-Warnung
- Export als CSS Custom Properties, Tailwind, DTCG-Tokens oder reine HEX-Liste
- Hintergrund folgt live der gewählten Palette
- Hell, Dunkel, ein weicheres Dunkel oder automatisch nach Systemeinstellung
- Merkt sich Palette und Regler zwischen den Sitzungen; Bibliothek für beliebig viele benannte Paletten — alles im Gerät, kein Konto
- Palette als Link teilen: der komplette Zustand steckt in der URL, kein Server dazwischen
- Installierbar als PWA, läuft komplett offline

## Stack

Eine einzige HTML-Datei, keine Abhängigkeiten, keine Build-Kette. Die Farbmathematik (sRGB ⇄ Oklab ⇄ OKLCH, WCAG-Kontrast, Gamut-Mapping) ist selbst implementiert.

## Lizenz

MIT
