import type { Metadata } from "next";
import { WifiOffIcon } from "lucide-react";

import { ReloadButton } from "@/components/reload-button";

export const metadata: Metadata = { title: "Sin conexión", robots: { index: false } };

export default function OfflinePage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-20 text-center">
      <span className="brand-mask grid size-24 place-items-center bg-secondary text-primary">
        <WifiOffIcon className="size-10" aria-hidden="true" />
      </span>
      <h1 className="text-3xl font-bold text-primary">Estás sin conexión</h1>
      <p className="text-base text-muted-foreground">
        Tu pedido y tus cupones siguen guardados. Cuando vuelva la señal, podés terminar y enviar tu pedido.
      </p>
      <ReloadButton />
    </div>
  );
}
