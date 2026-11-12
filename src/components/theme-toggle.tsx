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
 * While DARK_MODE_ENABLED is false the button still flips between kopi and teh tarik,
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
      {/* A cup of kopi in light mode (switch to dark), teh tarik in dark mode (switch to light). */}
      <svg
        viewBox="0 0 24 24"
        className={cx("size-6", displayed === null ? "dark:hidden" : displayed === "dark" && "hidden")}
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9.5 2.8c-.9 1 .9 1.7 0 2.8M13 2.8c-.9 1 .9 1.7 0 2.8" strokeWidth="1.4" />
        <path d="M4.5 8.5h13v5.5a5 5 0 0 1-5 5h-3a5 5 0 0 1-5-5V8.5Z" fill="#4a2414" />
        <path d="M5.4 10.3h11.2" stroke="#b9773f" strokeWidth="1.5" strokeLinecap="butt" />
        <path d="M17.5 10h1.3a2.4 2.4 0 0 1 0 4.8h-1.5" />
        <path d="M3 21.3h16" />
      </svg>
      <svg
        viewBox="0 0 24 24"
        className={cx("size-6", displayed === null ? "hidden dark:block" : displayed === "light" && "hidden")}
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Tea, then the thick pulled froth spilling over the rim, then the glass. */}
        <path
          d="M6.5 9.5h11l-1.2 10.6a1.8 1.8 0 0 1-1.8 1.6h-5a1.8 1.8 0 0 1-1.8-1.6L6.5 9.5Z"
          fill="#b97a45"
          stroke="none"
        />
        <path d="M6.6 9.4h10.8l-.2 2.1H6.8Z" fill="#fff4e2" stroke="none" />
        {[
          [8.3, 9.2, 1.9],
          [11, 8.1, 2.4],
          [14, 8.3, 2.2],
          [16, 9.3, 1.7],
        ].map(([x, y, r]) => (
          <circle key={x} cx={x} cy={y} r={r} fill="#fff4e2" stroke="none" />
        ))}
        <path d="M6.5 9.5l1.2 10.6a1.8 1.8 0 0 0 1.8 1.6h5a1.8 1.8 0 0 0 1.8-1.6l1.2-10.6" />
      </svg>
    </button>
  );
}
