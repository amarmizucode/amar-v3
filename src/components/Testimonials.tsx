"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, DUR } from "@/lib/gsap";
import { RightArrow } from "@/components/Arrows";

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  /** Kept for the call sites; no longer drawn. */
  avatar?: string;
};

/** "Dr. S. Raghunathan" -> "SR": the first letter of the first and last
 * name, skipping honorifics. */
const initials = (name: string) => {
  const parts = name
    .split(/\s+/)
    .filter((w) => !/^(dr|prof|mr|mrs|ms)\.?$/i.test(w));
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
};

/** How long each testimonial holds before advancing, in ms. */
const HOLD = 11000;

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
  // Bumped on every advance, manual or automatic. The hold timer and the
  // progress fill key off this rather than off `index` alone, so stepping to a
  // slide that happens to be the current one still restarts both from zero.
  const [tick, setTick] = useState(0);

  const go = useCallback(
    (next: number) => {
      setIndex((next + items.length) % items.length);
      setTick((t) => t + 1);
    },
    [items.length],
  );

  // The progress fill IS the timer: the slide advances when the bar finishes,
  // so the two can never drift apart. Restarted per step, and pausing on hover
  // holds the fill — and therefore the advance — in place rather than letting
  // one run on without the other.
  const fill = useRef<gsap.core.Tween | null>(null);

  useGSAP(
    () => {
      if (!bar.current) return;
      if (reducedMotion()) {
        gsap.set(bar.current, { scaleX: 1 });
        return;
      }
      fill.current = gsap.fromTo(
        bar.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: HOLD / 1000,
          ease: "none",
          onComplete: () => go(index + 1),
        },
      );
    },
    { dependencies: [index, tick] },
  );

  // Pause/resume the fill without restarting it.
  useEffect(() => {
    const tween = fill.current;
    if (!tween) return;
    if (paused) tween.pause();
    else tween.resume();
  }, [paused, index, tick]);

  // Under reduced motion the fill is drawn complete and never runs, so it
  // cannot drive the advance — a plain hold timer stands in for it.
  useEffect(() => {
    if (!reducedMotion() || paused) return;
    const id = window.setTimeout(() => go(index + 1), HOLD);
    return () => window.clearTimeout(id);
  }, [index, tick, paused, go]);

  // Quote swap.
  useGSAP(
    () => {
      const live = root.current?.querySelector("[data-slide]");
      if (!live) return;
      if (reducedMotion()) return;

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
            {/* A monogram rather than a photograph: the avatars were stock
                faces that matched neither the name nor each other. */}
            <span
              aria-hidden
              className="flex size-[54px] shrink-0 items-center justify-center rounded-full bg-chip text-[15px] font-semibold tracking-[-0.02em]"
            >
              {initials(current.name)}
            </span>
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
