"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { cn } from "cn";
import { BikeIcon, StoreIcon } from "lucide-react";

import { WhatsAppIcon } from "@/components/brand";
import { Totals } from "@/components/cart/totals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ORDER_BRANCH_OPTIONS, getOrderBranch } from "@/data/branches";
import { CONTACT, PAYMENT_METHODS, type PaymentMethodId } from "@/lib/config";
import type { Coupon } from "@/lib/coupons";
import { formatPrice, parseAmount } from "@/lib/format";
import { summarizeOrder, type OrderSummary } from "@/lib/pricing";
import { useCart, useCustomer, useRewards } from "@/lib/store";
import { storeTime } from "@/lib/time";
import { buildOrderMessage, whatsappUrl, type DeliveryMode } from "@/lib/whatsapp";

export type SentOrder = { url: string; earned: Coupon | null; pickup: boolean };

type FieldName = "branch" | "name" | "phone" | "address" | "cashAmount" | "invoiceName" | "invoiceRuc";
type Errors = Partial<Record<FieldName, string>>;

const optionClass =
  "flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border bg-card px-3 py-2 text-sm leading-snug font-medium has-data-checked:border-primary has-data-checked:bg-secondary has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50";

function Field({
  label,
  optional,
  error,
  hint,
  children,
}: {
  label: string;
  optional?: boolean;
  error?: string;
  hint?: string;
  children: (props: { id: string; "aria-invalid": boolean; "aria-describedby": string | undefined }) => ReactNode;
}) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-sm font-semibold">
        {label}
        {optional && <span className="font-normal text-muted-foreground">(opcional)</span>}
      </Label>
      {children({ id, "aria-invalid": Boolean(error), "aria-describedby": describedBy })}
      {error ? (
        <p id={`${id}-error`} className="text-sm font-medium text-destructive">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-sm text-muted-foreground">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

const inputClass = "h-12 rounded-xl bg-card px-3.5 text-base md:text-base";

export function CheckoutForm({
  summary,
  notice,
  onSent,
}: {
  summary: OrderSummary;
  notice?: ReactNode;
  onSent: (order: SentOrder) => void;
}) {
  const customer = useCustomer();
  const update = customer.update;
  const [errors, setErrors] = useState<Errors>({});
  const formRef = useRef<HTMLFormElement>(null);
  const pickup = customer.mode === "retiro";
  const branch = getOrderBranch(customer.branchId);

  const clearError = (field: FieldName) =>
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });

  const validate = (): Errors => {
    const next: Errors = {};
    if (!branch) next.branch = "Elegí una sucursal.";
    if (customer.name.trim().length < 2) next.name = "Escribí tu nombre.";
    if (customer.phone.replace(/\D/g, "").length < 6) next.phone = "Escribí un teléfono para que el local te contacte.";
    if (!pickup && customer.address.trim().length < 5) next.address = "Escribí la dirección de entrega.";
    if (customer.payment === "efectivo" && customer.cashAmount.trim()) {
      const cash = parseAmount(customer.cashAmount);
      if (cash === null || cash < summary.total) {
        next.cashAmount = `El monto tiene que ser de ${formatPrice(summary.total)} o más.`;
      }
    }
    if (customer.receipt === "factura") {
      if (customer.invoiceName.trim().length < 2) next.invoiceName = "Escribí el nombre o razón social.";
      if (customer.invoiceRuc.replace(/[^0-9]/g, "").length < 5) next.invoiceRuc = "Escribí el RUC o la cédula.";
    }
    return next;
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0 || !branch) {
      requestAnimationFrame(() => {
        const invalid = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"], [data-invalid="true"]');
        invalid?.scrollIntoView({ block: "center", behavior: "smooth" });
        invalid?.focus({ preventScroll: true });
      });
      return;
    }

    // Se recalcula al enviar para cobrar la promo del día y validar el cupón con la hora real.
    const now = new Date();
    const cart = useCart.getState();
    const final = summarizeOrder(cart.lines, storeTime(now), summary.coupon, now);
    const message = buildOrderMessage(final, {
      mode: customer.mode,
      branchName: branch.catalogName,
      branchAddress: branch.address,
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      reference: customer.reference,
      payment: customer.payment,
      cashAmount: customer.payment === "efectivo" ? parseAmount(customer.cashAmount) : null,
      receipt: customer.receipt,
      invoiceName: customer.invoiceName,
      invoiceRuc: customer.invoiceRuc,
      orderNote: cart.orderNote,
    });
    const url = whatsappUrl(CONTACT.orders.whatsapp, message);

    const opened = window.open(url, "_blank");
    if (opened) opened.opener = null;
    else window.location.href = url;

    const earned = useRewards.getState().recordOrder({
      total: final.total,
      itemCount: final.itemCount,
      lines: cart.lines,
      usedCouponCode: final.coupon?.code ?? null,
    });
    cart.clear();
    onSent({ url, earned, pickup });
  };

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-5 py-5">
        {notice}

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-base font-bold">¿Cómo lo querés recibir?</legend>
          <RadioGroup
            value={customer.mode}
            onValueChange={(value) => update({ mode: value as DeliveryMode })}
            className="grid grid-cols-2 gap-2"
          >
            {(
              [
                { id: "delivery", label: "Delivery", hint: "Te lo llevamos", icon: BikeIcon },
                { id: "retiro", label: "Retiro", hint: "Pasás a buscarlo", icon: StoreIcon },
              ] as const
            ).map((option) => (
              <Label key={option.id} className={cn(optionClass, "min-h-16")}>
                <RadioGroupItem value={option.id} className="sr-only!" />
                <option.icon className="size-6 shrink-0 text-primary" aria-hidden="true" />
                <span className="flex flex-col">
                  <span className="text-base font-bold">{option.label}</span>
                  <span className="text-xs font-normal text-muted-foreground">{option.hint}</span>
                </span>
              </Label>
            ))}
          </RadioGroup>
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-base font-bold">
            {pickup ? "¿En qué sucursal retirás?" : "¿Qué sucursal te queda más cerca?"}
          </legend>
          <RadioGroup
            value={customer.branchId === null ? "" : String(customer.branchId)}
            onValueChange={(value) => {
              update({ branchId: Number(value) });
              clearError("branch");
            }}
            aria-invalid={Boolean(errors.branch)}
          >
            {ORDER_BRANCH_OPTIONS.map((option, index) => (
              <Label key={option.id} className={optionClass}>
                <RadioGroupItem
                  value={String(option.id)}
                  data-invalid={index === 0 && errors.branch ? "true" : undefined}
                />
                <span className="flex min-w-0 flex-col">
                  <span>{option.name}</span>
                  {option.address && (
                    <span className="text-xs font-normal text-muted-foreground">{option.address}</span>
                  )}
                </span>
              </Label>
            ))}
          </RadioGroup>
          {errors.branch && <p className="text-sm font-medium text-destructive">{errors.branch}</p>}
        </fieldset>

        <fieldset className="flex flex-col gap-4">
          <legend className="mb-3 text-base font-bold">Tus datos</legend>
          <Field label="Nombre y apellido" error={errors.name}>
            {(props) => (
              <Input
                {...props}
                value={customer.name}
                onChange={(event) => {
                  update({ name: event.target.value });
                  clearError("name");
                }}
                autoComplete="name"
                maxLength={60}
                className={inputClass}
              />
            )}
          </Field>
          <Field label="Teléfono" error={errors.phone}>
            {(props) => (
              <Input
                {...props}
                type="tel"
                inputMode="tel"
                value={customer.phone}
                onChange={(event) => {
                  update({ phone: event.target.value });
                  clearError("phone");
                }}
                autoComplete="tel"
                maxLength={20}
                placeholder="09XX XXX XXX"
                className={inputClass}
              />
            )}
          </Field>
          {!pickup && (
            <>
              <Field label="Dirección de entrega" error={errors.address}>
                {(props) => (
                  <Input
                    {...props}
                    value={customer.address}
                    onChange={(event) => {
                      update({ address: event.target.value });
                      clearError("address");
                    }}
                    autoComplete="street-address"
                    maxLength={120}
                    placeholder="Calle, número y barrio"
                    className={inputClass}
                  />
                )}
              </Field>
              <Field label="Referencia" optional>
                {(props) => (
                  <Input
                    {...props}
                    value={customer.reference}
                    onChange={(event) => update({ reference: event.target.value })}
                    maxLength={120}
                    placeholder="Ej.: portón negro, frente a la plaza"
                    className={inputClass}
                  />
                )}
              </Field>
            </>
          )}
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-base font-bold">¿Cómo pagás?</legend>
          <RadioGroup
            value={customer.payment}
            onValueChange={(value) => {
              update({ payment: value as PaymentMethodId });
              clearError("cashAmount");
            }}
            className="grid grid-cols-2 gap-2"
          >
            {PAYMENT_METHODS.map((method) => (
              <Label key={method.id} className={optionClass}>
                <RadioGroupItem value={method.id} />
                <span>{method.label}</span>
              </Label>
            ))}
          </RadioGroup>
          {customer.payment === "efectivo" && (
            <div className="pt-2">
              <Field
                label="¿Con cuánto pagás?"
                optional
                error={errors.cashAmount}
                hint="Así el local prepara tu vuelto."
              >
                {(props) => (
                  <Input
                    {...props}
                    inputMode="numeric"
                    value={customer.cashAmount}
                    onChange={(event) => {
                      update({ cashAmount: event.target.value });
                      clearError("cashAmount");
                    }}
                    maxLength={12}
                    placeholder="Ej.: 100.000"
                    className={inputClass}
                  />
                )}
              </Field>
            </div>
          )}
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-base font-bold">Comprobante</legend>
          <RadioGroup
            value={customer.receipt}
            onValueChange={(value) => update({ receipt: value as "ticket" | "factura" })}
            className="grid grid-cols-2 gap-2"
          >
            <Label className={optionClass}>
              <RadioGroupItem value="ticket" />
              <span>Ticket</span>
            </Label>
            <Label className={optionClass}>
              <RadioGroupItem value="factura" />
              <span>Factura</span>
            </Label>
          </RadioGroup>
          {customer.receipt === "factura" && (
            <div className="flex flex-col gap-4 pt-2">
              <Field label="Nombre o razón social" error={errors.invoiceName}>
                {(props) => (
                  <Input
                    {...props}
                    value={customer.invoiceName}
                    onChange={(event) => {
                      update({ invoiceName: event.target.value });
                      clearError("invoiceName");
                    }}
                    autoComplete="organization"
                    maxLength={80}
                    className={inputClass}
                  />
                )}
              </Field>
              <Field label="RUC o cédula" error={errors.invoiceRuc}>
                {(props) => (
                  <Input
                    {...props}
                    inputMode="text"
                    value={customer.invoiceRuc}
                    onChange={(event) => {
                      update({ invoiceRuc: event.target.value });
                      clearError("invoiceRuc");
                    }}
                    maxLength={20}
                    placeholder="Ej.: 1234567-8"
                    className={inputClass}
                  />
                )}
              </Field>
            </div>
          )}
        </fieldset>
      </div>

      <div className="pb-safe shrink-0 border-t bg-card">
        <div className="flex flex-col gap-3 p-5">
          <Totals summary={summary} pickup={pickup} />
          <Button type="submit" size="xl" className="rounded-full">
            <WhatsAppIcon />
            Enviar pedido por WhatsApp
          </Button>
        </div>
      </div>
    </form>
  );
}
