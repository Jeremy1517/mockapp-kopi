"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "./ui";

const links = [
  { href: "/", label: "Shelf" },
  { href: "/recipes", label: "Recipes" },
  { href: "/log", label: "Bar log" },
] as const;

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="-mx-3 flex items-center text-[15px] font-semibold">
      {links.map(({ href, label }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cx(
              "relative rounded-full px-3 py-2 transition-colors focus-visible:outline-2 focus-visible:outline-jade",
              active ? "text-jade" : "text-ink-soft hover:text-ink",
            )}
          >
            {label}
            {active && (
              <span className="absolute inset-x-3 -bottom-0.5 h-1 rounded-full bg-kaya" aria-hidden="true" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
