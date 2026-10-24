"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollSmoother, ScrollTrigger } from "@/lib/gsap";

/**
 * How far the page can rubber-band past the bottom, in px, and how much input
 * it takes to get there (higher = stiffer).
 *
 * The bottom is the only end that stretches — the top belongs to the browser's
 * pull-to-refresh — so it can afford a fairly full, loose travel.
 */
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
 * Overscroll bounce is layered on top, and is touch-only — desktop keeps a
 * hard stop at both ends, since a rubber-band on the wheel reads as the page
 * having come loose rather than as a gesture. On touch the smoother has no
 * elastic end of its own, so continued input at the bottom stretches
 * #overscroll-shift (a plain inner wrapper, kept separate so this transform
 * never fights the smoother's own transform on #smooth-content) and releases
 * it on an elastic ease.
 *
 * Pulling down at the very top is left to the browser, so mobile keeps its
 * native pull-to-refresh.
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
      // allowNestedScroll: the normalizer otherwise preventDefaults every
      // wheel, which kills a trackpad's sideways swipe on the home page's
      // film carousel (and any other inner scroller); with it, gestures over
      // a scrollable element are left to the browser.
      normalizeScroll: ScrollTrigger.isTouch !== 1 ? { allowNestedScroll: true } : false,
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
     * The top end is skipped entirely: pulling down there is the browser's own
     * pull-to-refresh, so the event is left alone rather than being absorbed.
     * Only the bottom gets the elastic bounce.
     */
    const push = (delta: number) => {
      const end = atEnd();
      if (end === -1) return false;
      // Pulling back towards the page unwinds the stretch before it scrolls.
      if (!end || delta < 0) {
        if (!stretch) return false;
        release();
        return false;
      }

      releasing?.kill();
      releasing = null;

      // Asymptotic so the stretch eases into its limit instead of hitting a
      // hard stop — the resistance builds the further you pull.
      const { max, resistance } = BOTTOM;
      const raw = stretch - delta / resistance;
      stretch = max * Math.tanh(raw / max);
      draw();
      return true;
    };

    /**
     * Absorbing means the normalizer must not also see the event, so the
     * gesture is stopped outright rather than just default-prevented.
     */
    const absorb = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    };

    let touchY = 0;
    const onTouchStart = (event: TouchEvent) => {
      touchY = event.touches[0].clientY;
    };
    const onTouchMove = (event: TouchEvent) => {
      const y = event.touches[0].clientY;
      const delta = touchY - y;
      touchY = y;
      if (push(delta)) absorb(event);
    };

    /*
     * In-page anchors, delegated. The smoother translates the content rather
     * than really scrolling it, so a native hash jump has nothing to move —
     * `smoother.scrollTo` is what actually gets there. `#top` has no offset to
     * resolve, so it goes straight to 0.
     */
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey) return;
      const link = (event.target as Element | null)?.closest?.('a[href^="#"]');
      if (!link) return;

      const hash = link.getAttribute("href")!;
      if (hash.length < 2) return;

      const destination = hash === "#top" ? 0 : document.querySelector(hash);
      if (destination === null) return;

      event.preventDefault();
      smoother.scrollTo(destination, true, "top top");
      history.pushState(null, "", hash);
    };

    document.addEventListener("click", onClick);

    /*
     * Capture phase, and non-passive. `normalizeScroll: true` installs an
     * Observer that takes over wheel/touch and calls preventDefault itself; a
     * plain bubble-phase listener runs after it has already consumed the
     * gesture, so the stretch never armed. Capturing puts these first.
     */
    const opts = { passive: false, capture: true } as const;
    window.addEventListener("touchstart", onTouchStart, { passive: true, capture: true });
    window.addEventListener("touchmove", onTouchMove, opts);
    window.addEventListener("touchend", release, true);
    window.addEventListener("touchcancel", release, true);

    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("touchstart", onTouchStart, { capture: true });
      window.removeEventListener("touchmove", onTouchMove, opts);
      window.removeEventListener("touchend", release, true);
      window.removeEventListener("touchcancel", release, true);
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
