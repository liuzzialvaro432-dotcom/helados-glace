"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";

import { NAV_LINKS } from "@/lib/config";

export function DesktopNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Principal" className="ml-2 hidden items-center md:flex lg:ml-6 lg:gap-1">
      {NAV_LINKS.map((link) => {
        const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-full px-2.5 py-2 text-xs font-bold tracking-[0.12em] text-primary uppercase transition-colors outline-none hover:bg-secondary focus-visible:ring-3 focus-visible:ring-ring/50",
              active && "text-pink-deep",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
