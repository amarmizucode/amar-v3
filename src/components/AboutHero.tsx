"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText, DUR } from "@/lib/gsap";
import { usePageReady } from "@/components/PageTransition";
import { opticalClass } from "@/lib/optical";

/**
 * About-page hero, set to the home hero's geometry: a full viewport with the
 * lede copy held mid-frame and the display line landing at the bottom edge.
 * Same masked line reveal, minus the home page's dot shader and navbar
 * choreography — the navbar has already played by the time anyone gets here.
 */
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

      const ledeLines = split(".about_hero_p").flatMap((s) => s.lines);
      const displayLines = split(".about_hero_display").flatMap((s) => s.lines);

      if (reduced) {
        gsap.set([...ledeLines, ...displayLines], { yPercent: 0 });
        return;
      }

      // Below the mask until `start` — set from JS so a script failure leaves
      // the page readable.
      gsap.set([...ledeLines, ...displayLines], { yPercent: 110 });

      if (!start) return;

      gsap
        .timeline({ defaults: { ease: "ease-transition" } })
        .to(ledeLines, { yPercent: 0, duration: DUR.slow, stagger: 0.05 })
        .to(displayLines, { yPercent: 0, duration: DUR.slow, stagger: 0.065 }, "-=0.85");
    },
    { scope: root, dependencies: [start] },
  );

  return (
    <section
      ref={root}
      className="relative isolate flex min-h-svh flex-col overflow-hidden shell pt-28 md:pt-32 pb-8"
    >
      <div className="grid-12 my-auto shrink-0 gap-y-8">
        <div className="col-span-12 md:col-span-4">
          <p className="about_hero_p text-lede font-semibold">
            From a software cubicle in Seattle to the wedding stages and temple corridors of
            Tamil Nadu.
          </p>
        </div>
        <div className="col-span-12 md:col-start-6 md:col-span-4">
          <p className="about_hero_p text-lede font-semibold">
            Four ventures, seven books, a thousand temples and seven hundred and fifty weddings —
            all in service of one craft.
          </p>
        </div>
      </div>

      <div className="grid-12 shrink-0 pt-20 md:pt-32">
        <h1 className="contents">
          <span className={`about_hero_display display col-span-12 ${opticalClass("Engineer")}`}>
            Engineer to
          </span>
          <span
            className={`about_hero_display display col-span-12 md:col-start-6 md:col-span-7 ${opticalClass("Storyteller")}`}
          >
            Storyteller
          </span>
        </h1>
      </div>
    </section>
  );
}
