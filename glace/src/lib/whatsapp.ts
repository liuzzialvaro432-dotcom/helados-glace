import { BUSINESS, PAYMENT_METHODS, type PaymentMethodId } from "@/lib/config";
import { formatPrice } from "@/lib/format";
import type { OrderSummary } from "@/lib/pricing";

export type DeliveryMode = "delivery" | "retiro";

export type CheckoutDetails = {
  mode: DeliveryMode;
  /** Nombre de la sucursal tal como figura en el catálogo del local. */
  branchName: string;
  branchAddress: string;
  name: string;
  phone: string;
  address: string;
  reference: string;
  payment: PaymentMethodId;
  /** Monto con el que paga en efectivo, para calcular el vuelto. */
  cashAmount: number | null;
  receipt: "ticket" | "factura";
  invoiceName: string;
  invoiceRuc: string;
  orderNote: string;
};

const SEPARATOR = "━━━━━━━━━━━━━━━━━━";

function oneLine(text: string): string {
  return text.replace(/\s*\n+\s*/g, " · ").trim();
}

export function whatsappUrl(phone: string, text: string): string {
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}

export function shareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function buildOrderMessage(summary: OrderSummary, details: CheckoutDetails): string {
  const blocks: string[][] = [];
  const name = details.name.trim();
  const pickup = details.mode === "retiro";

  blocks.push([
    "🧾 *NUEVO PEDIDO*",
    `${BUSINESS.name} · ${pickup ? `Retiro en ${details.branchName}` : `Delivery desde ${details.branchName}`}`,
    name ? `Hola, soy ${name}, quiero hacer este pedido 👋` : "Hola, quiero hacer este pedido 👋",
  ]);

  const order = ["*🛒 Pedido*"];
  for (const item of summary.lines) {
    order.push(`- ${item.line.quantity}x ${item.product.name} · ${formatPrice(item.total)}`);
    if (item.promo) order.push(`   _Promo ${item.promo.name}_`);
    for (const option of item.optionNames) order.push(`   + ${option}`);
    if (item.line.note.trim()) order.push(`   _Nota: ${oneLine(item.line.note)}_`);
  }
  if (details.orderNote.trim()) order.push("", `_Notas del pedido: ${oneLine(details.orderNote)}_`);
  blocks.push(order);

  if (pickup) {
    blocks.push([
      "*📍 Retiro*",
      details.branchAddress ? `${details.branchName} — ${details.branchAddress}` : details.branchName,
    ]);
  } else {
    const delivery = ["*📍 Entrega*", oneLine(details.address)];
    if (details.reference.trim()) delivery.push(`Ref: ${oneLine(details.reference)}`);
    blocks.push(delivery);
  }

  const customer = ["*👤 Cliente*", [name, details.phone.trim()].filter(Boolean).join(" · ")].filter(Boolean);
  customer.push(
    details.receipt === "factura"
      ? `Factura: ${details.invoiceName.trim()} / ${details.invoiceRuc.trim()}`
      : "Comprobante: Ticket",
  );
  const payment = PAYMENT_METHODS.find((method) => method.id === details.payment);
  if (payment) {
    const cash =
      details.payment === "efectivo" && details.cashAmount ? ` (con ${formatPrice(details.cashAmount)})` : "";
    customer.push(`Pago: ${payment.label}${cash}`);
  }
  blocks.push(customer);

  const totals = [`Productos: ${formatPrice(summary.subtotal)}`];
  if (summary.coupon && summary.discount > 0) {
    totals.push(`Cupón ${summary.coupon.code}: -${formatPrice(summary.discount)}`);
  }
  totals.push(pickup ? "Entrega: Retiro en el local" : "Envío: a confirmar");
  totals.push(`*TOTAL: ${formatPrice(summary.total)}*`);
  if (!pickup) totals.push("_El envío no está incluido en el total_");
  blocks.push(totals);

  return blocks.map((block) => block.join("\n")).join(`\n${SEPARATOR}\n`);
}

export type CateringRequest = {
  name: string;
  eventType: string;
  date: string;
  guests: string;
  place: string;
  comments: string;
};

export function buildCateringMessage(request: CateringRequest): string {
  const lines = [
    "🍦 *CONSULTA DE CATERING*",
    request.name.trim()
      ? `Hola, soy ${request.name.trim()} y quiero consultar por el catering de ${BUSINESS.name}.`
      : `Hola, quiero consultar por el catering de ${BUSINESS.name}.`,
  ];
  const details: [string, string][] = [
    ["Evento", request.eventType],
    ["Fecha", request.date],
    ["Invitados", request.guests],
    ["Lugar", request.place],
    ["Comentarios", request.comments],
  ];
  const filled = details.filter(([, value]) => value.trim());
  if (filled.length) {
    lines.push(SEPARATOR);
    for (const [label, value] of filled) lines.push(`${label}: ${oneLine(value)}`);
  }
  return lines.join("\n");
}
