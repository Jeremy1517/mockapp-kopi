import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isEnabledLocale, splitLocale, toLocale } from "@/i18n/config";

/**
 * Every page lives under a language: `/en/...` or `/manglish/...`. A URL
 * without one is sent to the visitor's last choice (a cookie set by the
 * language switch), otherwise English. A language that's switched off (see
 * ENABLED_LOCALES) redirects to the same page in English.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const current = splitLocale(pathname);
  if (current.locale && isEnabledLocale(current.locale)) return NextResponse.next();

  const saved = toLocale(request.cookies.get(LOCALE_COOKIE)?.value ?? DEFAULT_LOCALE);
  const locale = isEnabledLocale(saved) ? saved : DEFAULT_LOCALE;
  const path = current.locale ? current.path : pathname;
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${path === "/" ? "" : path}`;
  url.search = search;
  return NextResponse.redirect(url);
}

export const config = {
  // Pages only: skip the API, Next's own files and anything with a file extension.
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
