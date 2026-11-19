import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import { AppBoot } from "@/components/app-boot";
import { CartBar } from "@/components/cart/cart-bar";
import { CartSheet } from "@/components/cart/cart-sheet";
import { BottomNav } from "@/components/layout/bottom-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ProductDialog } from "@/components/product/product-dialog";
import { Toaster } from "@/components/ui/sonner";
import { WelcomeDialog } from "@/components/welcome-dialog";
import { BUSINESS } from "@/lib/config";

import "./globals.css";

/*
 * El manual de marca define Hornbill (títulos) y Filson Pro (textos), ambas de
 * licencia comercial. Hasta contar con esos archivos se usan Fraunces y
 * Montserrat, sus equivalentes libres más cercanos. Para pasar a las
 * originales alcanza con reemplazar los dos archivos de src/fonts.
 */
const display = localFont({
  src: "../fonts/Fraunces.woff2",
  variable: "--font-display",
  weight: "100 900",
  display: "swap",
});

const body = localFont({
  src: "../fonts/Montserrat.woff2",
  variable: "--font-body",
  weight: "100 900",
  display: "swap",
});

const description =
  "Pedí helados artesanales, tortas heladas y postres de Helados Glacé. Elegí tus sabores, tu sucursal y enviá tu pedido por WhatsApp.";

export const metadata: Metadata = {
  metadataBase: process.env.SITE_URL ? new URL(process.env.SITE_URL) : undefined,
  title: { default: `${BUSINESS.name} · Pedidos online`, template: `%s · ${BUSINESS.name}` },
  description,
  applicationName: BUSINESS.name,
  appleWebApp: { capable: true, title: BUSINESS.shortName, statusBarStyle: "default" },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    locale: "es_PY",
    siteName: BUSINESS.name,
    title: `${BUSINESS.name} · Pedidos online`,
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#00aa7d",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-PY" className={`${display.variable} ${body.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#contenido"
          className="sr-only z-50 rounded-full bg-primary px-4 py-2 font-semibold text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Ir al contenido
        </a>
        <SiteHeader />
        <main id="contenido" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <CartBar />
        <BottomNav />
        <CartSheet />
        <ProductDialog />
        <WelcomeDialog />
        <AppBoot />
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
