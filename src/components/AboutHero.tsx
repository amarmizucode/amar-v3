"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText, DUR } from "@/lib/gsap";
import { usePageReady } from "@/components/PageTransition";
import { opticalClass } from "@/lib/optical";
import { MEDIA } from "@/lib/media";

/**
 * About-page hero. Where the home hero holds its ledes mid-frame and lands
 * the display line at the bottom, this one inverts that geometry: the display
 * type steps down the middle of the frame as a three-line staircase — with
 * photographs set into the lines as inline chips — and the ledes land along
 * the bottom edge, under a kicker row at the top. Same masked line reveal;
 * the chips then wipe open inside their lines.
 */

const CHIP_SRC = [MEDIA.services[1], MEDIA.services[3]];

/** A photograph set into a display line, sized against the type's em box. */
function Chip({ src }: { src: string }) {
  return (
    <span
      aria-hidden
      className="ah_chip relative mx-[0.12em] inline-block h-[0.72em] w-[1.6em] overflow-hidden rounded-full align-baseline"
    >
      <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />
    </span>
  );
}

export function AboutHero() {
  const root = useRef<HTMLElement>(null);
  const start = usePageReady();

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const split = (sel: string) =>
        gsap.utils
          .toArray<HTMLElement>(sel, root.current)
          .map((el) => new SplitText(el, { type: "lines", linesClass: "split-line", mask: "lines" }));

      const displayLines = split(".ah_display").flatMap((s) => s.lines);
      const ledeLines = split(".ah_lede").flatMap((s) => s.lines);
      const chips = gsap.utils.toArray<HTMLElement>(".ah_chip", root.current);
      const chipImgs = gsap.utils.toArray<HTMLElement>(".ah_chip img", root.current);
      const fades = gsap.utils.toArray<HTMLElement>(".ah_fade", root.current);

      if (reduced) {
        gsap.set([...displayLines, ...ledeLines], { yPercent: 0 });
        return;
      }

      // Below the mask (and clipped shut) until `start` — set from JS so a
      // script failure leaves the page readable.
      gsap.set([...displayLines, ...ledeLines], { yPercent: 110 });
      gsap.set(chips, { clipPath: "inset(0% 100% 0% 0%)" });
      gsap.set(chipImgs, { scale: 1.35 });
      gsap.set(fades, { autoAlpha: 0 });

      if (!start) return;

      gsap
        .timeline({ defaults: { ease: "ease-transition" } })
        .to(displayLines, { yPercent: 0, duration: DUR.slow, stagger: 0.065 })
        .to(chips, { clipPath: "inset(0% 0% 0% 0%)", duration: DUR.slow, stagger: 0.12 }, "-=0.7")
        .to(chipImgs, { scale: 1, duration: DUR.slower, stagger: 0.12 }, "<")
        .to(ledeLines, { yPercent: 0, duration: DUR.slow, stagger: 0.05 }, "-=1.0")
        .to(fades, { autoAlpha: 1, duration: DUR.normal }, "-=0.7");
    },
    { scope: root, dependencies: [start] },
  );

  return (
    <section
      ref={root}
      className="relative isolate flex min-h-svh flex-col overflow-hidden shell pt-28 md:pt-32 pb-8"
    >
      {/* Kicker row along the top edge. */}
      <div className="ah_fade flex shrink-0 items-baseline justify-between text-[13px] font-medium text-muted">
        <span>(About)</span>
        <span>Chennai, India — since 2010</span>
      </div>

      {/* Display staircase, held mid-frame, with photographs set into the type. */}
      <div className="grid-12 my-auto shrink-0 gap-y-2 py-10">
        <h1 className="contents">
          <span className={`ah_display display col-span-12 ${opticalClass("Engineer")}`}>
            Engineer
            <Chip src={CHIP_SRC[0]} />
          </span>
          <span className="ah_display display col-span-12 md:col-start-3 md:col-span-10">
            <Chip src={CHIP_SRC[1]} />
            turned
          </span>
          <span
            className={`ah_display display col-span-12 md:col-start-6 md:col-span-7 ${opticalClass("Storyteller")}`}
          >
            Storyteller
          </span>
        </h1>
      </div>

      {/* Ledes land along the bottom edge; the scroll cue takes the last columns. */}
      <div className="grid-12 shrink-0 items-end gap-y-8">
        <div className="col-span-12 md:col-span-4">
          <p className="ah_lede text-lede font-semibold">
            From a software cubicle in Seattle to the wedding stages and temple corridors of
            Tamil Nadu.
          </p>
        </div>
        <div className="col-span-12 md:col-start-6 md:col-span-4">
          <p className="ah_lede text-lede font-semibold">
            Four ventures, eight books, a thousand temples and seven hundred and fifty weddings —
            all in service of one craft.
          </p>
        </div>
        {/* pr clears the fixed theme/grid pills pinned to the corner. */}
        <p className="ah_fade col-span-12 pr-14 text-[13px] font-medium text-muted md:col-start-10 md:col-span-3 md:text-right">
          (Scroll — the journey)
        </p>
      </div>
    </section>
  );
}
