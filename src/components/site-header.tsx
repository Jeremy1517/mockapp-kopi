import Link from "next/link";
import { NavLinks } from "./nav-links";

/** An enamel mug: white body, jade rim. */
function Logo() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className="size-10 shrink-0">
      <path
        d="M9 12h19v14a7 7 0 0 1-7 7h-5a7 7 0 0 1-7-7V12Z"
        fill="#fff"
        stroke="var(--color-jade)"
        strokeWidth="2.5"
      />
      <path d="M9 12h19" stroke="var(--color-jade)" strokeWidth="5" />
      <path d="M28 16h2.5a4 4 0 0 1 0 8H28" fill="none" stroke="var(--color-jade)" strokeWidth="2.5" />
      <path d="M15 21.5c0-1.6 1.2-2.5 3.5-2.5s3.5.9 3.5 2.5-1.2 2.5-3.5 2.5-3.5-.9-3.5-2.5Z" fill="#5b3421" />
    </svg>
  );
}

export function SiteHeader() {
  return (
    <header className="bg-porcelain">
      <div className="tile-strip h-3.5" aria-hidden="true" />
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-md text-jade focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-jade"
        >
          <Logo />
          <span className="font-sign text-lg leading-none">Kopi Counter</span>
        </Link>
        <NavLinks />
      </div>
      <div className="h-px bg-tile" />
    </header>
  );
}
