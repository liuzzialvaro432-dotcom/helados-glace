# Helados Glacé – Bestell-App und Website

> **GitHub-Ansicht:** Screenshots, Banner und Projektübersicht stehen in der [README im Repo-Root](../README.md).

Web-App im Stil von PedidosYa/Fiweex für Helados Glacé (Paraguay): Katalog mit echten Produkten, Warenkorb,
Delivery oder Abholung und Bestellung per WhatsApp. Dieselbe Anwendung ist Website und installierbare App (PWA)
für iPhone/iPad, Android, Windows, macOS und Linux.

Die Oberfläche ist auf Spanisch (Paraguay). Es gibt kein Backend und keine Datenbank: Bestellungen gehen als
fertig formatierte WhatsApp-Nachricht an das Lokal, Warenkorb, Kundendaten und Cupones liegen im Browser
(`localStorage`).

## Starten

Voraussetzung: Node.js 20.9 oder neuer.

```bash
cd glace
npm install
npm run dev        # http://localhost:4387
```

| Befehl | Zweck |
|---|---|
| `npm run dev` | Entwicklungsserver auf Port 4387 |
| `npm run build` / `npm start` | Produktions-Build und Server (Service Worker ist nur hier aktiv) |
| `npm test` | Unit-Tests (Preise, Cupones, WhatsApp-Nachricht, Öffnungszeiten, Kalender, Katalog) |
| `npm run lint` / `npm run typecheck` | ESLint und TypeScript |
| `npm run sync:catalog` | Katalog, Sabores und Bilder neu von `fiweex.com/delivery/glace` laden |
| `npm run build:brand` | App-Icons, Catering-Bild und WhatsApp-Vorschaubild neu erzeugen |

Optional: Umgebungsvariable `SITE_URL` (z. B. `https://pedidos.example.com`) setzen, damit das Vorschaubild
beim Teilen des Links absolute URLs bekommt.

## Was die App kann

- **Pedir** (`/`): Destacados, Kategorien mit Suche, Produktdialog mit Sabores (Limit je Produkt), Warenkorb,
  Checkout mit Delivery/Retiro, Sucursal, Zahlungsart, Ticket/Factura und Versand per WhatsApp.
- **Promociones** (`/promociones`): aktuelle Promos, Destacados und Buttons, um Promos oder Katalog per
  WhatsApp zu verschicken. „Jueves de Glacé“ wird donnerstags automatisch berechnet.
- **Cupones** (`/cupones`): Cupones de canje nach Bestellwert, einlösbar bei der nächsten Bestellung, plus
  „Repetir pedido“ für die letzten Bestellungen.
- **Calendario** (`/calendario`): Monatskalender mit farbigen Markierungen (Partidos de Paraguay, Fechas
  patrias, Días especiales, Feriados, Promos).
- **Catering** (`/catering`): Bild zum Teilen und Anfrageformular an 0971 620 630.
- **Sucursales** (`/sucursales`): alle Filialen mit Adresse, Telefon und Karte.
- **Instalar** (`/instalar`): Installationsanleitung je Gerät; die App funktioniert nach dem ersten Besuch
  auch bei schlechter Verbindung.
- **21 años**: Siegel im Header, im Hauptbanner und in den Bildern sowie Dankesnachricht beim Öffnen.

## Inhalte ändern

| Was | Datei |
|---|---|
| Name, „21 años“, WhatsApp-Nummern, Zahlungsarten | `src/lib/config.ts` |
| Produkte, Sabores, Preise, Öffnungszeiten | `npm run sync:catalog` → `src/data/catalog.json` |
| Promos und Tagespreise | `src/data/promotions.ts` |
| Cupón-Stufen und Gültigkeit | `src/data/coupons.ts` |
| Kalender (Spiele, Feiertage, besondere Tage) | `src/data/events.ts` |
| Sucursales | `src/data/branches.ts` |
| Farben | `src/app/globals.css` |
| Schriften | `src/fonts/` und `src/app/layout.tsx` |

## Marke

Farben, Logo, Siegelform („contenedor“) und Texturen stammen aus dem Markenhandbuch („manual glacé final“):
Verde `#00aa7d`, Rosado `#e6327d`, Castaño `#b4825a`, Marrón `#5a320a`. Das Logo wird nur grün oder weiß, ohne
Schatten und unverzerrt verwendet; auf Fotos kommt die Version mit Contenedor zum Einsatz.

- Für Text auf Grün bzw. Rosa werden die dunkleren Töne `#008060` und `#c2185f` benutzt, weil weißer Text auf
  den Originaltönen den Mindestkontrast (WCAG AA) nicht erreicht.
- Das Handbuch schreibt **Hornbill** und **Filson Pro** vor. Beide sind kommerzielle Schriften und liegen nicht
  bei. Bis die lizenzierten Dateien vorliegen, werden die freien Schriften Fraunces und Montserrat (SIL OFL,
  Lizenzen in `src/fonts/`) verwendet. Zum Umstellen die beiden `.woff2`-Dateien ersetzen.

## Technik

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, shadcn/ui (Base UI), zustand, Vitest.
Alle Seiten sind statisch; Uhrzeit-abhängige Teile (geöffnet/geschlossen, Tagespromo, Kalender) rechnen im
Browser in der Zeitzone `America/Asuncion`.

Bekannte Grenzen: Cupones und Bestellhistorie sind an das Gerät gebunden und werden nicht serverseitig geprüft
– das Lokal sieht den Cupón-Code in der WhatsApp-Nachricht. Ein Cupón entsteht, sobald die Bestellung an
WhatsApp übergeben wird; ob die Nachricht dort wirklich abgeschickt wurde, kann die App nicht wissen.
