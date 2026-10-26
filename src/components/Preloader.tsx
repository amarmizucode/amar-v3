"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, DUR } from "@/lib/gsap";

/** Session flag: the cover has played once this visit. */
const SEEN_KEY = "amar:preloaded";

/*
 * The cover is hidden for now. The component stays mounted and still calls
 * `onDone` on the first frame, because `ready` is what releases the hero's
 * intro and every route transition — dropping the component would leave the
 * page waiting on a signal that never comes. Flip this back to false to
 * restore the counter and the strips.
 */
const DISABLED = true;

/**
 * The cover is the same twelve strips the route curtain uses, so the first
 * load and every navigation afterwards clear the page the same way. Kept in
 * step with STRIPS/SWEEP in PageTransition.
 */
const STRIPS = 12;
/** Total spread of the stagger across the strips, left to right. */
const SWEEP = 0.385;

/**
 * Counts 0 -> 100 behind a full-bleed cover, then clears the cover and fires
 * `onDone` so the page intro can start.
 *
 * The cover is built from the route curtain's markup and CSS — twelve strips
 * on the page grid — and it leaves the way the curtain does: each strip
 * retracts upward, staggered left to right, so the site's columns are what
 * uncover the page. The counter fades just ahead of them, since it sits on
 * the strips rather than on a panel of its own.
 *
 * Plays once per visit: after it has run, every later mount (a navigation or
 * a reload in the same tab) skips straight to `onDone`.
 */
export function Preloader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const content = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (DISABLED) {
        gsap.set(root.current, { autoAlpha: 0, display: "none" });
        document.body.classList.remove("cover-is-visible");
        // The session flag is still set, so the inline script in the layout
        // keeps hiding the server-rendered cover on a reload.
        try {
          sessionStorage.setItem(SEEN_KEY, "1");
        } catch {
          // Storage unavailable: nothing to keep in step.
        }
        onDone();
        return;
      }

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let seen = false;
      try {
        seen = sessionStorage.getItem(SEEN_KEY) === "1";
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        // Storage unavailable: play it.
      }

      if (reduced || seen) {
        gsap.set(root.current, { autoAlpha: 0, display: "none" });
        document.body.classList.remove("cover-is-visible");
        onDone();
        return;
      }

      // Raised for the cover's lifetime; the class is what hides the floating
      // controls, and it is cleared as the cover starts to clear.
      document.body.classList.add("cover-is-visible");

      // Only the strips this breakpoint shows, so the stagger spreads the
      // same sweep over however many are on screen.
      const strips = gsap.utils
        .toArray<HTMLElement>(".preloader-strip", root.current)
        .filter((el) => getComputedStyle(el).display !== "none");
      const stagger = strips.length > 1 ? SWEEP / (strips.length - 1) : 0;

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
        // The wordmark and counter ride on the strips, so they go first —
        // otherwise they would be clipped mid-retract.
        .to(
          content.current,
          { autoAlpha: 0, duration: DUR.fast, ease: "ease-transition" },
          "+=0.15",
        )
        // Retract upward, left to right: the route curtain's exact exit.
        .to(
          strips,
          {
            scaleY: 0,
            duration: DUR.normal,
            ease: "ease-transition",
            stagger,
            // Release the hero as the cover begins to clear, so its intro
            // plays through the sweep rather than waiting for it to finish.
            onStart: () => {
              document.body.classList.remove("cover-is-visible");
              onDone();
            },
          },
          "<0.05",
        )
        .set(root.current, { display: "none" });
    },
    { scope: root, dependencies: [] },
  );

  return (
    <div ref={root} className="preloader fixed inset-0 z-[100]">
      {/*
       * The strips reuse the curtain's grid so the seams land on the same
       * column lines, at every breakpoint, as a route transition's do.
       * `transformOrigin` is set here rather than in the timeline so the very
       * first frame is already anchored to the top edge.
       */}
      <div className="preloader-curtain pt-curtain" aria-hidden>
        {Array.from({ length: STRIPS }, (_, i) => (
          <span
            key={i}
            className="pt-strip preloader-strip"
            style={{ transformOrigin: "50% 0%" }}
          />
        ))}
      </div>

      <div
        ref={content}
        className="preloader_content absolute inset-0 flex items-end justify-between px-[var(--grid-margin)] pb-8"
      >
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
