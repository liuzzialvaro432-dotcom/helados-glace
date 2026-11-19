import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite abrir el servidor de desarrollo también por IP (por ejemplo desde un teléfono en la misma red).
  allowedDevOrigins: ["127.0.0.1"],
  poweredByHeader: false,
  cacheComponents: true,
  partialPrefetching: true,
  // Las fotos del catálogo ya se guardan en WebP a medida (scripts/sync-catalog.mjs).
  images: { unoptimized: true },
  turbopack: {
    // La app vive en una subcarpeta de un repositorio que tiene otro package-lock.json en la raíz.
    root: path.join(__dirname),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'" },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
