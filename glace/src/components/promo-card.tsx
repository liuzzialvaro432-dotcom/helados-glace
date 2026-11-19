"use client";

import Link from "next/link";
import { cn } from "cn";
import { ArrowRightIcon } from "lucide-react";

import type { Promotion } from "@/data/promotions";
import { useUi } from "@/lib/store";

const TONES: Record<Promotion["tone"], { card: string; badge: string; action: string }> = {
  green: { card: "bg-primary text-white", badge: "bg-white text-primary", action: "bg-white text-primary" },
  pink: { card: "bg-pink-deep text-white", badge: "bg-white text-pink-deep", action: "bg-white text-pink-deep" },
  marron: { card: "bg-marron text-white", badge: "bg-white text-marron", action: "bg-white text-marron" },
  castano: { card: "bg-[#f0dfcd] text-marron", badge: "bg-marron text-white", action: "bg-marron text-white" },
};

const actionClass =
  "inline-flex h-11 w-fit items-center gap-2 rounded-full px-5 text-sm font-bold whitespace-nowrap outline-none transition-transform hover:scale-[1.03] focus-visible:ring-3 focus-visible:ring-white/70 active:scale-100";

export function PromoCard({
  promotion,
  detailed = false,
  className,
}: {
  promotion: Promotion;
  detailed?: boolean;
  className?: string;
}) {
  const openProduct = useUi((state) => state.openProduct);
  const tone = TONES[promotion.tone];
  const action = promotion.action;

  return (
    <article className={cn("relative flex overflow-hidden rounded-3xl", tone.card, className)}>
      <div className="flex min-w-0 flex-1 flex-col items-start gap-2 p-5">
        <span className={cn("rounded-full px-2.5 py-1 text-[0.6875rem] font-bold tracking-wider whitespace-nowrap uppercase", tone.badge)}>
          {promotion.badge}
        </span>
        <h3 className="text-2xl leading-tight font-bold text-pretty">{promotion.title}</h3>
        <p className="text-sm font-medium text-pretty">{detailed ? promotion.detail : promotion.description}</p>
        <div className="mt-auto pt-3">
          {"productId" in action ? (
            <button type="button" onClick={() => openProduct(action.productId)} className={cn(actionClass, tone.action)}>
              {action.label}
              <ArrowRightIcon className="size-4" aria-hidden="true" />
            </button>
          ) : (
            <Link href={action.href} className={cn(actionClass, tone.action)}>
              {action.label}
              <ArrowRightIcon className="size-4" aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
      {promotion.image && (
        // eslint-disable-next-line @next/next/no-img-element -- foto del catálogo ya optimizada en WebP
        <img
          src={promotion.image.replace(/\.webp$/, "-sm.webp")}
          alt=""
          loading="lazy"
          className="w-24 shrink-0 object-cover sm:w-40"
        />
      )}
    </article>
  );
}
