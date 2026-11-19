<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/github/banner.svg">
  <img alt="Helados Glacé — pedidos por WhatsApp" src="docs/github/banner.svg" width="100%">
</picture>

<h1 align="center">Helados Glacé</h1>

<p align="center">
  <strong>Helados artesanales desde 2004 · 21 años</strong><br>
  Tienda web y app instalable (PWA) para pedir delivery, retiro en sucursal, promos, cupones y catering — todo sale por WhatsApp, sin backend.
</p>

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white">
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
  <img alt="PWA" src="https://img.shields.io/badge/PWA-instalable-00AA7D?style=for-the-badge">
  <img alt="WhatsApp" src="https://img.shields.io/badge/Pedidos-WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white">
  <img alt="Tests" src="https://img.shields.io/badge/tests-Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white">
</p>

<p align="center">
  <a href="glace/README.md"><strong>Documentación técnica</strong></a> ·
  <a href="CLAUDE.md"><strong>CLAUDE.md</strong></a> ·
  <a href="docs/claude-einrichtung.md">Claude einbinden (DE)</a> ·
  <a href="https://fiweex.com/delivery/glace">Catálogo original (Fiweex)</a>
</p>

---

## Vista previa

<table>
  <tr>
    <td width="34%" align="center">
      <img src="docs/github/home-mobile.png" alt="Inicio — catálogo móvil" width="280"><br>
      <sub><b>Pedir</b> · catálogo, sabores y carrito</sub>
    </td>
    <td width="34%" align="center">
      <img src="docs/github/promociones-mobile.png" alt="Promociones" width="280"><br>
      <sub><b>Promociones</b> · destacados y Jueves de Glacé</sub>
    </td>
    <td width="34%" align="center">
      <img src="docs/github/catering-mobile.png" alt="Catering" width="280"><br>
      <sub><b>Catering</b> · consulta directa por WhatsApp</sub>
    </td>
  </tr>
</table>

<p align="center">
  <img src="docs/github/home-desktop.png" alt="Vista escritorio del catálogo" width="92%">
</p>

<p align="center">
  <img src="docs/github/calendario-mobile.png" alt="Calendario mensual" width="280">
  &nbsp;&nbsp;
  <img src="docs/github/social-preview.png" alt="Vista para compartir enlaces" width="280">
</p>

---

## Qué incluye

| Módulo | Ruta | Para el cliente |
| --- | --- | --- |
| **Pedir** | `/` | Catálogo Fiweex-style, búsqueda, sabores, carrito y checkout |
| **Promociones** | `/promociones` | Ofertas, destacados y compartir por WhatsApp |
| **Cupones** | `/cupones` | Canje según monto de compra + repetir pedido |
| **Calendario** | `/calendario` | Partidos, feriados, Día del Niño, promos del mes |
| **Catering** | `/catering` | Consultas a **0971 620 630** |
| **Sucursales** | `/sucursales` | Filiales con mapa y horarios |
| **Instalar** | `/instalar` | Guía PWA (iOS, Android, escritorio) |

<details>
<summary><strong>Flujo de pedido (resumen)</strong></summary>

```mermaid
flowchart LR
  A[Cliente abre la web] --> B[Elige productos y sabores]
  B --> C[Carrito y datos de entrega]
  C --> D[Mensaje formateado]
  D --> E[WhatsApp del local]
  E --> F[Confirmación humana]
```

</details>

---

## Marca

Paleta oficial del manual Glacé:

| Color | Hex | Uso |
| --- | --- | --- |
| Verde Glacé | `#00aa7d` | Principal, confianza |
| Rosado | `#e6327d` | Acentos y celebración |
| Castaño | `#b4825a` | Texturas y calidez |
| Marrón | `#5a320a` | Texto y contraste |

Logo vectorial, texturas y badge **21 años** integrados en la UI. Texto accesible en UI: español (Paraguay).

📘 **Manual de marca (PDF, 38 páginas):** [`docs/brand/manual-glace-final.pdf`](docs/brand/manual-glace-final.pdf) — colores, logo, contenedor, texturas y tipografía oficiales (*manual glacé final*).

---

## Arranque rápido

```bash
cd glace
npm install
npm run dev    # http://localhost:4387
```

| Comando | Qué hace |
| --- | --- |
| `npm run build` / `npm start` | Producción (+ service worker offline) |
| `npm test` | 55+ pruebas: precios, cupones, horarios, calendario |
| `npm run sync:catalog` | Sincronizar productos desde Fiweex |
| `npm run build:brand` | Iconos PWA y imágenes de marca |

WhatsApp de pedidos (por defecto): **0982 897 584** · Configuración en `glace/src/lib/config.ts`.

---

## Estructura del repositorio

```
helados-glace/
├── glace/                 # App de pedidos (Next.js + PWA) ← proyecto principal
│   ├── src/app/           # Rutas y páginas
│   ├── src/components/    # UI, marca, carrito, catálogo
│   ├── src/data/          # Catálogo, promos, eventos, sucursales
│   └── public/            # Imágenes, íconos, service worker
├── docs/brand/            # Manual de marca (PDF oficial)
├── docs/github/           # Banner, capturas y vista social para GitHub
├── src/                   # Extensión Chrome «Modellkatalog» (proyecto aparte)
└── Modellkatalog.pdf
```

---

## También en este repo

<details>
<summary><strong>Modellkatalog</strong> — extensión Chrome MV3 (catálogo de modelos)</summary>

Proyecto independiente en la raíz. Ver sección anterior en commits o `npm run build` en la raíz para la extensión.

```bash
npm install
npm test
npm run build   # carpeta dist/ para chrome://extensions
```

</details>

---

<p align="center">
  <sub>Proyecto privado · Helados Glacé · Paraguay</sub>
</p>