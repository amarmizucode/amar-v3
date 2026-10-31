/**
 * Route-driven theme stops. A gallery detail page (/photography/<slug>) is
 * shown on the ramp's black stop, whatever the ramp is otherwise on.
 *
 * Shared by AppControls, which owns `data-theme` on <body> from mount on, and
 * the root layout's pre-paint script, which sets it before the first paint so
 * a gallery never shows the white stop first and fades to black.
 */
export const GALLERY_PATH = /^\/photography\/[^/]+/;
export const GALLERY_STOP = 0;

/* Inline, so it runs as <body> is parsed — before React, before paint. The
   header's ink pair needs no correction here: it is the "page" pair, a tone of
   whichever stop is active, so the black stop alone gives it light ink. */
export const GALLERY_THEME_SCRIPT = `try{if(new RegExp(${JSON.stringify(
  GALLERY_PATH.source,
)}).test(location.pathname)){document.body.dataset.theme=${JSON.stringify(
  String(GALLERY_STOP).padStart(2, "0"),
)}}}catch(e){}`;

/**
 * The slider's chosen stop, kept across reloads. AppControls writes it; the
 * script below reads it as <body> is parsed, so a reload paints the saved
 * stop rather than the server's white one and fading over. With nothing
 * saved it applies AppControls' own fallback, black for a dark-scheme device.
 */
export const THEME_STORAGE_KEY = "amar:theme";

export const THEME_SCRIPT = `try{var s=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});if(s===null||!/^(0\\d|1[0-6])$/.test(s))s=matchMedia("(prefers-color-scheme: dark)").matches?"00":null;if(s)document.body.dataset.theme=s}catch(e){}`;
