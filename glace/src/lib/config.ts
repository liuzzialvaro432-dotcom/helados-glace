export const BUSINESS = {
  name: "Helados Glacé",
  shortName: "Glacé",
  tagline: "Helados artesanales desde 2004",
  foundedYear: 2004,
  anniversaryYears: 21,
  timeZone: "America/Asuncion",
  currency: "Gs.",
  deliveryFeeNote: "Costo de envío a confirmar por el local",
} as const;

export const CONTACT = {
  orders: { whatsapp: "595982897584", display: "0982 897 584" },
  catering: { whatsapp: "595971620630", display: "0971 620 630" },
} as const;

export const PAYMENT_METHODS = [
  { id: "efectivo", label: "Efectivo" },
  { id: "debito", label: "T. Débito" },
  { id: "credito", label: "T. Crédito" },
  { id: "transferencia", label: "Transferencia bancaria" },
] as const;

export type PaymentMethodId = (typeof PAYMENT_METHODS)[number]["id"];

export const NAV_LINKS = [
  { href: "/", label: "Pedir" },
  { href: "/promociones", label: "Promociones" },
  { href: "/cupones", label: "Cupones" },
  { href: "/calendario", label: "Calendario" },
  { href: "/catering", label: "Catering" },
  { href: "/sucursales", label: "Sucursales" },
] as const;
