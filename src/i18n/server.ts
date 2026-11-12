import { lang } from "next/root-params";
import { getDictionary } from ".";
import { toLocale, type Locale } from "./config";

/**
 * The current page's language, for Server Components. Every page sits under
 * `app/[lang]`, so `lang` is a root param and needs no prop drilling.
 */
export async function getLocale(): Promise<Locale> {
  return toLocale(await lang());
}

/** The current page's dictionary and locale. */
export async function getI18n() {
  const locale = await getLocale();
  return { locale, t: getDictionary(locale) };
}
