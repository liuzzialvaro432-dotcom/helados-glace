"use client";

import { RotateCwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ReloadButton() {
  return (
    <Button size="xl" onClick={() => window.location.reload()} className="rounded-full">
      <RotateCwIcon aria-hidden="true" />
      Reintentar
    </Button>
  );
}
