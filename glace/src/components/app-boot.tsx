"use client";

import { useEffect } from "react";

import { getProduct } from "@/data/catalog";
import { listenForInstallPrompt } from "@/lib/install";
import { hydrateStores, useUi } from "@/lib/store";

/** Arranque del lado del cliente: restaura el pedido guardado, registra el service worker y abre enlaces a productos. */
export function AppBoot() {
  useEffect(() => {
    void hydrateStores();
    listenForInstallPrompt();

    const productId = Number(new URLSearchParams(window.location.search).get("producto"));
    if (productId && getProduct(productId)) useUi.getState().openProduct(productId);

    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {
        // Sin service worker la app funciona igual, solo que sin modo offline.
      });
    }
  }, []);

  return null;
}
