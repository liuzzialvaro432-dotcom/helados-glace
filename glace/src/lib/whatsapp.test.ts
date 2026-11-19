import { describe, expect, it } from "vitest";

import { createCoupon } from "@/lib/coupons";
import { lineKey, summarizeOrder, type CartLine } from "@/lib/pricing";
import type { LocalTime } from "@/lib/time";
import {
  buildCateringMessage,
  buildOrderMessage,
  shareUrl,
  whatsappUrl,
  type CheckoutDetails,
} from "@/lib/whatsapp";

const friday: LocalTime = { year: 2026, month: 11, day: 20, weekday: 5, hour: 15, minute: 0 };
const now = new Date("2026-11-20T18:00:00Z");
const selections = { 8514: [40193, 40194] };
const lines: CartLine[] = [
  { key: lineKey(52298, selections, "sin tapa"), productId: 52298, quantity: 1, selections, note: "sin tapa" },
  { key: lineKey(81370, {}, ""), productId: 81370, quantity: 1, selections: {}, note: "" },
];

const details: CheckoutDetails = {
  mode: "delivery",
  branchName: "Glace Suc - Sacramento",
  branchAddress: "Av. Sacramento 1525",
  name: " Ana Benítez ",
  phone: "0981 123 456",
  address: "Av. España 1234\nVilla Morra",
  reference: "Portón negro",
  payment: "efectivo",
  cashAmount: 200000,
  receipt: "ticket",
  invoiceName: "",
  invoiceRuc: "",
  orderNote: "Tocar timbre",
};

describe("whatsappUrl", () => {
  it("arma el enlace con el número sin símbolos y el texto codificado", () => {
    expect(whatsappUrl("+595 982-897584", "Hola & chau")).toBe("https://wa.me/595982897584?text=Hola%20%26%20chau");
  });

  it("comparte sin destinatario fijo", () => {
    expect(shareUrl("Mirá esto")).toBe("https://wa.me/?text=Mir%C3%A1%20esto");
  });
});

describe("buildOrderMessage", () => {
  it("incluye pedido, entrega, cliente y totales para delivery", () => {
    const message = buildOrderMessage(summarizeOrder(lines, friday), details);
    expect(message).toContain("*NUEVO PEDIDO*");
    expect(message).toContain("Delivery desde Glace Suc - Sacramento");
    expect(message).toContain("Hola, soy Ana Benítez, quiero hacer este pedido");
    expect(message).toContain("- 1x Helados 1kg · Gs. 69.000");
    expect(message).toContain("   + Amarena");
    expect(message).toContain("_Nota: sin tapa_");
    expect(message).toContain("_Notas del pedido: Tocar timbre_");
    expect(message).toContain("Av. España 1234 · Villa Morra");
    expect(message).toContain("Ref: Portón negro");
    expect(message).toContain("Comprobante: Ticket");
    expect(message).toContain("Pago: Efectivo (con Gs. 200.000)");
    expect(message).toContain("Envío: a confirmar");
    expect(message).toContain("*TOTAL: Gs. 154.000*");
  });

  it("para retiro muestra la sucursal y no pide envío", () => {
    const message = buildOrderMessage(summarizeOrder(lines, friday), {
      ...details,
      mode: "retiro",
      payment: "transferencia",
      receipt: "factura",
      invoiceName: "Ana SRL",
      invoiceRuc: "80012345-6",
    });
    expect(message).toContain("Retiro en Glace Suc - Sacramento");
    expect(message).toContain("Glace Suc - Sacramento — Av. Sacramento 1525");
    expect(message).toContain("Factura: Ana SRL / 80012345-6");
    expect(message).toContain("Pago: Transferencia bancaria");
    expect(message).toContain("Entrega: Retiro en el local");
    expect(message).not.toContain("Envío");
    expect(message).not.toContain("Villa Morra");
  });

  it("detalla el cupón canjeado", () => {
    const coupon = createCoupon({ id: "t", name: "T", minOrder: 0, value: 10000, redeemMin: 60000 }, now, "GLACE-TEST22");
    const message = buildOrderMessage(summarizeOrder(lines, friday, coupon, now), details);
    expect(message).toContain("Cupón GLACE-TEST22: -Gs. 10.000");
    expect(message).toContain("*TOTAL: Gs. 144.000*");
  });
});

describe("buildCateringMessage", () => {
  it("incluye solo los datos completados", () => {
    const message = buildCateringMessage({
      name: "Ana",
      eventType: "Boda",
      date: "",
      guests: "120",
      place: " ",
      comments: "",
    });
    expect(message).toContain("Hola, soy Ana y quiero consultar por el catering");
    expect(message).toContain("Evento: Boda");
    expect(message).toContain("Invitados: 120");
    expect(message).not.toContain("Fecha");
    expect(message).not.toContain("Lugar");
  });

  it("funciona sin ningún dato", () => {
    expect(buildCateringMessage({ name: "", eventType: "", date: "", guests: "", place: "", comments: "" })).toBe(
      "🍦 *CONSULTA DE CATERING*\nHola, quiero consultar por el catering de Helados Glacé.",
    );
  });
});
