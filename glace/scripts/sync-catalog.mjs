#!/usr/bin/env node
// Sincroniza el catálogo público de Fiweex (productos, precios, sabores e imágenes)
// hacia src/data/catalog.json y public/img. Uso: npm run sync:catalog

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_URL = "https://fiweex.com/delivery/glace";
const DETAIL_URL = "https://fiweex.com/fx_catalogo_delivery_detalle";
const UA = "Mozilla/5.0 (GlaceCatalogSync)";
const FEATURED_SECTION = "sec-destacados";
const EMPTY_DESCRIPTION = "El producto no cuenta con descripción";

const NUMBER_WORDS = { un: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6 };
const LOWERCASE_WORDS = new Set(["de", "del", "la", "las", "el", "los", "y", "con", "sin", "al", "a", "en", "x"]);

function decodeEntities(text) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));
}

function clean(text) {
  return decodeEntities(
    String(text ?? "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, ""),
  )
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// Los nombres cargados en mayúsculas sostenidas se pasan a formato título para leerlos mejor.
function prettify(name) {
  const text = clean(name).replace(/\s+/g, " ");
  const letters = text.replace(/[^\p{L}]/gu, "");
  if (!letters || letters !== letters.toUpperCase()) return text;
  return text
    .toLowerCase()
    .split(" ")
    .map((word, index) => {
      if (/^\d+(gr|g|kg|ml|l)$/.test(word)) return word.replace(/(\d+)/, "$1 ");
      if (index > 0 && LOWERCASE_WORDS.has(word)) return word;
      return word.replace(/\p{L}/u, (letter) => letter.toUpperCase());
    })
    .join(" ");
}

function maxFromDescription(description) {
  const match = /hasta\s+(\d+|[a-záéíóú]+)\s+sabor/i.exec(description);
  if (!match) return null;
  const raw = match[1].toLowerCase();
  return /^\d+$/.test(raw) ? Number(raw) : (NUMBER_WORDS[raw] ?? null);
}

async function fetchText(url) {
  const response = await fetch(url, { headers: { "User-Agent": UA } });
  if (!response.ok) throw new Error(`${url} respondió ${response.status}`);
  return response.text();
}

async function fetchDetail(id, userId, country) {
  const form = new FormData();
  form.append("id", String(id));
  form.append("valor_pais", String(country));
  form.append("solo_visibles", "1");
  form.append("iduser", String(userId));
  const response = await fetch(DETAIL_URL, {
    method: "POST",
    body: form,
    headers: { "User-Agent": UA, Referer: SOURCE_URL },
  });
  if (!response.ok) throw new Error(`Detalle ${id} respondió ${response.status}`);
  return response.json();
}

async function saveImage(url, file, { width, height }) {
  const response = await fetch(url, { headers: { "User-Agent": UA } });
  if (!response.ok) throw new Error(`${url} respondió ${response.status}`);
  const input = Buffer.from(await response.arrayBuffer());
  await mkdir(path.dirname(file), { recursive: true });
  await sharp(input)
    .rotate()
    .resize({ width, height, fit: height ? "cover" : "inside", withoutEnlargement: true })
    .webp({ quality: 78 })
    .toFile(file);
}

function parseJsonVar(html, name) {
  const match = new RegExp(`window\\.${name}\\s*=\\s*([^;\\n]+);`).exec(html);
  if (!match) throw new Error(`No se encontró ${name} en la página`);
  return JSON.parse(match[1]);
}

function parseSections(html) {
  const starts = [...html.matchAll(/<div class="fx-section" id="([^"]+)"/g)].map((m) => ({
    id: m[1],
    index: m.index,
  }));
  return starts.map((start, i) => {
    const chunk = html.slice(start.index, starts[i + 1]?.index ?? html.length);
    const title = /class="fx-section-title"[^>]*>([\s\S]*?)<\/span>/.exec(chunk)?.[1] ?? "";
    const avatar = /<img class="fx-section-avatar" src="([^"]+)"/.exec(chunk)?.[1] ?? null;
    const cards = [];
    const cardPattern = /<div class="(?:fx-carousel-card|cat-row|fx-card)"[^>]*data-id="(\d+)"([^>]*)>/g;
    for (const card of chunk.matchAll(cardPattern)) {
      const attrs = card[2];
      const body = chunk.slice(card.index, card.index + 3000);
      const image = /<img[^>]*src="([^"]*img_catalogo_producto[^"]*)"/.exec(body)?.[1] ?? null;
      cards.push({
        id: Number(card[1]),
        price: Math.round(Number(/data-price="([\d.]+)"/.exec(attrs)?.[1] ?? 0)),
        previousPrice: Math.round(Number(/data-price-anterior="([\d.]+)"/.exec(attrs)?.[1] ?? 0)),
        categoryId: Number(/data-cat-id="(\d+)"/.exec(attrs)?.[1] ?? 0),
        image,
      });
    }
    return { id: start.id, title: clean(title), avatar, cards };
  });
}

function parseGroups(detail, description) {
  let groups = [];
  try {
    groups = JSON.parse(detail.agregados_detalle || "[]") ?? [];
  } catch {
    groups = [];
  }
  return groups
    .filter((group) => Array.isArray(group.items) && group.items.length > 0)
    .map((group) => {
      const single = Number(group.idtipo) === 2;
      return {
        id: Number(group.id_grupo),
        kind: single ? "single" : "multi",
        max: single ? 1 : (Number(group.max_seleccion) || maxFromDescription(description)),
        items: group.items.map((item) => ({
          id: Number(item.id),
          name: clean(item.descripcion),
          price: Math.round(Number(item.precio) || 0),
        })),
      };
    });
}

async function main() {
  console.log(`Leyendo ${SOURCE_URL}`);
  const html = await fetchText(SOURCE_URL);
  const userId = Number(/window\.FX_ID_USER\s*=\s*(\d+)/.exec(html)?.[1]);
  const country = Number(/window\.FX_VALOR_PAIS\s*=\s*(\d+)/.exec(html)?.[1]);
  if (!userId || !country) throw new Error("No se pudo leer la configuración del catálogo");

  const form = parseJsonVar(html, "FX_FORM");
  const schedule = parseJsonVar(html, "FX_HORARIO");
  const sections = parseSections(html);
  const featuredIds = sections.find((s) => s.id === FEATURED_SECTION)?.cards.map((c) => c.id) ?? [];

  const cardsById = new Map();
  for (const section of sections) {
    for (const card of section.cards) {
      if (!cardsById.has(card.id)) cardsById.set(card.id, card);
    }
  }

  const categories = [];
  for (const section of sections) {
    if (section.id === FEATURED_SECTION) continue;
    const id = Number(/-(\d+)$/.exec(section.id)?.[1]);
    if (!id) continue;
    let image = null;
    if (section.avatar) {
      image = `/img/categories/${id}.webp`;
      await saveImage(section.avatar, path.join(ROOT, "public", image), { width: 240, height: 240 });
    }
    categories.push({
      id,
      name: prettify(section.title.replace(/[^\p{L}\p{N}\s/.,()-]/gu, "")),
      image,
      productIds: section.cards.map((c) => c.id),
    });
  }

  const products = [];
  for (const card of cardsById.values()) {
    const detail = await fetchDetail(card.id, userId, country);
    const rawDescription = clean(detail.descripcion);
    const description = rawDescription === EMPTY_DESCRIPTION ? "" : rawDescription;
    let image = null;
    if (card.image) {
      const full = card.image.replace("/thumbnail/", "/");
      image = `/img/products/${card.id}.webp`;
      const target = path.join(ROOT, "public", image);
      try {
        await saveImage(full, target, { width: 720 });
      } catch {
        await saveImage(card.image, target, { width: 720 });
      }
      await saveImage(card.image, target.replace(/\.webp$/, "-sm.webp"), { width: 360 });
    }
    products.push({
      id: card.id,
      name: prettify(detail.nombre_producto),
      description,
      price: card.price,
      previousPrice: card.previousPrice > card.price ? card.previousPrice : null,
      categoryId: card.categoryId,
      image,
      featured: featuredIds.includes(card.id),
      optionGroups: parseGroups(detail, description),
    });
    process.stdout.write(".");
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  process.stdout.write("\n");

  const heroPath = /catalogo_hero\/big\/[a-f0-9]+\.\w+/.exec(html)?.[0];
  if (heroPath) {
    await saveImage(`https://www.fiweex.com/sistema/img/${heroPath}`, path.join(ROOT, "public/img/hero.webp"), {
      width: 1600,
    });
  }

  const catalog = {
    source: SOURCE_URL,
    syncedAt: new Date().toISOString(),
    orderBranches: (form.locales ?? []).map((branch) => ({ id: Number(branch.id), name: clean(branch.nombre) })),
    weeklyHours: schedule.turnos.map((shifts) => shifts.map(([open, close]) => ({ open, close }))),
    featuredIds,
    categories,
    products,
  };

  const output = path.join(ROOT, "src/data/catalog.json");
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(catalog, null, 2)}\n`);
  console.log(`Listo: ${products.length} productos en ${categories.length} categorías → ${path.relative(ROOT, output)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
