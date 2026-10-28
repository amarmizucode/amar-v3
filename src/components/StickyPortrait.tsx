"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/* Where the portrait holds: clear of the fixed header bar. */
const TOP = 120;

/**
 * Holds its children in view while the rest of the enclosing section
 * scrolls past — the About portrait beside its statements, numbers and
 * awards. The hold ends when the portrait's foot meets the section's last
 * content (its bottom padding excluded), so it never runs into the next
 * section.
 *
 * Pinned through ScrollTrigger rather than `position: sticky`: ScrollSmoother
 * translates #smooth-content instead of scrolling it, so sticky has no
 * scrollport to resolve against (see GapSection). Desktop only — below md
 * the portrait stacks above the copy, and holding it would cover the text.
 *
 * Put this inside the grid cell, not on it: the pin wraps its element in a
 * spacer, which would otherwise take the cell's place in the grid.
 */
export function StickyPortrait({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      const band = el?.closest("section");
      if (!el || !band) return;

      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        ScrollTrigger.create({
          trigger: el,
          start: `top ${TOP}px`,
          end: () => {
            const pad = parseFloat(getComputedStyle(band).paddingBottom) || 0;
            const travel =
              band.getBoundingClientRect().bottom - pad - el.getBoundingClientRect().bottom;
            return `+=${Math.max(0, travel)}`;
          },
          pin: true,
          pinSpacing: false,
          invalidateOnRefresh: true,
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return <div ref={root}>{children}</div>;
}
