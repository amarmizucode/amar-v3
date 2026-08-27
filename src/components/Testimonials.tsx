"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, DUR } from "@/lib/gsap";
import { RightArrow } from "@/components/Arrows";

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  avatar: string;
};

/** How long each testimonial holds before advancing, in ms. */
const HOLD = 6000;

/**
 * Testimonial slider, following the reference's `problems_stats_navigation`:
 * a 1px track whose fill runs the length of each hold, arrows and a `0n/0N`
 * index beneath it, and the quote cross-fading on change.
 *
 * Advancing is automatic; the arrows step manually and reset the timer.
 */
export function Testimonials({ items }: { items: Testimonial[] }) {
  const root = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback(
    (next: number) => setIndex((n) => (next + items.length) % items.length),
    [items.length],
  );

  // Auto-advance. Restarts whenever the index changes, so a manual step
  // gives the new slide a full hold rather than the remainder of the old one.
  useEffect(() => {
    if (paused) return;
    const id = window.setTimeout(() => go(index + 1), HOLD);
    return () => window.clearTimeout(id);
  }, [index, paused, go]);

  // Progress fill, restarted per slide and matched to the same hold.
  useGSAP(
    () => {
      if (!bar.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(bar.current, { scaleX: 1 });
        return;
      }
      gsap.fromTo(
        bar.current,
        { scaleX: 0 },
        { scaleX: 1, duration: HOLD / 1000, ease: "none", paused },
      );
    },
    { dependencies: [index, paused] },
  );

  // Quote swap.
  useGSAP(
    () => {
      const live = root.current?.querySelector("[data-slide]");
      if (!live) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.fromTo(
        live,
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: DUR.normal, ease: "ease-transition" },
      );
    },
    { dependencies: [index] },
  );

  const current = items[index];
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div
      ref={root}
      className="flex flex-col gap-8"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Progress track and controls. */}
      <div>
        <div className="relative h-px w-full overflow-hidden bg-rule">
          <div ref={bar} className="absolute inset-0 origin-left bg-foreground" />
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Previous testimonial"
              className="w-4 transition-opacity hover:opacity-60"
            >
              <RightArrow back />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Next testimonial"
              className="w-4 transition-opacity hover:opacity-60"
            >
              <RightArrow />
            </button>
          </div>

          <p className="text-[13px] font-medium tabular-nums text-muted">
            {pad(index + 1)}/{pad(items.length)}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <p className="text-[13px] font-medium text-muted">(Real client stories)</p>

        <div key={index} data-slide className="flex flex-col gap-8">
          <p className="text-[15px] leading-[1.6]">{current.quote}</p>
          <div className="flex items-center gap-4">
            <img
              src={current.avatar}
              alt=""
              className="size-[54px] shrink-0 rounded-full bg-chip object-cover"
            />
            <div className="text-[15px] leading-[1.35]">
              <p className="font-medium">{current.name}</p>
              <p className="text-muted">{current.role}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
