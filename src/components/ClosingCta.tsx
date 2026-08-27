"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { MEDIA } from "@/lib/media";

/**
 * Closing CTA, following the reference's `cta_home_wrap`.
 *
 * The section is taller than the viewport (150svh) and holds a full-bleed
 * backdrop rendered at 105% height. As the section crosses the viewport the
 * image translates within that surplus — the reference drives this with
 * `data-scroll-container` / `data-target-translate="150"`.
 *
 * The heading lines are centred but each carries a different horizontal
 * offset, so the block reads as hand-set rather than stacked.
 */
export function ClosingCta({ children }: { children: ReactNode }) {
  const root = useRef<HTMLElement>(null);
  const visual = useRef<HTMLImageElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (!visual.current) return;

      const scrub = {
        trigger: root.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        invalidateOnRefresh: true,
      } as const;

      // 5% surplus over the frame, expressed as a share of the element's own
      // height (yPercent's basis): 5 / 105.
      const ctaSurplus = (5 / 105) * 100;

      gsap.fromTo(
        visual.current,
        { yPercent: 0 },
        { yPercent: -ctaSurplus, ease: "none", scrollTrigger: scrub },
      );

      // "Remembered" drifts rightward as the section scrolls; the rest of
      // the heading is static.
      const lastLine = root.current?.querySelector("[data-cta-drift]");
      if (lastLine) {
        gsap.fromTo(
          lastLine,
          { xPercent: -8 },
          { xPercent: 0, ease: "none", scrollTrigger: scrub },
        );
      }

      ScrollTrigger.refresh();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="contact"
      className="relative isolate flex min-h-[150svh] flex-col items-center justify-between overflow-clip py-16 sm:py-24 md:py-36"
    >
      {/* Backdrop: taller than the frame so it can drift, dimmed so the
          heading stays legible over it. */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-clip">
        <img
          ref={visual}
          src={MEDIA.ctaBg}
          alt=""
          className="absolute inset-x-0 top-0 h-[105%] w-full object-cover [object-position:50%_15%]"
        />
        <div aria-hidden className="absolute inset-0 bg-background/[0.82]" />
      </div>

      {children}
    </section>
  );
}
