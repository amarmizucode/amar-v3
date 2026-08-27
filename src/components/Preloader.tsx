"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, DUR } from "@/lib/gsap";

/**
 * Counts 0 -> 100 behind a full-bleed cover, then lifts the cover and fires
 * `onDone` so the hero intro timeline can start. Uses ease-preloader from the
 * reference set.
 */
export function Preloader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduced) {
        gsap.set(root.current, { autoAlpha: 0, display: "none" });
        onDone();
        return;
      }

      const count = { value: 0 };

      gsap
        .timeline()
        .to(count, {
          value: 100,
          duration: 1,
          ease: "ease-preloader",
          onUpdate() {
            if (counter.current) {
              counter.current.textContent = String(Math.round(count.value)).padStart(3, "0");
            }
          },
        })
        .to(
          root.current,
          {
            autoAlpha: 0,
            duration: DUR.normal,
            ease: "ease-transition",
            // Release the hero as the cover begins to clear, so its intro
            // plays through the fade rather than waiting for it to finish.
            onStart: () => {
              document.body.classList.remove("is-loading");
              onDone();
            },
          },
          "+=0.15",
        )
        .set(root.current, { display: "none" });
    },
    { scope: root, dependencies: [] },
  );

  return (
    <div
      ref={root}
      className="preloader fixed inset-0 z-[100] flex items-end justify-between bg-background px-[var(--grid-margin)] pb-8"
    >
      <div className="preloader_content flex w-full items-end justify-between">
        {/* Wordmark left, set exactly as the header renders it. Both items
            sit flush on the container's bottom edge. */}
        <span className="text-[15px] font-semibold uppercase leading-none tracking-[-0.01em]">
          Amar Ramesh
        </span>
        <span className="display text-[clamp(3rem,10vw,9rem)] leading-none">
          <span ref={counter}>000</span>
        </span>
      </div>
    </div>
  );
}
