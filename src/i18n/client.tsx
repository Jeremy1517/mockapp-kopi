"use client";

import { createContext, useContext, type ReactNode } from "react";
import { getDictionary } from ".";
import { DEFAULT_LOCALE, localePath, type Locale } from "./config";

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

/** Set once in the root layout; Client Components read it with `useI18n`. */
export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

/** The current locale, its dictionary, and a helper that prefixes links with the locale. */
export function useI18n() {
  const locale = useContext(LocaleContext);
  return { locale, t: getDictionary(locale), href: (path: string) => localePath(locale, path) };
}
