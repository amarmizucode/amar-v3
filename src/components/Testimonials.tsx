"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, SplitText, DUR } from "@/lib/gsap";
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

/** Seconds each testimonial holds — the reference's `Jd`. */
const HOLD = 16;

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Testimonial slider, a port of the reference's `data-slider` handler (`Xd`)
 * inside `services_home_stats`.
 *
 * Two fills share the 1px track: the live one runs the hold, and on a change
 * it slides off to the right while the other starts from the left, so the
 * track never empties. The slides share one grid cell; the outgoing quote
 * lifts away line by line, its byline after it, and the incoming one rises
 * in the same way. Advancing is automatic, paused while the band is off
 * screen; the arrows step manually and restart the hold.
 */
export function Testimonials({
  items,
  descriptor,
}: {
  items: Testimonial[];
  /** The mono line under each byline — the reference's `heading-inner`. */
  descriptor?: string;
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const count = items.length;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const slides = Array.from(el.querySelectorAll<HTMLElement>("[data-slider-item]"), (s) => ({
        root: s,
        headshot: s.querySelector<HTMLElement>("[data-slider-headshot]"),
        message: s.querySelector<HTMLElement>("[data-slider-message]")!,
        details: Array.from(s.querySelectorAll<HTMLElement>("[data-slider-details]")),
        lines: [] as Element[],
      }));
      const next = el.querySelector<HTMLButtonElement>("[data-slider-next]");
      const prev = el.querySelector<HTMLButtonElement>("[data-slider-prev]");
      const current = el.querySelector<HTMLElement>("[data-dynamic-value]");
      const barA = el.querySelector<HTMLElement>("[data-progress-bar-start]")!;
      const barB = el.querySelector<HTMLElement>("[data-progress-bar-end]")!;

      // Masked lines, so each one rises out of its own slot.
      const splits = slides.map((s) =>
        SplitText.create(s.message, {
          type: "lines",
          mask: "lines",
          autoSplit: true,
          onSplit(self) {
            s.lines = self.lines;
          },
        }),
      );

      let index = 0;
      let cycle: gsap.core.Timeline | null = null;
      let swap: gsap.core.Timeline | null = null;
      let live = barA;
      let idle = barB;

      const showIndex = () => {
        if (current) current.textContent = pad(index + 1);
        slides.forEach((s, i) => {
          s.root.setAttribute("aria-hidden", String(i !== index));
          s.root.inert = i !== index;
        });
      };

      const hide = (s: (typeof slides)[number]) => {
        gsap.set(s.root, { opacity: 0, yPercent: 150 });
        if (s.headshot) gsap.set(s.headshot, { opacity: 0, yPercent: 100 });
        if (s.details.length) gsap.set(s.details, { opacity: 0 });
      };

      const kill = (s: (typeof slides)[number]) => {
        gsap.killTweensOf(s.root);
        if (s.headshot) gsap.killTweensOf(s.headshot);
        if (s.details.length) gsap.killTweensOf(s.details);
      };

      const leave = (s: (typeof slides)[number]) => {
        const t = DUR.fast;
        const tl = gsap.timeline();
        tl.to(s.lines, { yPercent: -150, opacity: 0, stagger: 0.03, ease: "ease-primary", duration: t });
        if (s.headshot)
          tl.to(s.headshot, { yPercent: -50, opacity: 0, ease: "ease-primary", duration: t }, `-=${t * 1.2}`);
        if (s.details.length)
          tl.to(s.details, { yPercent: -150, opacity: 0, ease: "ease-primary", duration: t, stagger: 0.03 }, "<");
        return tl;
      };

      const enter = (s: (typeof slides)[number]) => {
        const tl = gsap.timeline();
        tl.set(s.root, { opacity: 1, yPercent: 0 }).fromTo(
          s.lines,
          { yPercent: 150, opacity: 0 },
          { yPercent: 0, opacity: 1, stagger: 0.03, ease: "ease-transition", duration: DUR.slow },
        );
        if (s.headshot)
          tl.fromTo(
            s.headshot,
            { yPercent: 50, opacity: 0 },
            { yPercent: 0, opacity: 1, ease: "ease-transition", duration: DUR.slow },
            "-=1",
          );
        if (s.details.length)
          tl.fromTo(
            s.details,
            { yPercent: 150, opacity: 0 },
            { yPercent: 0, opacity: 1, ease: "ease-transition", duration: DUR.slow, stagger: 0.03 },
            "<",
          );
        return tl;
      };

      const goTo = (target: number) => {
        swap?.kill();
        const from = slides[index];
        const to = slides[target];
        index = target;
        showIndex();
        if (reduced) {
          hide(from);
          gsap.set(to.root, { opacity: 1, yPercent: 0 });
          if (to.headshot) gsap.set(to.headshot, { opacity: 1, yPercent: 0 });
          if (to.details.length) gsap.set(to.details, { opacity: 1, yPercent: 0 });
          gsap.set(to.lines, { opacity: 1, yPercent: 0 });
          return;
        }
        const out = leave(from);
        const at = out.duration() * 0.6;
        swap = gsap.timeline({ onComplete: () => void (swap = null) });
        swap
          .add(out, 0)
          .call(() => {
            kill(from);
            hide(from);
          }, undefined, at)
          .add(enter(to), at);
      };

      // Hand the track to the other fill: the live one exits right while the
      // idle one runs the new hold from the left.
      const handOff = (delay: number, onSwap: () => void) => {
        const leaving = live;
        const entering = idle;
        live = entering;
        idle = leaving;
        gsap.set(entering, { xPercent: -100 });
        cycle = gsap.timeline({ onComplete: auto });
        cycle.add(onSwap, 0);
        cycle.to(leaving, { xPercent: 100, duration: 0.5, ease: "power2.inOut" }, 0);
        cycle.to(entering, { xPercent: 0, duration: HOLD, ease: "none" }, delay);
      };

      const start = () => {
        cycle?.kill();
        cycle = gsap.timeline({ onComplete: auto });
        cycle.to(live, { xPercent: 0, duration: HOLD, ease: "none" });
      };

      function auto() {
        cycle?.kill();
        const target = (index + 1) % count;
        handOff(0.4, () => goTo(target));
      }

      const step = (dir: 1 | -1) => {
        cycle?.kill();
        cycle = null;
        swap?.kill();
        swap = null;
        const target = (index + dir + count) % count;
        handOff(0.2, () => goTo(target));
      };

      const onNext = () => step(1);
      const onPrev = () => step(-1);
      next?.addEventListener("click", onNext);
      prev?.addEventListener("click", onPrev);

      slides.forEach(hide);
      // `x: 0` drops the pixel offset GSAP reads from the stylesheet's
      // pre-script translateX(-100%), so only xPercent moves the fills.
      gsap.set([barA, barB], { x: 0, xPercent: -100 });
      showIndex();
      if (reduced) {
        goTo(0);
        gsap.set(barA, { xPercent: 0 });
      } else {
        enter(slides[0]);
        start();
      }

      // Hold still while the band is off screen.
      const pause = () => cycle?.pause();
      const resume = () => (cycle ? cycle.resume() : start());
      const watch = ScrollTrigger.create({
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        onEnter: resume,
        onEnterBack: resume,
        onLeave: pause,
        onLeaveBack: pause,
      });

      return () => {
        next?.removeEventListener("click", onNext);
        prev?.removeEventListener("click", onPrev);
        watch.kill();
        splits.forEach((s) => s.revert());
      };
    },
    { scope: root, dependencies: [items.length] },
  );

  return (
    <div ref={root}>
      <div className="svc_track">
        <div data-progress-bar-start className="svc_track_fill" />
        <div data-progress-bar-end className="svc_track_fill" />
      </div>

      <div className="svc_nav">
        <div className="svc_nav_buttons">
          <button type="button" data-slider-prev aria-label="Previous testimonial" className="svc_nav_button">
            <RightArrow back />
          </button>
          <button type="button" data-slider-next aria-label="Next testimonial" className="svc_nav_button">
            <RightArrow />
          </button>
        </div>
        <p className="svc_mono flex tabular-nums">
          <span data-dynamic-value>01</span>/<span>{pad(items.length)}</span>
        </p>
      </div>

      <div className="svc_collection">
        <div role="list" className="svc_slides">
          {items.map((item, i) => (
            <div key={`${item.name}-${i}`} role="listitem" data-slider-item className="svc_slide">
              <p data-slider-message className="svc_message">
                {`"${item.quote}"`}
              </p>
              <div className="svc_byline">
                {/* A monogram rather than a photograph: the avatars were stock
                    faces that matched neither the name nor each other. */}
                <span aria-hidden data-slider-headshot className="svc_headshot">
                  {initials(item.name)}
                </span>
                <div className="svc_byline_text">
                  <p data-slider-details className="svc_name">
                    {item.name}
                  </p>
                  <p data-slider-details className="svc_role">
                    {item.role}
                  </p>
                </div>
              </div>
              {descriptor && (
                <p data-slider-details className="svc_mono svc_descriptor">
                  {descriptor}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
