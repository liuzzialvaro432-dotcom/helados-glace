import { getProduct } from "@/data/catalog";
import { CONTACT } from "@/lib/config";
import { formatPrice } from "@/lib/format";
import type { LocalTime } from "@/lib/time";

/** Precio especial de un producto en un día fijo de la semana (0 = domingo). */
export type PricePromo = {
  id: string;
  name: string;
  productId: number;
  weekday: number;
  price: number;
};

export const PRICE_PROMOS: PricePromo[] = [
  { id: "jueves-de-glace", name: "Jueves de Glacé", productId: 52298, weekday: 4, price: 55000 },
];

export function activePricePromo(productId: number, local: LocalTime | null): PricePromo | undefined {
  if (!local) return undefined;
  return PRICE_PROMOS.find((promo) => promo.productId === productId && promo.weekday === local.weekday);
}

export type Promotion = {
  id: string;
  badge: string;
  title: string;
  description: string;
  detail: string;
  tone: "green" | "pink" | "castano" | "marron";
  image: string | null;
  action: { label: string; productId: number } | { label: string; href: string };
};

const thursday = PRICE_PROMOS[0];
const thursdayListPrice = getProduct(thursday.productId)?.price ?? thursday.price;

export const PROMOTIONS: Promotion[] = [
  {
    id: thursday.id,
    badge: "Todos los jueves",
    title: thursday.name,
    description: `1 kg de helado, hasta 4 sabores, por ${formatPrice(thursday.price)}.`,
    detail: `Cada jueves el kilo de helado clásico y premium baja de ${formatPrice(thursdayListPrice)} a ${formatPrice(thursday.price)}. El precio se aplica solo al armar tu pedido ese día.`,
    tone: "green",
    image: "/img/products/52298.webp",
    action: { label: "Pedir mi kilo", productId: thursday.productId },
  },
  {
    id: "cupones",
    badge: "Nuevo",
    title: "Cupones de canje",
    description: "Cada pedido suma un cupón de descuento para el próximo.",
    detail: "Según el monto de tu compra ganás un cupón para usar en tu siguiente pedido desde la app.",
    tone: "castano",
    image: null,
    action: { label: "Ver mis cupones", href: "/cupones" },
  },
  {
    id: "la-recomendada",
    badge: "No te podés perder",
    title: "La recomendada",
    description: "Torta de helado de dulce de leche, chantilly y trozos de brownie de chocolate.",
    detail: "Una de las más pedidas de la casa: dulce de leche, chantilly y brownie de chocolate.",
    tone: "marron",
    image: "/img/products/81370.webp",
    action: { label: "Pedir la torta", productId: 81370 },
  },
  {
    id: "catering",
    badge: "Eventos",
    title: "Catering Glacé",
    description: "Llevamos el helado a tu cumpleaños, boda o evento de empresa.",
    detail: `Contanos la fecha y la cantidad de invitados y te armamos una propuesta. Consultas al ${CONTACT.catering.display}.`,
    tone: "pink",
    image: null,
    action: { label: "Consultar catering", href: "/catering" },
  },
];
