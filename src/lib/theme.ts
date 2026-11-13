/** Where the visitor's light/dark choice is saved in this browser. */
export const THEME_KEY = "kopi-theme";

/**
 * Dark mode (the dark tokens in globals.css). Set to false to keep the site
 * light whatever the system setting or saved choice; the header button then
 * only flips its own icon.
 */
export const DARK_MODE_ENABLED = true;

/** Shows the dark mode button in the header. */
export const SHOW_THEME_TOGGLE = true;

/**
 * Runs in <head> before the page paints: the saved choice, otherwise the
 * system setting (or always light while dark mode is off). Sets `data-theme`
 * on <html>, which globals.css keys off.
 */
export const THEME_SCRIPT = DARK_MODE_ENABLED
  ? `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t}catch(e){}})()`
  : `document.documentElement.dataset.theme="light"`;
