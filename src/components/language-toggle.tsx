"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/i18n/client";
import {
  HTML_LANG,
  LOCALES,
  LOCALE_COOKIE,
  isEnabledLocale,
  localePath,
  splitLocale,
  type Locale,
} from "@/i18n/config";
import { cx } from "./ui";

/** Lets the proxy send bare URLs (like "/") to this language next time. */
function rememberLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; SameSite=Lax`;
}

/**
 * English ⇄ Manglish. Picking an enabled language reloads the same page in it
 * and remembers the choice. A language left out of ENABLED_LOCALES still looks
 * and behaves like a normal option: the switch moves, but the page stays put.
 */
export function LanguageToggle() {
  const { locale, t } = useI18n();
  const { path } = splitLocale(usePathname());
  const [picked, setPicked] = useState<Locale>(locale);

  function pick(option: Locale) {
    setPicked(option);
    if (option === locale || !isEnabledLocale(option)) return;
    rememberLocale(option);
    // A full load swaps <html lang> and re-runs the theme script before paint.
    // Keeps things like the selected ingredient (?item=…).
    window.location.assign(localePath(option, path) + window.location.search);
  }

  return (
    <div
      role="group"
      aria-label={t.header.language}
      className="flex shrink-0 rounded-full border-2 border-jade/25 p-0.5 text-[13px] font-semibold"
    >
      {LOCALES.map((option) => {
        const on = option === picked;
        return (
          <button
            key={option}
            type="button"
            lang={HTML_LANG[option]}
            aria-pressed={on}
            onClick={() => pick(option)}
            className={cx(
              "rounded-full px-3 py-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade",
              on ? "bg-jade text-on-jade" : "text-ink-soft hover:text-ink",
            )}
          >
            {t.languages[option]}
          </button>
        );
      })}
    </div>
  );
}
