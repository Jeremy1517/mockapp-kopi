import Link from "next/link";
import { localePath } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { SHOW_THEME_TOGGLE } from "@/lib/theme";
import { LanguageToggle } from "./language-toggle";
import { NavLinks } from "./nav-links";
import { ThemeToggle } from "./theme-toggle";

/** An enamel mug: white body, jade rim. */
function Logo() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className="size-10 shrink-0">
      <path
        d="M9 12h19v14a7 7 0 0 1-7 7h-5a7 7 0 0 1-7-7V12Z"
        fill="var(--color-ceramic)"
        stroke="var(--color-cup-line)"
        strokeWidth="2.5"
      />
      <path d="M9 12h19" stroke="var(--color-cup-line)" strokeWidth="5" />
      <path d="M28 16h2.5a4 4 0 0 1 0 8H28" fill="none" stroke="var(--color-jade)" strokeWidth="2.5" />
      <path d="M15 21.5c0-1.6 1.2-2.5 3.5-2.5s3.5.9 3.5 2.5-1.2 2.5-3.5 2.5-3.5-.9-3.5-2.5Z" fill="#5b3421" />
    </svg>
  );
}

export async function SiteHeader() {
  const { locale, t } = await getI18n();
  return (
    <header className="bg-porcelain">
      <div className="tile-strip h-3.5" aria-hidden="true" />
      {/* Phones: logo and switches on top, nav below. Wider: logo, nav, switches. */}
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Link
          href={localePath(locale, "/")}
          className="flex items-center gap-2.5 rounded-md text-jade focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-jade"
        >
          <Logo />
          <span className="font-sign text-lg leading-none">{t.meta.title}</span>
        </Link>
        <div className="order-3 w-full md:order-2 md:ml-auto md:w-auto">
          <NavLinks />
        </div>
        <div className="order-2 flex items-center gap-2 md:order-3">
          <LanguageToggle />
          {SHOW_THEME_TOGGLE && <ThemeToggle />}
        </div>
      </div>
      <div className="h-px bg-tile" />
    </header>
  );
}
