/**
 * The site's languages. Every page lives under its locale (`/en/recipes`,
 * `/manglish/recipes`); `src/proxy.ts` adds the prefix to bare URLs.
 */

export const LOCALES = ["en", "manglish"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/**
 * Languages visitors can switch to. Leave one out to switch it off: the header
 * switch still moves to it, but the page stays put, and its URLs redirect to
 * English.
 */
export const ENABLED_LOCALES: readonly Locale[] = ["en", "manglish"];

export const isEnabledLocale = (locale: Locale) => ENABLED_LOCALES.includes(locale);

/** Remembers the last language picked, so bare URLs open in it. */
export const LOCALE_COOKIE = "kopi-lang";

/** Value for <html lang>. Manglish is Malaysian English. */
export const HTML_LANG: Record<Locale, string> = { en: "en", manglish: "en-MY" };

/** A piece of text in every language. */
export type Localized<T = string> = Record<Locale, T>;

export const isLocale = (value: unknown): value is Locale =>
  typeof value === "string" && (LOCALES as readonly string[]).includes(value);

export const toLocale = (value: unknown): Locale => (isLocale(value) ? value : DEFAULT_LOCALE);

/** "/recipes" in Manglish → "/manglish/recipes"; "/" → "/manglish". */
export const localePath = (locale: Locale, path: string) => `/${locale}${path === "/" ? "" : path}`;

/** "/manglish/recipes/latte" → { locale: "manglish", path: "/recipes/latte" }. */
export function splitLocale(pathname: string): { locale: Locale | null; path: string } {
  const [, first = "", ...rest] = pathname.split("/");
  if (!isLocale(first)) return { locale: null, path: pathname || "/" };
  return { locale: first, path: `/${rest.join("/")}` };
}
