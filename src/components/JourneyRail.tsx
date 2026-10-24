"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { SectionLabel } from "@/components/SectionLabel";

export type Chapter = {
  kicker: string;
  title: string;
  blurb: string;
  image: string;
};

/**
 * The journey as a pinned horizontal ride: from md up, with motion allowed,
 * the stage pins for the section's whole scroll distance and the chapters
 * travel sideways through it — each led by a stroked chapter numeral, its
 * still drifting against the direction of travel for depth. The header's
 * hairline fills with progress and the counter ticks through the chapters.
 *
 * Everywhere else — phones, reduced motion, or no script at all — the same
 * markup lays out as a vertical chapter list: the horizontal geometry lives
 * entirely behind `motion-safe:md:` variants, mirroring the GSAP matchMedia
 * condition, so the fallback needs no JS.
 */
export function JourneyRail({ chapters }: { chapters: Chapter[] }) {
  const root = useRef<HTMLElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const stage = root.current?.querySelector<HTMLElement>(".jr_stage");
        const track = root.current?.querySelector<HTMLElement>(".jr_track");
        if (!stage || !track) return;

        const distance = () => track.scrollWidth - stage.clientWidth;

        const ride = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => "+=" + distance(),
            scrub: true,
            pin: stage,
            invalidateOnRefresh: true,
            onUpdate(self) {
              if (barRef.current) gsap.set(barRef.current, { scaleX: self.progress });
              if (counterRef.current) {
                const i = Math.round(self.progress * (chapters.length - 1)) + 1;
                counterRef.current.textContent = String(i).padStart(2, "0");
              }
            },
          },
        });

        /*
         * Depth inside the ride: stills (oversized to 114% of their frame) and
         * the stroked numerals drift against the track's travel, scrubbed off
         * the ride itself via containerAnimation.
         */
        gsap.utils.toArray<HTMLElement>(".jr_still", track).forEach((still) => {
          gsap.fromTo(
            still,
            { xPercent: 0 },
            {
              xPercent: -11,
              ease: "none",
              scrollTrigger: {
                trigger: still,
                containerAnimation: ride,
                start: "left right",
                end: "right left",
                scrub: true,
              },
            },
          );
        });

        gsap.utils.toArray<HTMLElement>(".jr_ghost", track).forEach((ghost) => {
          gsap.fromTo(
            ghost,
            { xPercent: 12 },
            {
              xPercent: -12,
              ease: "none",
              scrollTrigger: {
                trigger: ghost,
                containerAnimation: ride,
                start: "left right",
                end: "right left",
                scrub: true,
              },
            },
          );
        });

        ScrollTrigger.refresh();
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative">
      <div className="jr_stage flex flex-col justify-center gap-10 motion-safe:md:h-svh motion-safe:md:overflow-hidden">
        {/* Header: label left, live chapter counter right, progress hairline. */}
        <div className="shell shrink-0">
          <div className="flex items-end justify-between">
            <SectionLabel>The journey</SectionLabel>
            <p className="hidden items-baseline gap-1.5 text-[13px] font-medium text-muted motion-safe:md:flex">
              <span ref={counterRef} className="text-foreground">
                01
              </span>
              <span>/ {String(chapters.length).padStart(2, "0")}</span>
            </p>
          </div>
          <div className="mt-5 h-px w-full bg-rule">
            <div
              ref={barRef}
              className="hidden h-px w-full origin-left scale-x-0 bg-foreground motion-safe:md:block"
            />
          </div>
        </div>

        {/* The chapters: a vertical list that becomes the horizontal track. */}
        <div className="jr_track mx-auto flex w-full max-w-[var(--grid-max)] flex-col gap-y-16 px-[var(--grid-margin)] motion-safe:md:w-max motion-safe:md:max-w-none motion-safe:md:flex-row motion-safe:md:items-stretch motion-safe:md:gap-x-[5vw] motion-safe:md:px-[max(var(--grid-margin),calc((100vw-var(--grid-max))/2+var(--grid-margin)))]">
          {chapters.map((chapter, i) => (
            <article
              key={chapter.title}
              className="flex flex-col gap-8 motion-safe:md:w-[min(62vw,880px)] motion-safe:md:shrink-0 motion-safe:md:flex-row motion-safe:md:items-end motion-safe:md:gap-10"
            >
              <div className="flex flex-col motion-safe:md:w-[38%] motion-safe:md:shrink-0">
                <span
                  aria-hidden
                  className="jr_ghost -ml-[0.05em] select-none text-[clamp(5.5rem,9vw,8.5rem)] font-semibold leading-[0.85] tracking-[-0.04em] text-transparent [-webkit-text-stroke:1.5px_var(--color--foreground--33)]"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="pt-5 text-[13px] font-medium text-muted">{chapter.kicker}</p>
                <h3 className="pt-2 text-statement font-semibold">{chapter.title}</h3>
                <p className="max-w-[44ch] pt-4 text-[15px] leading-[1.55] text-muted">
                  {chapter.blurb}
                </p>
              </div>
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-chip motion-safe:md:aspect-[5/4] motion-safe:md:min-w-0 motion-safe:md:flex-1">
                <img
                  src={chapter.image}
                  alt=""
                  className="jr_still h-full w-[114%] max-w-none object-cover"
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
