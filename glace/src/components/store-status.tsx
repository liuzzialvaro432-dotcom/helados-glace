"use client";

import { cn } from "cn";

import { useNow } from "@/lib/hooks";
import { getStoreStatus, statusLabel } from "@/lib/hours";

export function StoreStatusChip({ className, tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  const now = useNow();
  if (!now) {
    return <span aria-hidden="true" className={cn("inline-flex h-7 w-40 rounded-full", tone === "dark" ? "bg-white/20" : "bg-muted", className)} />;
  }
  const status = getStoreStatus(now);
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-2 rounded-full px-3 text-xs font-semibold whitespace-nowrap",
        tone === "dark" ? "bg-white/95 text-foreground" : "bg-muted text-foreground",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("size-2 rounded-full", status.open ? "bg-brand" : "bg-destructive")}
      />
      {statusLabel(status)}
    </span>
  );
}
