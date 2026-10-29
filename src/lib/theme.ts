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

/* Inline, so it runs as <body> is parsed — before React, before paint. It also
   sets the header's ink pair, which SiteHeader would otherwise only correct
   after hydration. */
export const GALLERY_THEME_SCRIPT = `try{if(new RegExp(${JSON.stringify(
  GALLERY_PATH.source,
)}).test(location.pathname)){var b=document.body;b.dataset.theme=${JSON.stringify(
  String(GALLERY_STOP).padStart(2, "0"),
)};b.dataset.themeNav="dark"}}catch(e){}`;
