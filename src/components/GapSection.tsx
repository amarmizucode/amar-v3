"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, SplitText, DUR } from "@/lib/gsap";
import { MEDIA } from "@/lib/media";

/**
 * "I close that gap" — a 200svh wrapper with a 100svh pinned stage. As it
 * scrubs: the two headings travel in from ±30vw, the cover irises open from a
 * centre point, and each heading's characters fly in from the outside edge.
 * Mirrors the reference implementation's geometry and easing.
 */
export function GapSection() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const headings = gsap.utils.toArray<HTMLElement>(".gap_inner_heading");

      if (reduced) {
        gsap.set(".gap_heading-contain", { x: 0 });
        gsap.set(".gap_cover", { clipPath: "inset(0% 0% 0% 0%)" });
        return;
      }

      const scrub = {
        trigger: root.current,
        start: "top 50%",
        end: "bottom top",
        scrub: true,
        invalidateOnRefresh: true,
      } as const;

      // The stage used to hold itself in place with `position: sticky`, but
      // ScrollSmoother translates #smooth-content rather than really scrolling
      // it, so sticky has nothing to resolve against. Pinning through
      // ScrollTrigger reproduces the same 100svh hold across the 200svh wrapper
      // and is what the smoother is built to cooperate with.
      ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "bottom bottom",
        pin: ".gap_contain",
        pinSpacing: false,
        invalidateOnRefresh: true,
      });

      // The cover irises open at every width.
      gsap.fromTo(
        ".gap_cover",
        { clipPath: "inset(50% 50% 50% 50%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: DUR.slow,
          ease: "ease-transition",
          scrollTrigger: scrub,
        },
      );

      // The halves only travel inward on wider screens — below md they are
      // stacked, so there is no gap to close.
      gsap.matchMedia().add("(min-width: 768px)", () => {
        const tween = gsap.to(".gap_heading-contain", {
          x: "0vw",
          duration: DUR.slow,
          ease: "ease-transition",
          scrollTrigger: scrub,
        });

        return () => {
          tween.scrollTrigger?.kill();
          gsap.set(".gap_heading-contain", { clearProps: "x" });
        };
      });

      // Per-character convergence: the left heading resolves from its end, the
      // right from its start, so the two meet at the centre.
      headings.forEach((heading) => {
        const isLeft = heading.classList.contains("is-left");

        SplitText.create(heading, {
          type: "words,chars",
          autoSplit: true,
          wordsClass: "gap_word",
          onSplit(self) {
            gsap.set(self.chars, {
              display: "inline-block",
              x: isLeft ? -80 : 80,
              scaleY: 0.95,
              opacity: 0,
            });

            return gsap.to(self.chars, {
              keyframes: {
                "40%": { opacity: 1 },
                "90%": { x: 0, scaleY: 1 },
                "100%": {},
              },
              duration: 1,
              ease: "expo.out",
              stagger: { each: 0.022, from: isLeft ? "end" : "start" },
              scrollTrigger: scrub,
            });
          },
        });
      });

      ScrollTrigger.refresh();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="gap_wrap relative h-[200svh] bg-background text-foreground">
      <div className="gap_contain isolate h-svh overflow-hidden">
        {/* Cover: 4/5 portrait, centred, irises open on scrub. */}
        <div
          className="gap_cover absolute left-1/2 top-1/2 aspect-[3/4] w-[47vw] -translate-x-1/2 -translate-y-1/2 overflow-hidden md:aspect-[4/5] md:w-[var(--column-width-4,18rem)] md:max-w-[16rem]"
          style={{ clipPath: "inset(50% 50% 50% 50%)" }}
        >
          <img src={MEDIA.gap} alt="" className="gap_image absolute inset-0 h-full w-full object-cover" />
        </div>

        {/* Headings sit above the cover and travel inward, in the normal text
            colour. Below md they stack to two lines, so the block is centred a
            little above the midpoint to leave the supporting copy its room. */}
        <div className="absolute left-0 top-[44%] z-10 flex w-full -translate-y-1/2 items-center justify-center md:top-1/2">
          {/* gap-[0.28em] keeps "CLOSE" and "THAT" apart once both halves
              have converged to x:0. */}
          <h2 className="flex w-full flex-col items-center justify-center gap-0 px-[5vw] md:w-auto md:flex-row md:gap-[clamp(0.75rem,1.9vw,1.75rem)] md:px-0">
            <span className="gap_heading-contain is-left inline-block translate-x-0 md:translate-x-[-30vw]">
              <span className="gap_inner_heading is-left display whitespace-nowrap !text-[62px] !leading-[1.02] !tracking-[-0.098em] md:!text-[clamp(2.75rem,6.64vw,6.375rem)] md:!leading-[0.95] md:!tracking-[-0.055em]">
                I Close
              </span>
            </span>
            <span className="gap_heading-contain is-right inline-block translate-x-0 md:translate-x-[30vw]">
              <span className="gap_inner_heading is-right display whitespace-nowrap !text-[62px] !leading-[1.02] !tracking-[-0.098em] md:!text-[clamp(2.75rem,6.64vw,6.375rem)] md:!leading-[0.95] md:!tracking-[-0.055em]">
                That Gap
              </span>
            </span>
          </h2>
        </div>

        {/* Supporting copy pinned to the lower third of the stage. */}
        <p className="absolute bottom-[4svh] left-1/2 w-full max-w-[38ch] -translate-x-1/2 text-balance px-6 text-center text-[0.9375rem] font-medium leading-[1.35] text-muted md:bottom-[6svh] md:text-[clamp(1rem,1.4vw,1.25rem)]">
          I uncover the people, purpose and stories behind the work — and turn them into
          photography, films, documentaries and experiences that make your impact understood, felt
          and remembered.
        </p>
      </div>
    </section>
  );
}
