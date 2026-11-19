// Service worker de Helados Glacé: deja la app instalable y usable con mala señal.
// Al cambiar la lista de páginas o la estrategia, subí VERSION para renovar las cachés.
const VERSION = "v1";
const PAGE_CACHE = `glace-pages-${VERSION}`;
const STATIC_CACHE = `glace-static-${VERSION}`;
const IMAGE_CACHE = `glace-images-${VERSION}`;
const CACHES = [PAGE_CACHE, STATIC_CACHE, IMAGE_CACHE];

const OFFLINE_URL = "/offline";
const PAGES = ["/", "/promociones", "/cupones", "/calendario", "/catering", "/sucursales", "/instalar", OFFLINE_URL];
const BRAND_IMAGES = ["/img/hero.webp", "/brand/logo-badge.svg", "/brand/container.svg", "/brand/waves.svg"];
const MAX_IMAGES = 150;

/** Guarda cada página y los archivos de /_next/static que su HTML referencia. */
async function precache() {
  const pages = await caches.open(PAGE_CACHE);
  const assets = new Set();
  await Promise.all(
    PAGES.map(async (url) => {
      try {
        const response = await fetch(url, { cache: "reload", credentials: "same-origin" });
        if (!response.ok) return;
        const html = await response.clone().text();
        for (const match of html.matchAll(/\/_next\/static\/[^"'\\\s)<>]+/g)) assets.add(match[0]);
        await pages.put(url, response);
      } catch {
        // Sin red durante la instalación: la página se guarda la próxima vez que se visite.
      }
    }),
  );
  const store = async (cacheName, urls) => {
    const cache = await caches.open(cacheName);
    await Promise.all(
      urls.map(async (url) => {
        try {
          if (await cache.match(url)) return;
          const response = await fetch(url);
          if (response.ok) await cache.put(url, response);
        } catch {
          // Se guarda cuando el navegador lo pida.
        }
      }),
    );
  };
  await Promise.all([store(STATIC_CACHE, [...assets]), store(IMAGE_CACHE, BRAND_IMAGES)]);
}

self.addEventListener("install", (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names.filter((name) => name.startsWith("glace-") && !CACHES.includes(name)).map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  await Promise.all(keys.slice(0, Math.max(0, keys.length - max)).map((key) => cache.delete(key)));
}

async function navigate(request) {
  const cache = await caches.open(PAGE_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok && response.type === "basic") {
      const url = new URL(request.url);
      // Sin la query: el contenido de cada página no depende de ella (los datos del cliente viven en el dispositivo).
      await cache.put(url.pathname, response.clone());
    }
    return response;
  } catch {
    const url = new URL(request.url);
    return (
      (await cache.match(url.pathname)) ||
      (await cache.match(OFFLINE_URL)) ||
      new Response("Sin conexión", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } })
    );
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) await cache.put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cached = await cache.match(request);
  const refresh = fetch(request)
    .then(async (response) => {
      if (response.ok) {
        await cache.put(request, response.clone());
        await trim(IMAGE_CACHE, MAX_IMAGES);
      }
      return response;
    })
    .catch(() => undefined);
  return cached || (await refresh) || Response.error();
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(navigate(request));
    return;
  }
  // Las respuestas RSC de Next dependen del estado del router: van siempre a la red.
  if (request.headers.has("RSC") || request.headers.has("Next-Router-State-Tree") || url.searchParams.has("_rsc")) return;

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request));
    return;
  }
  if (/^\/(img|brand|icons)\//.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});
