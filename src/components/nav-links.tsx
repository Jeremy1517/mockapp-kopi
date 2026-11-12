"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/i18n/client";
import { splitLocale } from "@/i18n/config";
import { cx } from "./ui";

export function NavLinks() {
  const { t, href } = useI18n();
  const { path } = splitLocale(usePathname());
  const links = [
    { to: "/", label: t.nav.shelf },
    { to: "/recipes", label: t.nav.recipes },
    { to: "/log", label: t.nav.log },
  ];

  return (
    <nav aria-label={t.nav.label} className="-mx-3 flex items-center text-[15px] font-semibold">
      {links.map(({ to, label }) => {
        const active = to === "/" ? path === "/" : path.startsWith(to);
        return (
          <Link
            key={to}
            href={href(to)}
            aria-current={active ? "page" : undefined}
            className={cx(
              "relative rounded-full px-3 py-2 whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-jade",
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
