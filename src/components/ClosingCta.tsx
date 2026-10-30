import type { ReactNode } from "react";

/**
 * Closing CTA — an inverted band holding the client row, supporting copy
 * and the contact CTA.
 *
 * Its id is `work-with-me`, not `contact`: the contact form below it owns
 * #contact, which the header and footer link to, and two elements sharing
 * one id makes the anchor resolve to whichever comes first.
 *
 * Its ground and palette come from `[data-theme-section="invert"]` in
 * globals.css: the page's ramp flipped, as the footer and the About band
 * are, so `text-muted`, rules and the pill's fill/ink all follow the theme
 * stop and still read against the band — dark on the light stops, light on
 * the dark ones.
 */
export function ClosingCta({ children }: { children: ReactNode }) {
  return (
    <section
      id="work-with-me"
      // An inverted section: the bar takes the inverted pair over it and the
      // pill inside does too (see the `[data-theme-section]` rules).
      data-theme-section="invert"
      // Padded like the page's other inverted band (the highlights strip), so
      // the two read as the same kind of interruption. The image trail needs
      // room to travel, which a min-height used to force on top of the
      // padding — between them the band ran far taller than its neighbours,
      // so the height comes from the padding alone now. Desktop only: on a
      // phone the band is dropped and the FAQ leads straight into Contact.
      className="relative isolate hidden flex-col items-center justify-center overflow-clip py-28 md:flex md:py-44"
    >
      {children}
    </section>
  );
}
