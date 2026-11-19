"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "cn";
import {
  ArrowLeftIcon,
  CircleCheckIcon,
  ClockIcon,
  GiftIcon,
  IceCreamConeIcon,
  MinusIcon,
  PlusIcon,
  TicketIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";

import { WhatsAppIcon } from "@/components/brand";
import { CheckoutForm, type SentOrder } from "@/components/cart/checkout-form";
import { Totals } from "@/components/cart/totals";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { smallImage } from "@/data/catalog";
import { COUPON_VALID_DAYS } from "@/data/coupons";
import { checkCoupon, isCouponActive, nextTier, tierForOrder } from "@/lib/coupons";
import { formatPrice } from "@/lib/format";
import { useNow, useStoreTime } from "@/lib/hooks";
import { getStoreStatus, statusLabel } from "@/lib/hours";
import { summarizeOrder, type PricedLine } from "@/lib/pricing";
import { useCart, useRewards, useUi } from "@/lib/store";

type Step = "cart" | "checkout" | "sent";

function LineItem({ item }: { item: PricedLine }) {
  const setQuantity = useCart((state) => state.setQuantity);
  const remove = useCart((state) => state.remove);
  const { line, product } = item;
  return (
    <li className="flex gap-3 py-4">
      {product.image ? (
        // eslint-disable-next-line @next/next/no-img-element -- miniatura ya optimizada en WebP
        <img
          src={smallImage(product.image)}
          alt=""
          width={64}
          height={64}
          loading="lazy"
          className="size-16 shrink-0 rounded-xl object-cover"
        />
      ) : (
        <span className="grid size-16 shrink-0 place-items-center rounded-xl bg-secondary text-brand">
          <IceCreamConeIcon className="size-6" aria-hidden="true" />
        </span>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-sans text-base leading-snug font-semibold text-pretty">{product.name}</h3>
          <span className="shrink-0 text-base font-bold tabular-nums">{formatPrice(item.total)}</span>
        </div>
        {item.optionNames.length > 0 && (
          <p className="text-sm text-muted-foreground">{item.optionNames.join(", ")}</p>
        )}
        {line.note && <p className="text-sm text-muted-foreground italic">Nota: {line.note}</p>}
        {item.promo && (
          <p className="w-fit rounded-full bg-pink-deep px-2 py-0.5 text-xs font-bold text-white">{item.promo.name}</p>
        )}
        <div className="mt-1 flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full border p-0.5" role="group" aria-label={`Cantidad de ${product.name}`}>
            <Button
              variant="ghost"
              size="icon-lg"
              className="rounded-full"
              onClick={() => setQuantity(line.key, line.quantity - 1)}
              aria-label={line.quantity === 1 ? `Quitar ${product.name}` : "Quitar uno"}
            >
              {line.quantity === 1 ? <Trash2Icon /> : <MinusIcon />}
            </Button>
            <span aria-live="polite" className="w-6 text-center text-base font-bold tabular-nums">
              {line.quantity}
            </span>
            <Button
              variant="ghost"
              size="icon-lg"
              className="rounded-full"
              onClick={() => setQuantity(line.key, line.quantity + 1)}
              aria-label="Agregar uno"
            >
              <PlusIcon />
            </Button>
          </div>
          {line.quantity > 1 && (
            <Button variant="ghost" size="lg" onClick={() => remove(line.key)} className="text-muted-foreground">
              Quitar
            </Button>
          )}
        </div>
      </div>
    </li>
  );
}

/** Cuánto falta para ganar el próximo cupón con este pedido. */
function RewardHint({ total }: { total: number }) {
  const earned = tierForOrder(total);
  const next = nextTier(total);
  if (!earned && !next) return null;
  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-secondary p-4 text-secondary-foreground">
      <p className="flex items-start gap-2 text-sm font-semibold">
        <GiftIcon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        <span>
          {earned
            ? `Con este pedido ganás un cupón de ${formatPrice(earned.value)} para tu próxima compra.`
            : next && `Sumá ${formatPrice(next.minOrder - total)} y ganás un cupón de ${formatPrice(next.value)}.`}
          {earned && next && ` Sumá ${formatPrice(next.minOrder - total)} más y el cupón sube a ${formatPrice(next.value)}.`}
        </span>
      </p>
      {next && (
        <Progress
          value={Math.min(100, Math.round((total / next.minOrder) * 100))}
          aria-label={`Avance hacia el cupón de ${formatPrice(next.value)}`}
          className="[&_[data-slot=progress-track]]:h-2 [&_[data-slot=progress-track]]:bg-white"
        />
      )}
    </div>
  );
}

function CouponPicker({ subtotal }: { subtotal: number }) {
  const now = useNow();
  const coupons = useRewards((state) => state.coupons);
  const couponCode = useCart((state) => state.couponCode);
  const selectCoupon = useCart((state) => state.selectCoupon);
  if (!now) return null;
  const active = coupons.filter((coupon) => isCouponActive(coupon, now));
  if (active.length === 0) return null;
  const rowClass =
    "flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border bg-card px-3 py-2 text-sm leading-snug font-medium has-data-checked:border-primary has-data-checked:bg-secondary has-data-disabled:cursor-not-allowed has-data-disabled:opacity-60";

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 flex items-center gap-2 text-base font-bold">
        <TicketIcon className="size-5 text-primary" aria-hidden="true" />
        Tus cupones
      </legend>
      <RadioGroup value={couponCode ?? ""} onValueChange={(value) => selectCoupon(value ? String(value) : null)}>
        <Label className={rowClass}>
          <RadioGroupItem value="" />
          <span>No usar cupón</span>
        </Label>
        {active.map((coupon) => {
          const usable = checkCoupon(coupon, subtotal, now).ok;
          return (
            <Label key={coupon.code} className={rowClass}>
              <RadioGroupItem value={coupon.code} disabled={!usable} />
              <span className="flex min-w-0 flex-1 flex-col">
                <span>
                  {formatPrice(coupon.value)} de descuento · <span className="font-mono">{coupon.code}</span>
                </span>
                <span className="text-xs font-normal text-muted-foreground">
                  {usable
                    ? `En pedidos desde ${formatPrice(coupon.redeemMin)}`
                    : `Te faltan ${formatPrice(coupon.redeemMin - subtotal)} para usarlo`}
                </span>
              </span>
            </Label>
          );
        })}
      </RadioGroup>
    </fieldset>
  );
}

function ClosedNotice() {
  const now = useNow();
  if (!now) return null;
  const status = getStoreStatus(now);
  if (status.open) return null;
  return (
    <p className="flex items-start gap-2 rounded-2xl bg-muted p-3 text-sm">
      <ClockIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>
        <strong className="font-semibold">{statusLabel(status)}.</strong> Podés enviar tu pedido igual: el local lo
        atiende cuando abre.
      </span>
    </p>
  );
}

function EmptyCart({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 pb-16 text-center">
      <span className="brand-mask grid size-24 place-items-center bg-secondary text-primary">
        <IceCreamConeIcon className="size-10" aria-hidden="true" />
      </span>
      <p className="font-heading text-2xl font-bold text-primary">Tu pedido está vacío</p>
      <p className="max-w-xs text-base text-muted-foreground">
        Elegí tus sabores favoritos y armá tu pedido. Lo enviás por WhatsApp en un minuto.
      </p>
      <Link href="/#menu" onClick={onClose} className={cn(buttonVariants({ size: "xl" }), "mt-2 rounded-full")}>
        Ver el menú
      </Link>
    </div>
  );
}

function SentStep({ sent, onClose }: { sent: SentOrder; onClose: () => void }) {
  return (
    <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 pb-8">
      <div className="flex flex-col items-center gap-3 pt-4 text-center">
        <CircleCheckIcon className="size-14 text-primary" aria-hidden="true" />
        <p className="font-heading text-2xl leading-tight font-bold text-primary">Tu pedido ya está en WhatsApp</p>
        <p className="text-base text-pretty text-muted-foreground">
          Tocá <strong className="font-semibold text-foreground">Enviar</strong> en el chat para que el local lo reciba.
          {sent.pickup
            ? " Te avisan cuando esté listo para retirar."
            : " Te confirman el costo de envío y el tiempo de entrega."}
        </p>
      </div>

      <a
        href={sent.url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(buttonVariants({ variant: "outline", size: "xl" }), "rounded-full")}
      >
        <WhatsAppIcon />
        ¿No se abrió? Abrir WhatsApp
      </a>

      {sent.earned && (
        <div className="flex flex-col items-center gap-2 rounded-3xl border-2 border-dashed border-pink bg-card p-5 text-center">
          <GiftIcon className="size-8 text-pink-deep" aria-hidden="true" />
          <p className="font-heading text-xl font-bold text-pink-deep">
            ¡Ganaste un cupón de {formatPrice(sent.earned.value)}!
          </p>
          <p className="rounded-lg bg-muted px-3 py-1.5 font-mono text-lg font-bold tracking-wider">
            {sent.earned.code}
          </p>
          <p className="text-sm text-muted-foreground">
            Queda guardado en este dispositivo. Usalo en tu próximo pedido desde {formatPrice(sent.earned.redeemMin)},
            dentro de los próximos {COUPON_VALID_DAYS} días.
          </p>
        </div>
      )}

      <Button size="xl" onClick={onClose} className="rounded-full">
        Seguir viendo el menú
      </Button>
    </div>
  );
}

export function CartSheet() {
  const open = useUi((state) => state.cartOpen);
  const setCartOpen = useUi((state) => state.setCartOpen);
  const hydrated = useUi((state) => state.hydrated);
  const lines = useCart((state) => state.lines);
  const orderNote = useCart((state) => state.orderNote);
  const setOrderNote = useCart((state) => state.setOrderNote);
  const clear = useCart((state) => state.clear);
  const couponCode = useCart((state) => state.couponCode);
  const coupons = useRewards((state) => state.coupons);
  const local = useStoreTime();
  const now = useNow();
  const [step, setStep] = useState<Step>("cart");
  const [sent, setSent] = useState<SentOrder | null>(null);

  // Los avisos de "agregado" taparían el encabezado del pedido.
  useEffect(() => {
    if (open) toast.dismiss();
  }, [open]);

  const coupon = coupons.find((item) => item.code === couponCode) ?? null;
  const summary = summarizeOrder(hydrated ? lines : [], local, coupon, now);
  const empty = summary.lines.length === 0;
  const visibleStep: Step = step === "sent" && sent ? "sent" : empty ? "cart" : step === "sent" ? "cart" : step;

  const handleOpenChange = (next: boolean) => {
    setCartOpen(next);
    if (!next && step === "sent") {
      setStep("cart");
      setSent(null);
    }
  };
  const close = () => handleOpenChange(false);

  const titles: Record<Step, { title: string; description: string }> = {
    cart: {
      title: "Mi pedido",
      description: empty
        ? "Todavía no agregaste productos."
        : `${summary.itemCount} ${summary.itemCount === 1 ? "producto" : "productos"}`,
    },
    checkout: { title: "Datos para tu pedido", description: "Completá tus datos y envialo por WhatsApp." },
    sent: { title: "¡Listo!", description: "Solo falta enviar el mensaje." },
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-md"
      >
        <SheetHeader className="shrink-0 border-b pr-16">
          <div className="flex items-center gap-2">
            {visibleStep === "checkout" && (
              <Button
                variant="ghost"
                size="icon-xl"
                onClick={() => setStep("cart")}
                aria-label="Volver al pedido"
                className="-ml-2"
              >
                <ArrowLeftIcon />
              </Button>
            )}
            <div className="flex flex-col">
              <SheetTitle className="font-heading text-2xl font-bold text-primary">
                {titles[visibleStep].title}
              </SheetTitle>
              <SheetDescription>{titles[visibleStep].description}</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {visibleStep === "sent" && sent && <SentStep sent={sent} onClose={close} />}

        {visibleStep === "cart" && empty && <EmptyCart onClose={close} />}

        {visibleStep === "cart" && !empty && (
          <>
            <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 pb-5">
              <ul className="divide-y">
                {summary.lines.map((item) => (
                  <LineItem key={item.line.key} item={item} />
                ))}
              </ul>
              <RewardHint total={summary.total} />
              <CouponPicker subtotal={summary.subtotal} />
              <div className="flex flex-col gap-2">
                <Label htmlFor="nota-pedido" className="text-base font-bold">
                  Notas del pedido <span className="text-sm font-normal text-muted-foreground">(opcional)</span>
                </Label>
                <Textarea
                  id="nota-pedido"
                  value={orderNote}
                  onChange={(event) => setOrderNote(event.target.value)}
                  maxLength={300}
                  rows={2}
                  placeholder="Ej.: tocar timbre, entregar después de las 18 h…"
                  className="text-base"
                />
              </div>
              <Button variant="ghost" size="lg" onClick={clear} className="w-fit text-muted-foreground">
                <Trash2Icon aria-hidden="true" />
                Vaciar pedido
              </Button>
            </div>
            <div className="pb-safe shrink-0 border-t bg-card">
              <div className="flex flex-col gap-3 p-5">
                <Totals summary={summary} />
                <Button size="xl" onClick={() => setStep("checkout")} className="rounded-full">
                  Continuar
                </Button>
              </div>
            </div>
          </>
        )}

        {visibleStep === "checkout" && (
          <CheckoutForm
            summary={summary}
            notice={<ClosedNotice />}
            onSent={(order) => {
              setSent(order);
              setStep("sent");
            }}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
