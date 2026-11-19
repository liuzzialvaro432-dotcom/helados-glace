import Link from "next/link";

import { AnniversaryTag, Wordmark } from "@/components/brand";
import { CartButton } from "@/components/cart/cart-button";
import { DesktopNav } from "@/components/layout/desktop-nav";
import { StoreStatusChip } from "@/components/store-status";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-lg p-1 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Wordmark className="h-8" />
          <AnniversaryTag />
        </Link>
        <DesktopNav />
        <div className="ml-auto flex items-center gap-3">
          <StoreStatusChip className="hidden xl:inline-flex" />
          <CartButton />
        </div>
      </div>
    </header>
  );
}
