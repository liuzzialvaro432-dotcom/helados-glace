import type { MetadataRoute } from "next";

import { BUSINESS } from "@/lib/config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: BUSINESS.name,
    short_name: BUSINESS.shortName,
    description: "Pedí helados artesanales, tortas heladas y postres. Delivery y retiro, con pedido por WhatsApp.",
    lang: "es-PY",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fbf7f0",
    theme_color: "#00aa7d",
    categories: ["food", "shopping"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Promociones", url: "/promociones" },
      { name: "Mis cupones", url: "/cupones" },
      { name: "Sucursales", url: "/sucursales" },
    ],
  };
}
