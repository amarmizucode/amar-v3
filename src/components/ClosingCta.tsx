import type { CSSProperties, ReactNode } from "react";

/**
 * Closing CTA — a solid black band holding the client row, supporting copy
 * and the contact CTA.
 *
 * Its id is `work-with-me`, not `contact`: the contact form below it owns
 * #contact, which the header and footer link to, and two elements sharing
 * one id makes the anchor resolve to whichever comes first.
 *
 * The palette variables are pinned to a white-on-black ramp here because the
 * body's theme ramp re-points them per scroll stop: without the local
 * override, `text-muted`, rules and the pill's fill/ink would follow the page
 * theme and could vanish against the fixed black backdrop. Exported for the
 * other black band on the page, the About section, so both pin identically.
 */
export const BLACK_PALETTE = {
  "--palette-background": "#000000",
  "--palette-foreground": "#ffffff",
  "--palette-muted": "rgb(255 255 255 / 0.5)",
  "--palette-rule": "rgb(255 255 255 / 0.15)",
  "--palette-chip": "rgb(255 255 255 / 0.05)",
  "--color-hover-fill": "#ffffff",
  "--color-hover-ink": "#000000",
} as CSSProperties;

export function ClosingCta({ children }: { children: ReactNode }) {
  return (
    <section
      id="work-with-me"
      style={BLACK_PALETTE}
      // A dark section: the bar turns beige over it and the pill inside takes
      // the dark pair (see the `[data-theme-section]` rules in globals.css).
      data-theme-section="dark"
      // Padded like the page's other black band (the highlights strip), so
      // the two read as the same kind of interruption. The image trail needs
      // room to travel, which a min-height used to force on top of the
      // padding — between them the band ran far taller than its neighbours,
      // so the height comes from the padding alone now. Desktop only: on a
      // phone the band is dropped and the FAQ leads straight into Contact.
      className="relative isolate hidden flex-col items-center justify-center overflow-clip bg-black text-white py-28 md:flex md:py-44"
    >
      {children}
    </section>
  );
}
