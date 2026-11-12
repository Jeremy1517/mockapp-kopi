/** Where the visitor's light/dark choice is saved in this browser. */
export const THEME_KEY = "kopi-theme";

/**
 * Dark mode is fully built (the dark tokens in globals.css) but switched off
 * for now: the site always renders light, ignoring the system setting and any
 * saved choice, and the header button only flips its own icon. Set this to
 * true to turn dark mode back on.
 */
export const DARK_MODE_ENABLED = false;

/** The dark mode button is hidden from the header for now. Set to true to show it again. */
export const SHOW_THEME_TOGGLE = false;

/**
 * Runs in <head> before the page paints: the saved choice, otherwise the
 * system setting (or always light while dark mode is off). Sets `data-theme`
 * on <html>, which globals.css keys off.
 */
export const THEME_SCRIPT = DARK_MODE_ENABLED
  ? `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t}catch(e){}})()`
  : `document.documentElement.dataset.theme="light"`;
