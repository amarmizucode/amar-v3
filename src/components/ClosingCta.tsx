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
 * theme and could vanish against the fixed black backdrop.
 */
const BLACK_PALETTE = {
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
      className="relative isolate flex min-h-[70svh] flex-col items-center justify-center overflow-clip bg-black text-white py-16 sm:py-20 md:py-24"
    >
      {children}
    </section>
  );
}
