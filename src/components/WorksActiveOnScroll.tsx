"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, NO_HOVER, ScrollTrigger } from "@/lib/gsap";

/**
 * Selected work's hover reveal, driven by scroll on touch. Each row takes
 * `is-active` while its cover crosses the middle of the viewport — on as the
 * cover scrolls in, off as it scrolls out, in either direction — and the CSS
 * gives `is-active` the same overlay and swinging second frame as hover.
 *
 * The trigger is the cover, not the row: on a phone the row runs well past
 * the screen with its copy, so the row's own bounds would switch the frame
 * on and off while the cover was out of view.
 */
export function WorksActiveOnScroll({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_HOVER, () => {
        gsap.utils.toArray<HTMLElement>(".works_item", root.current).forEach((item) => {
          const cover = item.querySelector<HTMLElement>(".works_cover");
          if (!cover) return;
          ScrollTrigger.create({
            trigger: cover,
            start: "top 70%",
            end: "bottom 30%",
            toggleClass: { targets: item, className: "is-active" },
          });
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return <div ref={root}>{children}</div>;
}
