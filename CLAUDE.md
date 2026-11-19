# CLAUDE.md — Helados Glacé

Diese Datei gibt Claude den Einstieg in **dieses Repository**. Lies sie zuerst.

## Repository

| | |
|---|---|
| **GitHub** | `https://github.com/liuzzialvaro432-dotcom/helados-glace` |
| **Branch** | `main` |
| **Hauptprojekt** | Ordner **`glace/`** (Next.js 16, PWA, WhatsApp-Bestellungen) |
| **Nebenprojekt** | Root `src/` = Chrome-Extension „Modellkatalog“ — nur anfassen, wenn ausdrücklich gewünscht |

## Produkt (Kurz)

Web-Shop und installierbare PWA für **Helados Glacé** (Paraguay), angelehnt an Fiweex/PedidosYa:

- Katalog, Sabores, Warenkorb, Checkout → formatierte **WhatsApp**-Nachricht (kein Backend, kein DB)
- Seiten: Promociones, Cupones, Calendario, Catering (`0971 620 630`), Sucursales, PWA-Install
- UI-Sprache: **Spanisch (Paraguay)**; „Sucursales“ statt Franquicias; „Catering“ statt Eventos; **21 años**-Branding
- Zeitzone: `America/Asuncion`

Ausführlich: [README.md](README.md) · Technik: [glace/README.md](glace/README.md)

## Marke

Offizielles Handbuch (PDF): [docs/brand/manual-glace-final.pdf](docs/brand/manual-glace-final.pdf)

Farben: Verde `#00aa7d`, Rosado `#e6327d`, Castaño `#b4825a`, Marrón `#5a320a`.  
Schriften im Code: Fraunces + Montserrat als Ersatz für Hornbill / Filson Pro.

Vektoren und Texturen: `glace/public/brand/`, `glace/src/components/brand.tsx`

## Wichtige Pfade (`glace/`)

| Thema | Pfad |
|---|---|
| Geschäftsdaten, WhatsApp, Navigation | `glace/src/lib/config.ts` |
| Katalog (JSON, nach Fiweex-Sync) | `glace/src/data/catalog.json` |
| Promos, Cupones, Kalender, Filialen | `glace/src/data/*.ts` |
| Warenkorb / Zustand | `glace/src/lib/store.ts` |
| WhatsApp-Nachricht | `glace/src/lib/whatsapp.ts` |
| Tests | `glace/src/**/*.test.ts`, `glace/vitest` via `npm test` |

## Befehle (immer in `glace/`)

```bash
cd glace
npm install
npm run dev          # Port 4387
npm run build && npm start
npm test
npm run lint
npm run typecheck
npm run sync:catalog   # Fiweex-Katalog neu laden
npm run build:brand    # Icons & Markenbilder
```

## Konventionen für Änderungen

1. **Scope klein halten** — nur Glacé-App, wenn nicht anders verlangt.
2. **Bestehende Muster** in `glace/src` übernehmen (Tailwind 4, shadcn/Base UI, Zustand).
3. Kein Auth, keine Datenbank, keine neuen Backend-Services.
4. Markenhandbuch respektieren (Logo unverzerrt, erlaubte Farben).
5. Nach sinnvollen Änderungen: `npm test`, `npm run lint`, `npm run build` in `glace/`.

## Context für Claude (Web)

Wenn du dieses Repo in **claude.ai** als Projekt-Wissen einbindest, empfohlene Ordner:

- `glace/` (gesamter App-Code)
- `docs/brand/manual-glace-final.pdf`
- `README.md`, `glace/README.md`, diese `CLAUDE.md`

Repo-URL zum Einfügen:  
`https://github.com/liuzzialvaro432-dotcom/helados-glace`

Schritt-für-Schritt (GitHub App, privates Repo): [docs/claude-einrichtung.md](docs/claude-einrichtung.md)