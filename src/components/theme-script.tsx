"use client";

import { THEME_SCRIPT } from "@/lib/theme";

/**
 * Runs the theme script while the HTML is parsed, before first paint. On the
 * client the tag becomes inert text (React never runs scripts it renders), and
 * suppressHydrationWarning accepts the different `type`.
 */
export function ThemeScript() {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }}
    />
  );
}
