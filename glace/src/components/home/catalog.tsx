"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "cn";
import { SearchIcon, SearchXIcon, XIcon } from "lucide-react";

import { Eyebrow } from "@/components/brand";
import { ProductCard, ProductRow } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CATEGORIES,
  FEATURED_PRODUCTS,
  PRODUCTS,
  categoryAnchor,
  categoryShortName,
  matchesSearch,
  productsOf,
  type Category,
} from "@/data/catalog";

const FEATURED_ANCHOR = "mas-pedidos";
const SECTIONS = [
  { anchor: FEATURED_ANCHOR, label: "Más pedidos" },
  ...CATEGORIES.map((category) => ({ anchor: categoryAnchor(category), label: categoryShortName(category) })),
];

/** Resalta en la barra la sección que está a la vista. */
function useActiveSection(enabled: boolean): string {
  const [active, setActive] = useState(FEATURED_ANCHOR);
  useEffect(() => {
    if (!enabled) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length > 0) setActive(visible[0].target.id);
      },
      { rootMargin: "-140px 0px -55% 0px" },
    );
    for (const section of SECTIONS) {
      const element = document.getElementById(section.anchor);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [enabled]);
  return active;
}

function CategoryNav({ active }: { active: string }) {
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const chip = listRef.current?.querySelector<HTMLElement>(`[data-anchor="${active}"]`);
    const list = listRef.current;
    if (!chip || !list) return;
    list.scrollTo({ left: chip.offsetLeft - list.clientWidth / 2 + chip.clientWidth / 2, behavior: "smooth" });
  }, [active]);

  return (
    <nav aria-label="Categorías" className="sticky top-16 z-30 -mx-4 border-b bg-background/95 backdrop-blur-md">
      <div ref={listRef} className="no-scrollbar relative flex gap-2 overflow-x-auto px-4 py-3">
        {SECTIONS.map((section) => (
          <a
            key={section.anchor}
            href={`#${section.anchor}`}
            data-anchor={section.anchor}
            aria-current={active === section.anchor ? "true" : undefined}
            className={cn(
              "shrink-0 rounded-full border bg-card px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors outline-none hover:border-primary focus-visible:ring-3 focus-visible:ring-ring/50",
              active === section.anchor && "border-primary bg-primary text-primary-foreground",
            )}
          >
            {section.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

function CategorySection({ category }: { category: Category }) {
  const products = productsOf(category);
  return (
    <section id={categoryAnchor(category)} aria-labelledby={`${categoryAnchor(category)}-titulo`} className="scroll-mt-36">
      <div className="mb-4 flex items-center gap-3">
        {category.image && (
          // eslint-disable-next-line @next/next/no-img-element -- miniatura decorativa recortada con la forma del contenedor de la marca
          <img
            src={category.image}
            alt=""
            width={56}
            height={56}
            loading="lazy"
            className="brand-mask size-14 shrink-0 object-cover"
          />
        )}
        <div className="flex min-w-0 flex-col">
          <h2 id={`${categoryAnchor(category)}-titulo`} className="text-2xl leading-tight font-bold text-pretty text-primary">
            {category.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            {products.length} {products.length === 1 ? "producto" : "productos"}
          </p>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <ProductRow key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export function Catalog() {
  const [query, setQuery] = useState("");
  const searching = query.trim().length > 0;
  const active = useActiveSection(!searching);
  const results = searching ? PRODUCTS.filter((product) => matchesSearch(product, query)) : [];

  return (
    <div id="menu" className="mx-auto flex w-full max-w-6xl scroll-mt-20 flex-col gap-6 px-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <Eyebrow>Nuestros productos</Eyebrow>
          <h2 className="text-3xl font-bold text-pink">Armá tu pedido</h2>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <SearchIcon
            className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar helado, torta, copa…"
            aria-label="Buscar en el menú"
            className="h-12 rounded-full bg-card pr-11 pl-11 text-base [&::-webkit-search-cancel-button]:hidden"
          />
          {searching && (
            <Button
              variant="ghost"
              size="icon-lg"
              onClick={() => setQuery("")}
              aria-label="Borrar búsqueda"
              className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded-full"
            >
              <XIcon />
            </Button>
          )}
        </div>
      </div>

      {searching ? (
        <section aria-live="polite" className="flex min-h-64 flex-col gap-4">
          {results.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground">
                {results.length} {results.length === 1 ? "resultado" : "resultados"} para «{query.trim()}»
              </p>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {results.map((product) => (
                  <ProductRow key={product.id} product={product} />
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed bg-card px-6 py-12 text-center">
              <SearchXIcon className="size-10 text-muted-foreground" aria-hidden="true" />
              <p className="text-lg font-semibold">No encontramos «{query.trim()}» en el menú</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Probá con otra palabra, por ejemplo “torta”, “delifree” o “milkshake”.
              </p>
              <Button variant="outline" size="xl" onClick={() => setQuery("")} className="rounded-full">
                Ver todo el menú
              </Button>
            </div>
          )}
        </section>
      ) : (
        <>
          <CategoryNav active={active} />
          <section id={FEATURED_ANCHOR} aria-labelledby="mas-pedidos-titulo" className="scroll-mt-36">
            <h2 id="mas-pedidos-titulo" className="mb-4 text-2xl font-bold text-primary">
              Los más pedidos
            </h2>
            <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-8">
              {FEATURED_PRODUCTS.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
          <div className="flex flex-col gap-12">
            {CATEGORIES.map((category) => (
              <CategorySection key={category.id} category={category} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
