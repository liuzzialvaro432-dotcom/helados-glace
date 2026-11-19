import type { Metadata } from "next";
import { cn } from "cn";
import { MapPinIcon, PhoneIcon } from "lucide-react";

import { OrderHereButton } from "@/components/order-here-button";
import { PageHeader, PageShell } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { BRANCHES, type Branch } from "@/data/branches";
import { weeklyHoursSummary } from "@/lib/hours";

export const metadata: Metadata = {
  title: "Sucursales",
  description: "Direcciones, teléfonos y cómo llegar a cada sucursal de Helados Glacé.",
};

function BranchCard({ branch }: { branch: Branch }) {
  const phoneDigits = branch.phone?.replace(/\D/g, "").replace(/^0/, "595");
  return (
    <li className="flex flex-col gap-3 rounded-3xl border bg-card p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-xl font-bold text-primary">{branch.name}</h3>
        {branch.orderBranchId !== null && (
          <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-secondary-foreground">
            Recibe pedidos online
          </span>
        )}
      </div>
      <p className="flex items-start gap-2 text-sm">
        <MapPinIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        {branch.address}
      </p>
      {branch.phone && phoneDigits && (
        <p className="flex items-center gap-2 text-sm">
          <PhoneIcon className="size-4 shrink-0 text-primary" aria-hidden="true" />
          <a
            href={`tel:+${phoneDigits}`}
            className="rounded-sm font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {branch.phone}
          </a>
        </p>
      )}
      <div className="mt-auto flex flex-wrap gap-2 pt-2">
        {branch.orderBranchId !== null && (
          <OrderHereButton branchId={branch.orderBranchId} branchName={branch.name} />
        )}
        <a
          href={branch.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 rounded-full px-5")}
        >
          Cómo llegar
          <span className="sr-only"> a {branch.name} (se abre Google Maps)</span>
        </a>
      </div>
    </li>
  );
}

export default function BranchesPage() {
  const online = BRANCHES.filter((branch) => branch.orderBranchId !== null);
  const others = BRANCHES.filter((branch) => branch.orderBranchId === null);
  const hours = weeklyHoursSummary();
  return (
    <PageShell>
      <PageHeader eyebrow="Dónde estamos" title="Sucursales">
        {BRANCHES.length} sucursales en Asunción, Gran Asunción y el interior. Elegí la que te queda más cerca.
      </PageHeader>

      <section aria-labelledby="online-titulo" className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 id="online-titulo" className="text-2xl font-bold text-primary">
            Con pedidos online
          </h2>
          <p className="text-sm text-muted-foreground">
            Delivery y retiro: {hours.map((row) => `${row.days.toLowerCase()} de ${row.hours}`).join("; ")}.
          </p>
        </div>
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {online.map((branch) => (
            <BranchCard key={branch.id} branch={branch} />
          ))}
        </ul>
      </section>

      <section aria-labelledby="otras-titulo" className="flex flex-col gap-4">
        <h2 id="otras-titulo" className="text-2xl font-bold text-primary">
          Más sucursales
        </h2>
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {others.map((branch) => (
            <BranchCard key={branch.id} branch={branch} />
          ))}
        </ul>
      </section>
    </PageShell>
  );
}
