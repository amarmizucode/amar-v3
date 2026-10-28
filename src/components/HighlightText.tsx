"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText } from "@/lib/gsap";

/**
 * Scrub-linked reading highlight: characters sit at low opacity and resolve to
 * full as the block travels up the viewport, line by line. Port of the
 * reference's `data-highlight-text` handler (`St`).
 */
export function HighlightText({
  children,
  className = "",
  start = "top 100%",
  end = "center 40%",
  fade = 0.2,
  stagger = 0.1,
  lineStagger = 0.3,
}: {
  children: ReactNode;
  className?: string;
  start?: string;
  end?: string;
  fade?: number;
  stagger?: number;
  lineStagger?: number;
}) {
  const el = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const target = el.current;
      if (!target) return;

      SplitText.create(target, {
        type: "lines, words, chars",
        autoSplit: true,
        // Links inside the copy (the About statement's disciplines) never
        // straddle a line, so there is nothing to slice — and slicing left
        // an empty clone of each link behind, an extra stop in the tab order.
        deepSlice: false,
        onSplit(self) {
          return gsap.context(() => {
            // Group chars by the line that contains them, then stagger per line.
            const lines = self.lines.map((line) =>
              self.chars.filter((char) => line.contains(char)),
            );

            const tl = gsap.timeline({
              scrollTrigger: { scrub: true, trigger: target, start, end },
            });

            lines.forEach((chars, i) => {
              tl.from(chars, { autoAlpha: fade, stagger, ease: "linear" }, i * lineStagger);
            });
          });
        },
      });
    },
    { scope: el },
  );

  return (
    <p ref={el} className={className}>
      {children}
    </p>
  );
}
