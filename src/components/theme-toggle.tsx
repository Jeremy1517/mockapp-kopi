"use client";

import { useState, useSyncExternalStore } from "react";
import { useI18n } from "@/i18n/client";
import { cx } from "./ui";
import { DARK_MODE_ENABLED, THEME_KEY as KEY } from "@/lib/theme";

/**
 * Switches between the light and dark themes. The choice is saved in this
 * browser; until someone picks, the theme follows the system setting.
 * `THEME_SCRIPT` in src/lib/theme.ts applies it before first paint, so the page never flashes.
 *
 * While DARK_MODE_ENABLED is false the button still flips between moon and sun,
 * but the page stays light.
 */

type Theme = "light" | "dark";

const apply = (theme: Theme) => {
  document.documentElement.dataset.theme = theme;
};

const saved = (): Theme | null => {
  try {
    const t = localStorage.getItem(KEY);
    return t === "light" || t === "dark" ? t : null;
  } catch {
    return null;
  }
};

function subscribe(onChange: () => void) {
  const system = window.matchMedia("(prefers-color-scheme: dark)");
  const preferred = (): Theme =>
    DARK_MODE_ENABLED ? (saved() ?? (system.matches ? "dark" : "light")) : "light";
  // React can drop the attribute when the root layout re-renders; put it back.
  const restore = () => {
    if (!document.documentElement.dataset.theme) apply(preferred());
    onChange();
  };
  const root = new MutationObserver(restore);
  root.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  restore();
  // With no saved choice, keep following the system setting while the page is open.
  const follow = () => {
    if (!saved() || !DARK_MODE_ENABLED) apply(preferred());
  };
  system.addEventListener("change", follow);
  return () => {
    root.disconnect();
    system.removeEventListener("change", follow);
  };
}

const current = (): Theme => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");

export function ThemeToggle() {
  // null on the server; until then the icons switch with CSS, so nothing flashes.
  const theme = useSyncExternalStore(subscribe, current, () => null);
  // What the button shows once clicked. With dark mode off, only this changes.
  const [shown, setShown] = useState<Theme | null>(null);
  const displayed = shown ?? theme;
  const { t } = useI18n();

  function toggle() {
    const next: Theme = (displayed ?? current()) === "dark" ? "light" : "dark";
    setShown(next);
    if (!DARK_MODE_ENABLED) return;
    apply(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // Private mode or storage blocked: the switch still works for this visit.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t.header.darkMode}
      aria-pressed={displayed === null ? undefined : displayed === "dark"}
      title={t.header.darkMode}
      className="flex size-10 items-center justify-center rounded-full border-2 border-jade/25 text-jade transition-colors hover:border-jade focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade"
    >
      {/* Moon in light mode, sun in dark mode */}
      <svg
        viewBox="0 0 24 24"
        className={cx("size-5", displayed === null ? "dark:hidden" : displayed === "dark" && "hidden")}
        aria-hidden="true"
      >
        <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" fill="currentColor" />
      </svg>
      <svg
        viewBox="0 0 24 24"
        className={cx("size-5", displayed === null ? "hidden dark:block" : displayed === "light" && "hidden")}
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <circle cx="12" cy="12" r="4.2" fill="currentColor" stroke="none" />
        <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
      </svg>
    </button>
  );
}
