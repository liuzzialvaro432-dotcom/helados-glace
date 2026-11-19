# Modellkatalog

Chrome-Extension (Manifest V3) und PDF für die feste Agentur-Ordnung mit fünf Modellkategorien.

Jedes Modell hat genau eine Kategorie. Die Linie entscheidet. Die Version ordnet nur innerhalb der Kategorie. Effort-Stufen und Fast-Varianten sind Modi desselben Modells.

## Kategorien

| Kategorie | Linien | Einsatz |
|---|---|---|
| Frontier | Astra, Fable, Mythos | Schwierigste Planung, Analyse, anspruchsvolles Programmieren |
| Stark | Opus, dazu Grok 4.7, Composer 2.5, Gemini 4 Neon | Komplexes Coding und lange Agentenläufe |
| Alltag | Sol, Sonnet, allgemeines Chat | Die meisten Kundenaufgaben |
| Volumen | Luna, Haiku | Klassifizieren, Extraktion, einfache Chats, hohe Stückzahl |
| Spezial | Terra | Sehen, visuelle Aufgaben, Computersteuerung |

## Extension laden

Voraussetzungen: Node.js 20+.

```bash
npm install
npm test
npm run build
```

Danach in Chrome:

1. `chrome://extensions` öffnen
2. Entwicklermodus aktivieren
3. **Entpackte Erweiterung laden** und den Ordner `dist/` wählen

Tastenkürzel: `Alt+Shift+M` öffnet das Popup. Im Popup öffnet `Ctrl/Cmd+K` die Suche.

### Was die Extension kann

- Katalog nach Kategorie, Aufrufbarkeit und Text filtern
- Modelldetails mit Slug, Effort und Herkunft anzeigen
- Slug kopieren und Favoriten speichern
- gebündeltes PDF `Modellkatalog.pdf` öffnen
- Optionen für Sprache und Standardfilter
- i18n über `chrome.i18n` (`de`, `en`)

### Architektur

```
src/background/   Service Worker (MV3)
src/popup/        Popup-UI
src/options/      Optionsseite
src/data/         Katalogdaten
src/utils/        Filter, Storage, Messaging, i18n, Logger
public/           manifest.json, Icons, Locales, PDF
```

Berechtigungen nach Least Privilege: nur `storage` und `alarms`. Kein Content Script, keine Host-Permissions.

## PDF

Das ausführliche Dokument liegt unter [`Modellkatalog.pdf`](./Modellkatalog.pdf). Neu erzeugen:

```bash
npm run pdf
```

Dafür muss Google Chrome installiert sein. Quelle: `build_katalog.py`.

## Datenschutz

Siehe [`PRIVACY.md`](./PRIVACY.md). Die Extension liest keine Seiteninhalte und sendet keine Telemetrie.

## Entwicklung

```bash
npm run typecheck
npm run test:watch
npm run build
```

`dist/` ist das ladbare Extension-Paket.

## Weitere Projekte in diesem Repository

- [`glace/`](glace/README.md): Bestell-App und Website für Helados Glacé (Next.js, PWA). Eigenständiges Projekt mit eigenem `package.json`.
