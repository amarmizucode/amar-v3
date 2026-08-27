"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollSmoother, ScrollTrigger } from "@/lib/gsap";

/**
 * How far the page can rubber-band past each end, in px, and how much input it
 * takes to get there (higher = stiffer).
 *
 * The bottom is deliberately longer and looser than the top: on touch the top
 * belongs to the browser's pull-to-refresh, so the bottom is the only end that
 * stretches there and it can afford a fuller travel.
 */
const TOP = { max: 110, resistance: 7 };
const BOTTOM = { max: 240, resistance: 3.2 };

/**
 * GSAP ScrollSmoother. Smoothing is applied by transforming #smooth-content
 * inside a fixed-height #smooth-wrapper, so anything that must stay pinned to
 * the viewport (header, preloader, overlays) has to render OUTSIDE this
 * wrapper — transformed ancestors break `position: fixed`.
 *
 * ScrollSmoother owns ScrollTrigger.update itself, so scrub-linked triggers
 * stay in sync with the smoothed position with no extra wiring.
 *
 * Overscroll bounce is layered on top: the smoother has no elastic end of its
 * own, so continued input at either limit stretches #overscroll-shift (a plain
 * inner wrapper, kept separate so this transform never fights the smoother's
 * own transform on #smooth-content) and releases it on an elastic ease.
 *
 * One deliberate exception: pulling down by touch at the very top is left to
 * the browser, so mobile keeps its native pull-to-refresh.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const wrapper = useRef<HTMLDivElement>(null);
  const shift = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const smoother = ScrollSmoother.create({
      wrapper: wrapper.current!,
      content: "#smooth-content",
      smooth: 1.1,
      // Touch gets a shorter duration than the wheel: the content tracks a
      // finger directly, so desktop-length smoothing reads as lag.
      smoothTouch: 0.35,
      effects: true,
      // Left off for touch-primary devices on purpose. Normalizing takes over
      // the touch gesture and preventDefaults it, which stops the browser's own
      // pull-to-refresh from ever arming at the top. `isTouch === 1` is
      // touch-only; 2 is a hybrid with a mouse, which still wants normalizing.
      normalizeScroll: ScrollTrigger.isTouch !== 1,
      ignoreMobileResize: true,
    });

    const target = shift.current!;
    let stretch = 0;
    let releasing: gsap.core.Tween | null = null;

    /**
     * Which end we're pressed against: -1 top, 1 bottom, 0 free.
     *
     * Both values have to come from the same coordinate space. The smoother
     * mirrors the content height onto the body, so the native scroll position
     * and the window's maxScroll agree — but the *smoothed* position trails
     * behind and only reaches the limit asymptotically, which is why reading
     * `smoother.scrollTop()` here left the bottom permanently un-armed while
     * the top (clamped hard to 0) worked.
     */
    const atEnd = () => {
      const max = ScrollTrigger.maxScroll(window);
      const y = window.scrollY;
      if (y <= 1) return -1;
      // maxScroll can land a fraction short of the real bottom once the body
      // height is derived from the content, so this needs slack, not ±1px.
      if (y >= max - 2) return 1;
      return 0;
    };

    const draw = () => gsap.set(target, { y: stretch });

    const release = () => {
      if (!stretch) return;
      releasing = gsap.to({ v: stretch }, {
        v: 0,
        // Longer pulls take proportionally longer to snap home, so the deeper
        // bottom travel doesn't recoil faster than it was dragged.
        duration: gsap.utils.clamp(0.9, 1.35, 0.9 + Math.abs(stretch) / 400),
        ease: "elastic.out(1, 0.45)",
        onUpdate() {
          stretch = (this.targets()[0] as { v: number }).v;
          draw();
        },
        onComplete() {
          stretch = 0;
          releasing = null;
        },
      });
    };

    /**
     * `delta` is positive scrolling down. Returns true when the gesture was
     * absorbed by the stretch, so the caller can swallow it.
     *
     * `isTouch` opts the gesture out of the custom stretch at the top: pulling
     * down there is the browser's own pull-to-refresh, so the event is left
     * entirely alone rather than being absorbed. The bottom, and the wheel at
     * both ends, still get the elastic bounce.
     */
    const push = (delta: number, isTouch = false) => {
      const end = atEnd();
      if (isTouch && end === -1) return false;
      // Pulling back towards the page unwinds the stretch before it scrolls.
      if (!end || (end === -1 && delta > 0) || (end === 1 && delta < 0)) {
        if (!stretch) return false;
        release();
        return false;
      }

      releasing?.kill();
      releasing = null;

      // Asymptotic so the stretch eases into its limit instead of hitting a
      // hard stop — the resistance builds the further you pull.
      const { max, resistance } = end === 1 ? BOTTOM : TOP;
      const raw = stretch - delta / resistance;
      stretch = max * Math.tanh(raw / max);
      draw();
      return true;
    };

    // A wheel gesture has no end event, so the release is debounced: it fires
    // once input goes quiet rather than on every tick, which would snap the
    // stretch back before it could build.
    let idle = 0;
    /**
     * Absorbing means the normalizer must not also see the event, so the
     * gesture is stopped outright rather than just default-prevented.
     */
    const absorb = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    };

    const onWheel = (event: WheelEvent) => {
      if (push(event.deltaY)) absorb(event);
      window.clearTimeout(idle);
      idle = window.setTimeout(release, 90);
    };

    let touchY = 0;
    const onTouchStart = (event: TouchEvent) => {
      touchY = event.touches[0].clientY;
    };
    const onTouchMove = (event: TouchEvent) => {
      const y = event.touches[0].clientY;
      const delta = touchY - y;
      touchY = y;
      if (push(delta, true)) absorb(event);
    };

    /*
     * Capture phase, and non-passive. `normalizeScroll: true` installs an
     * Observer that takes over wheel/touch and calls preventDefault itself; a
     * plain bubble-phase listener runs after it has already consumed the
     * gesture, so the stretch never armed. Capturing puts these first.
     */
    const opts = { passive: false, capture: true } as const;
    window.addEventListener("wheel", onWheel, opts);
    window.addEventListener("touchstart", onTouchStart, { passive: true, capture: true });
    window.addEventListener("touchmove", onTouchMove, opts);
    window.addEventListener("touchend", release, true);
    window.addEventListener("touchcancel", release, true);

    return () => {
      window.removeEventListener("wheel", onWheel, opts);
      window.removeEventListener("touchstart", onTouchStart, { capture: true });
      window.removeEventListener("touchmove", onTouchMove, opts);
      window.removeEventListener("touchend", release, true);
      window.removeEventListener("touchcancel", release, true);
      window.clearTimeout(idle);
      releasing?.kill();
      gsap.set(target, { y: 0 });
      smoother.kill();
    };
  }, []);

  return (
    <div id="smooth-wrapper" ref={wrapper}>
      <div id="smooth-content">
        <div id="overscroll-shift" ref={shift}>
          {children}
        </div>
      </div>
    </div>
  );
}
