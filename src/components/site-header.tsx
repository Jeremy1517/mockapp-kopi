import Link from "next/link";

export function Logo() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className="size-8">
      <rect width="32" height="32" rx="8" className="fill-kopi-700" />
      <path
        d="M9 13h12v5a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5v-5Z"
        className="fill-kopi-100"
      />
      <path
        d="M21 14.5h1.25a2.25 2.25 0 0 1 0 4.5H21"
        fill="none"
        strokeWidth="1.6"
        className="stroke-kopi-100"
      />
      <path
        d="M13 8.5c0 1-1 1.25-1 2.25M16.5 8.5c0 1-1 1.25-1 2.25"
        fill="none"
        strokeWidth="1.4"
        strokeLinecap="round"
        className="stroke-kopi-300"
      />
    </svg>
  );
}

const links = [
  { href: "/file", label: "File a return" },
  { href: "/submissions", label: "Submissions" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo />
          <span className="text-base font-semibold tracking-tight text-stone-900">
            Kopi<span className="text-kopi-600">Tax</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm font-medium">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-2 text-stone-600 transition hover:bg-stone-100 hover:text-stone-900"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
