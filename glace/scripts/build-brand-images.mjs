// Genera los íconos de la app, la imagen de catering y la vista previa para WhatsApp
// a partir de los vectores del manual de marca.
//
//   npm run build:brand
//
// Los textos se dibujan con Fraunces y Montserrat: tienen que estar instaladas en el
// sistema (por ejemplo en ~/.fonts) para que las imágenes salgan con la tipografía correcta.
import { readFile } from "node:fs/promises";
import sharp from "sharp";

const BRAND = { green: "#00aa7d", greenDeep: "#008060", pink: "#e6327d", pinkDeep: "#c2185f", marron: "#5a320a", cream: "#f6efe4" };
const YEARS = 21;
const CATERING_PHONE = "0971 620 630";
const clear = { r: 0, g: 0, b: 0, alpha: 0 };

const badge = await readFile("public/brand/logo-badge.svg");
const container = await readFile("public/brand/container.svg", "utf8");
const symbol = (await readFile("scripts/assets/symbol.svg", "utf8")).replace(/fill="#[0-9a-f]{6}"/gi, 'fill="#ffffff"');
const containerPath = /<path[^>]* d="([^"]+)"/.exec(container)[1];
const [, , containerW, containerH] = /viewBox="([^"]+)"/.exec(container)[1].split(" ").map(Number);

const render = (svg, size) =>
  sharp(Buffer.from(svg), { density: 600 }).resize(size, size, { fit: "contain", background: clear }).png().toBuffer();

const seal = (size) =>
  render(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${containerW} ${containerH}">
      <path fill="${BRAND.pink}" d="${containerPath}"/>
      <text x="${containerW / 2}" y="${containerH * 0.6}" text-anchor="middle" fill="#fff" font-family="Fraunces" font-weight="800" font-size="62">${YEARS}</text>
      <text x="${containerW / 2 + 3}" y="${containerH * 0.78}" text-anchor="middle" fill="#fff" font-family="Montserrat" font-weight="800" font-size="16" letter-spacing="6">AÑOS</text>
    </svg>`,
    size,
  );

/** Franja de ondas (public/brand/waves.svg) repetida a lo ancho. */
async function waveStrip(width, height) {
  const tile = await sharp("public/brand/waves.svg", { density: 300 }).resize({ height }).png().toBuffer();
  return sharp({ create: { width, height, channels: 4, background: clear } })
    .composite([{ input: tile, tile: true, gravity: "northwest" }])
    .png()
    .toBuffer();
}

const texture = (name, width, height) =>
  sharp(`public/img/texture-${name}.webp`).resize(width, height, { fit: "cover" }).png().toBuffer();

async function icons() {
  const centered = async (size, inner, svg, background, file) =>
    sharp({ create: { width: size, height: size, channels: 4, background } })
      .composite([{ input: await render(svg, Math.round(size * inner)), gravity: "center" }])
      .png()
      .toFile(file);
  await centered(192, 0.96, badge, clear, "public/icons/icon-192.png");
  await centered(512, 0.96, badge, clear, "public/icons/icon-512.png");
  await centered(512, 0.5, symbol, BRAND.green, "public/icons/icon-maskable-512.png");
  await centered(180, 0.58, symbol, BRAND.green, "src/app/apple-icon.png");
  await centered(96, 1, badge, clear, "src/app/icon.png");
}

const WHATSAPP_ICON =
  "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z";

async function cateringFlyer() {
  const W = 1080;
  const H = 1350;
  const base = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <rect width="${W}" height="${H}" fill="${BRAND.cream}"/>
    <text x="${W / 2}" y="640" text-anchor="middle" fill="${BRAND.greenDeep}" font-family="Montserrat" font-weight="800" font-size="40" letter-spacing="14">CATERING GLACÉ</text>
    <text x="${W / 2}" y="770" text-anchor="middle" fill="${BRAND.pink}" font-family="Fraunces" font-weight="800" font-size="118">Helado para</text>
    <text x="${W / 2}" y="890" text-anchor="middle" fill="${BRAND.pink}" font-family="Fraunces" font-weight="800" font-size="118">tu evento</text>
    <text x="${W / 2}" y="965" text-anchor="middle" fill="${BRAND.marron}" font-family="Montserrat" font-weight="600" font-size="36">Cumpleaños · Bodas · Empresas · Colegios</text>
    <rect x="110" y="1030" width="860" height="170" rx="85" fill="${BRAND.greenDeep}"/>
    <g transform="translate(170 1069) scale(3.85)" fill="#fff"><path d="${WHATSAPP_ICON}"/></g>
    <text x="300" y="1095" fill="#fff" font-family="Montserrat" font-weight="700" font-size="30" letter-spacing="5">CONSULTAS POR WHATSAPP</text>
    <text x="296" y="1172" fill="#fff" font-family="Montserrat" font-weight="900" font-size="78">${CATERING_PHONE}</text>
    <text x="${W / 2}" y="1268" text-anchor="middle" fill="${BRAND.marron}" font-family="Montserrat" font-weight="600" font-size="30">Contanos la fecha y la cantidad de invitados</text>
  </svg>`;
  await sharp(Buffer.from(base))
    .composite([
      { input: await texture("waves", W, 360), left: 0, top: 0 },
      { input: await render(badge, 400), left: (W - 400) / 2, top: 170 },
      { input: await seal(170), left: 800, top: 385 },
      { input: await waveStrip(W, 40), left: 0, top: H - 40 },
    ])
    .png({ compressionLevel: 9, palette: true, quality: 90 })
    .toFile("public/img/catering-glace.png");
}

async function socialPreview() {
  const W = 1200;
  const H = 630;
  const base = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <rect width="${W}" height="${H}" fill="${BRAND.cream}"/>
    <text x="520" y="215" fill="${BRAND.greenDeep}" font-family="Montserrat" font-weight="800" font-size="30" letter-spacing="9">HELADOS ARTESANALES</text>
    <text x="516" y="320" fill="${BRAND.pink}" font-family="Fraunces" font-weight="800" font-size="92">Pedí tu helado</text>
    <text x="516" y="420" fill="${BRAND.pink}" font-family="Fraunces" font-weight="800" font-size="92">online</text>
    <text x="520" y="490" fill="${BRAND.marron}" font-family="Montserrat" font-weight="600" font-size="32">Delivery y retiro · Pedidos por WhatsApp</text>
  </svg>`;
  await sharp(Buffer.from(base))
    .composite([
      { input: await render(badge, 380), left: 80, top: 100 },
      { input: await seal(150), left: 1010, top: 40 },
      { input: await waveStrip(W, 48), left: 0, top: H - 48 },
    ])
    .png({ compressionLevel: 9, palette: true, quality: 90 })
    .toFile("src/app/opengraph-image.png");
}

await icons();
await cateringFlyer();
await socialPreview();
console.log("Listo: íconos, public/img/catering-glace.png y src/app/opengraph-image.png");
