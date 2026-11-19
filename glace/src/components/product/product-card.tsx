"use client";

import Image from "next/image";
import { cn } from "cn";
import { IceCreamConeIcon, PlusIcon, StarIcon } from "lucide-react";
import { toast } from "sonner";

import { categoryLabelOf, smallImage, type Product } from "@/data/catalog";
import { activePricePromo } from "@/data/promotions";
import { formatPrice } from "@/lib/format";
import { useStoreTime } from "@/lib/hooks";
import { useCart, useUi } from "@/lib/store";

export function ProductPrice({ product, className }: { product: Product; className?: string }) {
  const local = useStoreTime();
  const promo = activePricePromo(product.id, local);
  const onPromo = promo && promo.price < product.price;
  return (
    <span className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-0.5", className)}>
      <span className="text-base font-bold text-foreground">{formatPrice(onPromo ? promo.price : product.price)}</span>
      {onPromo && (
        <>
          <span className="text-sm text-muted-foreground line-through">
            <span className="sr-only">Precio habitual: </span>
            {formatPrice(product.price)}
          </span>
          <span className="rounded-full bg-pink-deep px-2 py-0.5 text-[0.6875rem] font-bold text-white">{promo.name}</span>
        </>
      )}
    </span>
  );
}

function ProductImage({ product, className }: { product: Product; className?: string }) {
  if (!product.image) {
    return (
      <span className={cn("grid place-items-center bg-secondary text-brand", className)}>
        <IceCreamConeIcon className="size-8" aria-hidden="true" />
      </span>
    );
  }
  return (
    <Image
      src={smallImage(product.image)}
      alt=""
      width={360}
      height={480}
      loading="lazy"
      className={cn("object-cover", className)}
    />
  );
}

function useQuickAdd(product: Product) {
  const add = useCart((state) => state.add);
  const openProduct = useUi((state) => state.openProduct);
  const openCart = useUi((state) => state.openCart);
  return () => {
    if (product.optionGroups.length > 0) {
      openProduct(product.id);
      return;
    }
    add(product.id, {}, "", 1);
    toast.success(`${product.name} agregado a tu pedido`, {
      action: { label: "Ver pedido", onClick: openCart },
    });
  };
}

function QuickAddButton({ product, className }: { product: Product; className?: string }) {
  const quickAdd = useQuickAdd(product);
  return (
    <button
      type="button"
      onClick={quickAdd}
      aria-label={
        product.optionGroups.length > 0 ? `Elegir sabores de ${product.name}` : `Agregar ${product.name} al pedido`
      }
      className={cn(
        "z-10 grid size-10 place-items-center rounded-full border bg-card text-primary shadow-md transition-transform outline-none hover:scale-105 focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-95",
        className,
      )}
    >
      <PlusIcon className="size-5" strokeWidth={2.6} aria-hidden="true" />
    </button>
  );
}

const cardClass =
  "group relative min-w-0 rounded-2xl border bg-card transition-shadow hover:shadow-lg has-[.card-hit:focus-visible]:ring-3 has-[.card-hit:focus-visible]:ring-ring/50";

function CardHitArea({ product }: { product: Product }) {
  const openProduct = useUi((state) => state.openProduct);
  return (
    <button
      type="button"
      onClick={() => openProduct(product.id)}
      aria-label={`Ver ${product.name}`}
      className="card-hit absolute inset-0 z-[1] rounded-2xl outline-none"
    />
  );
}

/** Fila con texto a la izquierda e imagen a la derecha, para las listas por categoría. */
export function ProductRow({ product }: { product: Product }) {
  return (
    <article className={cn(cardClass, "flex min-h-32 items-stretch gap-3 p-3")}>
      <CardHitArea product={product} />
      <div className="flex min-w-0 flex-1 flex-col gap-1 py-0.5">
        <h3 className="font-sans text-base leading-snug font-semibold text-pretty wrap-anywhere">{product.name}</h3>
        {product.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{product.description.split("\n")[0]}</p>
        )}
        <ProductPrice product={product} className="mt-auto pt-1" />
      </div>
      <div className="relative size-28 shrink-0 self-center">
        <ProductImage product={product} className="size-full rounded-xl" />
        <QuickAddButton product={product} className="absolute -right-1.5 -bottom-1.5" />
      </div>
    </article>
  );
}

/** Tarjeta vertical para el carrusel de más pedidos. */
export function ProductCard({ product }: { product: Product }) {
  return (
    <article className={cn(cardClass, "flex w-44 shrink-0 snap-start flex-col overflow-hidden sm:w-52")}>
      <CardHitArea product={product} />
      <div className="relative aspect-[4/3] w-full">
        <ProductImage product={product} className="absolute inset-0 size-full" />
        <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-marron px-2 py-0.5 text-[0.6875rem] font-bold text-white">
          <StarIcon className="size-3 fill-current" aria-hidden="true" />
          Más pedido
        </span>
        <QuickAddButton product={product} className="absolute right-2 -bottom-5" />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3 pt-4">
        <span className="text-xs font-medium text-muted-foreground">{categoryLabelOf(product)}</span>
        <h3 className="line-clamp-2 font-sans text-sm leading-snug font-semibold">{product.name}</h3>
        <ProductPrice product={product} className="mt-auto" />
      </div>
    </article>
  );
}
