import Link from "next/link";
import { cn } from "cn";
import { IceCreamConeIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-20 text-center">
      <span className="brand-mask grid size-24 place-items-center bg-secondary text-primary">
        <IceCreamConeIcon className="size-10" aria-hidden="true" />
      </span>
      <h1 className="text-3xl font-bold text-primary">Esta página se derritió</h1>
      <p className="text-base text-muted-foreground">
        No encontramos lo que buscabas. El menú completo te espera en el inicio.
      </p>
      <Link href="/" className={cn(buttonVariants({ size: "xl" }), "rounded-full")}>
        Ir al menú
      </Link>
    </div>
  );
}
