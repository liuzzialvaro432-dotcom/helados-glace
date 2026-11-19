"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "cn";
import { MinusIcon, PlusIcon, Share2Icon, XIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { getProduct, type OptionGroup, type Product } from "@/data/catalog";
import { BUSINESS } from "@/lib/config";
import { formatPrice } from "@/lib/format";
import { useStoreTime } from "@/lib/hooks";
import { priceProduct, selectionError, type Selections } from "@/lib/pricing";
import { useCart, useUi } from "@/lib/store";
import { shareUrl } from "@/lib/whatsapp";

const MAX_QUANTITY = 20;

function groupHint(group: OptionGroup): string {
  if (group.kind === "single") return "Elegí 1";
  return group.max ? `Elegí hasta ${group.max}` : "Elegí los que quieras";
}

function OptionGroupField({
  group,
  selected,
  onChange,
  invalid,
}: {
  group: OptionGroup;
  selected: number[];
  onChange: (ids: number[]) => void;
  invalid: boolean;
}) {
  const full = group.max !== null && selected.length >= group.max;
  const titleId = `grupo-${group.id}`;
  const rowClass =
    "flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border bg-card px-3 py-2 text-sm font-medium has-data-checked:border-primary has-data-checked:bg-secondary has-data-disabled:cursor-not-allowed has-data-disabled:opacity-50";

  return (
    <fieldset aria-labelledby={titleId} className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <h3 id={titleId} className="font-sans text-base font-bold">
            {group.kind === "single" ? "Sabor" : "Sabores"}
          </h3>
          <p className={cn("text-sm text-muted-foreground", invalid && "font-semibold text-destructive")}>
            {invalid ? (group.kind === "single" ? "Elegí una opción para continuar." : "Elegí al menos un sabor.") : groupHint(group)}
          </p>
        </div>
        {group.kind === "multi" && (
          <span
            aria-live="polite"
            className="rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-secondary-foreground tabular-nums"
          >
            {selected.length}
            {group.max ? `/${group.max}` : ""} elegidos
          </span>
        )}
      </div>

      {group.kind === "single" ? (
        <RadioGroup
          aria-labelledby={titleId}
          value={selected[0] ?? null}
          onValueChange={(value) => onChange([Number(value)])}
          className="grid gap-2 sm:grid-cols-2"
        >
          {group.items.map((item) => (
            <Label key={item.id} className={rowClass}>
              <RadioGroupItem value={item.id} />
              <span className="flex-1">{item.name}</span>
              {item.price > 0 && <span className="text-muted-foreground">+{formatPrice(item.price)}</span>}
            </Label>
          ))}
        </RadioGroup>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {group.items.map((item) => {
            const checked = selected.includes(item.id);
            return (
              <Label key={item.id} className={rowClass}>
                <Checkbox
                  checked={checked}
                  disabled={!checked && full}
                  onCheckedChange={(next) =>
                    onChange(next ? [...selected, item.id] : selected.filter((id) => id !== item.id))
                  }
                />
                <span className="flex-1">{item.name}</span>
                {item.price > 0 && <span className="text-muted-foreground">+{formatPrice(item.price)}</span>}
              </Label>
            );
          })}
        </div>
      )}
    </fieldset>
  );
}

function ProductForm({ product, onDone }: { product: Product; onDone: () => void }) {
  const [selections, setSelections] = useState<Selections>({});
  const [note, setNote] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [showErrors, setShowErrors] = useState(false);
  const local = useStoreTime();
  const add = useCart((state) => state.add);
  const openCart = useUi((state) => state.openCart);

  const price = priceProduct(product, selections, local);
  const error = selectionError(product, selections);
  const noteId = `nota-${product.id}`;

  const submit = () => {
    if (error) {
      setShowErrors(true);
      return;
    }
    add(product.id, selections, note, quantity);
    toast.success(`${product.name} agregado a tu pedido`, {
      action: { label: "Ver pedido", onClick: openCart },
    });
    onDone();
  };

  const share = () => {
    const link = `${window.location.origin}/?producto=${product.id}`;
    window.open(shareUrl(`Mirá ${product.name} de ${BUSINESS.name}: ${link}`), "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto md:grid md:grid-cols-[2fr_3fr] md:overflow-hidden">
        {product.image && (
          <div className="relative aspect-[4/3] w-full shrink-0 bg-muted md:aspect-auto md:h-full">
            <Image
              src={product.image}
              alt={product.name}
              width={720}
              height={960}
              className="size-full object-cover md:absolute md:inset-0"
            />
          </div>
        )}
        <div className="flex flex-col gap-5 p-5 md:overflow-y-auto">
          <div className="flex flex-col gap-2 pr-8">
            <DialogTitle className="font-heading text-2xl leading-tight font-bold text-pretty">
              {product.name}
            </DialogTitle>
            {product.description ? (
              <DialogDescription className="text-base whitespace-pre-line">{product.description}</DialogDescription>
            ) : (
              <DialogDescription className="sr-only">Detalle del producto</DialogDescription>
            )}
            <p className="flex flex-wrap items-baseline gap-2">
              <span className="text-xl font-bold">{formatPrice(price.unit)}</span>
              {price.promo && (
                <>
                  <span className="text-muted-foreground line-through">{formatPrice(price.listUnit)}</span>
                  <span className="rounded-full bg-pink-deep px-2 py-0.5 text-xs font-bold text-white">
                    {price.promo.name}
                  </span>
                </>
              )}
            </p>
          </div>

          {product.optionGroups.map((group) => (
            <OptionGroupField
              key={group.id}
              group={group}
              selected={selections[group.id] ?? []}
              onChange={(ids) => setSelections((current) => ({ ...current, [group.id]: ids }))}
              invalid={showErrors && (selections[group.id] ?? []).length === 0}
            />
          ))}

          <div className="flex flex-col gap-2">
            <Label htmlFor={noteId} className="text-base font-bold">
              Nota para el local <span className="text-sm font-normal text-muted-foreground">(opcional)</span>
            </Label>
            <Textarea
              id={noteId}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={200}
              rows={2}
              placeholder="Ej.: sin cobertura, para regalo…"
              className="text-base"
            />
          </div>

          <Button variant="ghost" size="lg" onClick={share} className="w-fit text-muted-foreground">
            <Share2Icon aria-hidden="true" />
            Compartir por WhatsApp
          </Button>
        </div>
      </div>

      <div className="pb-safe flex shrink-0 items-center gap-3 border-t bg-card p-4">
        <div className="flex items-center gap-1 rounded-full border p-1" role="group" aria-label="Cantidad">
          <Button
            variant="ghost"
            size="icon-lg"
            className="rounded-full"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            disabled={quantity <= 1}
            aria-label="Quitar uno"
          >
            <MinusIcon />
          </Button>
          <span aria-live="polite" className="w-7 text-center text-base font-bold tabular-nums">
            {quantity}
          </span>
          <Button
            variant="ghost"
            size="icon-lg"
            className="rounded-full"
            onClick={() => setQuantity((value) => Math.min(MAX_QUANTITY, value + 1))}
            disabled={quantity >= MAX_QUANTITY}
            aria-label="Agregar uno"
          >
            <PlusIcon />
          </Button>
        </div>
        <Button size="xl" className="flex-1 justify-between rounded-full" onClick={submit}>
          <span>Agregar</span>
          <span className="tabular-nums">{formatPrice(price.unit * quantity)}</span>
        </Button>
      </div>
    </>
  );
}

export function ProductDialog() {
  const productId = useUi((state) => state.productId);
  const closeProduct = useUi((state) => state.closeProduct);
  // `view` conserva el último producto durante la animación de cierre y
  // `session` reinicia el formulario cada vez que se abre.
  const [view, setView] = useState<{ id: number | null; session: number }>({ id: null, session: 0 });
  const [wasOpen, setWasOpen] = useState(false);
  const open = productId !== null;
  if (open !== wasOpen) setWasOpen(open);
  if (open && (!wasOpen || productId !== view.id)) setView({ id: productId, session: view.session + 1 });
  const product = view.id !== null ? getProduct(view.id) : undefined;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && closeProduct()}>
      <DialogContent
        showCloseButton={false}
        className="top-auto bottom-0 flex max-h-[92dvh] w-full max-w-full translate-y-0 flex-col gap-0 overflow-hidden rounded-t-3xl rounded-b-none p-0 sm:top-1/2 sm:bottom-auto sm:max-h-[88dvh] sm:max-w-lg sm:-translate-y-1/2 sm:rounded-3xl md:h-[620px] md:max-w-4xl"
      >
        <DialogClose
          render={
            <Button variant="secondary" size="icon-xl" className="absolute top-3 right-3 z-10 bg-card shadow-md" />
          }
        >
          <XIcon aria-hidden="true" />
          <span className="sr-only">Cerrar</span>
        </DialogClose>
        {product && <ProductForm key={view.session} product={product} onDone={closeProduct} />}
      </DialogContent>
    </Dialog>
  );
}
