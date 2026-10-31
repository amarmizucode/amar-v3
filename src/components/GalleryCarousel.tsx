"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { usePageReady } from "@/components/PageTransition";
import { gsap } from "@/lib/gsap";
import type { Gallery } from "@/lib/photography";

/** The slot the enlarged slide occupies: the 4th of seven, as the reference. */
export const CENTER_SLOT = 3;

/**
 * On a phone the strip runs three slots to the screen instead of seven, so
 * the enlarged slide — twice a slot — fills two thirds of it, with the
 * neighbours showing half a slot either side. Its centre slot is the 2nd.
 */
const MOBILE_CENTER_SLOT = 1;

/** Slides run at 100% of the row width, so the layout breakpoint is a viewport width. */
const DESKTOP = "(min-width: 650px)";
const MOBILE = "(max-width: 649.98px)";

/**
 * Filmstrip carousel — a port of iamrossmason.com's HomeCarousel, kept
 * method for method so the interaction is the same:
 *
 *  - `t` is the scroll target in px, `tc` the eased position:
 *    `tc = lerp(tc, t, 0.1 * ticker.deltaRatio(60))` every frame.
 *  - Wheel: `t -= (wheelDeltaY || deltaY) * mm`, with `mm` 0.9 on Windows and
 *    0.375 elsewhere (the app's smooth-scroll multiplier). 100ms after the last
 *    wheel event `t` snaps to a multiple of the slide width. Nothing else
 *    moves the strip — no drag, no keys, exactly as the reference.
 *  - `--diff = clamp(0, 1, 1 - 0.001 * |t - tc|)` every frame: the strip
 *    flattens in proportion to its lag, i.e. its speed.
 *  - Each slide is translated by `-wrap(-(max - right), right, tc)`, which is
 *    what loops the strip endlessly; slides off-screen get `is-not-visible`
 *    so they jump to their new place without easing.
 *  - `current` is the slide covering the viewport centre; when it changes,
 *    `is-big` / `is-left` / `is-right` are reassigned and the CSS transitions
 *    ease the growth.
 *  - Clicking any slide opens it.
 *
 * The intro is a clip-reveal: an outer mask translates up while its inner
 * layer counter-translates down, so the image holds still as the clip opens.
 */
export function GalleryCarousel({
  items,
  onChange,
}: {
  items: Gallery[];
  /** Fires with the index of the slide in the centre slot. */
  onChange?: (index: number) => void;
}) {
  const root = useRef<HTMLDivElement>(null);

  // Read through a ref so a new callback never re-runs the GSAP setup.
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // The reveal waits for the page to be on show (hydration / route curtain).
  const ready = usePageReady();
  const readyRef = useRef(ready);
  const intro = useRef<gsap.core.Timeline | null>(null);
  useEffect(() => {
    readyRef.current = ready;
    if (ready) intro.current?.play();
  }, [ready]);

  useGSAP(
    () => {
      const wrap = root.current;
      if (!wrap) return;

      const slides = gsap.utils.toArray<HTMLElement>(".pcar-slide", wrap);
      if (!slides.length) return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const mm = gsap.matchMedia();

      /* ── Intro ─────────────────────────────────────────────────────── */
      const masks = wrap.querySelectorAll(".pcar-mask");
      const insides = wrap.querySelectorAll(".pcar-mask-inside");
      const texts = wrap.querySelectorAll(".pcar-text-inner");

      if (reduced) {
        gsap.set([masks, insides, texts], { clearProps: "all" });
      } else {
        gsap.set(masks, { yPercent: -100 });
        gsap.set(insides, { yPercent: 100 });
        gsap.set(texts, { yPercent: -50, opacity: 0 });

        intro.current = gsap
          .timeline({
            paused: !readyRef.current,
            delay: 0.25,
            defaults: { ease: "expo.out", duration: 1.6 },
          })
          .to(masks, { yPercent: 0, stagger: 0.05 }, 0)
          .to(insides, { yPercent: 0, stagger: 0.05 }, 0)
          .to(texts, { yPercent: 0, opacity: 1, stagger: 0.05 }, 0.1);
      }

      /* ── Strip ─────────────────────────────────────────────────────── */
      // One engine at every width; only the slot count (in CSS) and the
      // centre slot change. Split by breakpoint so crossing it re-measures
      // and re-centres from scratch.
      mm.add({ desktop: DESKTOP, mobile: MOBILE }, (context) => {
        const centerSlot = context.conditions?.desktop ? CENTER_SLOT : MOBILE_CENTER_SLOT;

        type Slot = {
          el: HTMLElement;
          b: { left: number; right: number; width: number };
          t: number;
          p: number;
          out: boolean;
          visible: boolean;
        };

        // The wheel multiplier is per platform, as in the reference.
        const multiplier = /Win/.test(navigator.platform) ? 0.9 : 0.375;

        let t = 0;
        let tc = 0;
        let current = 0;
        let max = 0;
        let increase = 0;
        let ww = wrap.clientWidth;
        let snaps: number[] = [];
        let doSnap: (v: number) => number = (v) => v;
        let snapc: (v: number) => number = (v) => v;
        let resizing = false;
        let cache: Slot[] = [];
        let snapTimer = 0;

        /* Drag state. Declared here because the ticker below reads `fling` and
         * `dragging` to decay a throw, and it is defined before the handlers
         * that set them. */
        const DRAG_SLOP = 4;
        let dragging = false;
        let dragged = false;
        let dragId = -1;
        let dragX = 0;
        let dragStart = 0;
        let vel = 0;
        let velAt = 0;
        let fling = 0;

        const transform = (s: Slot, v: number) => {
          s.el.style.transform = `translate3d(${-v}px, 0, 0)`;
        };
        const hide = (s: Slot) => {
          s.el.classList.add("is-not-visible");
          s.el.classList.remove("is-right");
        };
        const show = (s: Slot) => s.el.classList.remove("is-not-visible");
        const isVisible = (lo: number, hi: number, v: number) => v > lo && v < hi;

        const transforms = () => {
          cache.forEach((s, i) => {
            const { left, right, width } = s.b;
            const c = right - ww;
            s.t = gsap.utils.wrap(-(max - right), right, tc);
            s.p = gsap.utils.clamp(0, 1, (s.t - c) / (left - c));
            s.visible = isVisible(left - ww - width, right + width, s.t);
            if (s.visible || resizing) {
              if (s.out) {
                s.out = false;
                show(s);
              }
              transform(s, s.t);
              /*
               * Side class from the slide's position, every frame. The
               * reference only does this when the centre changes; with a set
               * this small the wrap period equals the visible window, so a
               * slide that wraps re-enters still carrying the other end's
               * class and lands on its neighbour. `p` crosses 0.5 at the
               * viewport centre, where `is-big` overrides the shift anyway.
               */
              if (i !== current) side(s);
            } else if (!s.out) {
              s.out = true;
              transform(s, s.t);
              hide(s);
            }
          });
        };

        const side = (s: Slot) => {
          const left = s.p > 0.5;
          s.el.classList.toggle("is-left", left);
          s.el.classList.toggle("is-right", !left);
        };

        const classes = () => {
          cache.forEach((s, i) => {
            if (!s.visible) return;
            s.el.classList.toggle("is-big", i === current);
            side(s);
          });
          onChangeRef.current?.(current);
        };

        // The slide whose right edge is nearest the viewport centre.
        const idx = () => {
          const probe = ww / 2 + increase / 2;
          const at = gsap.utils.wrap(0, max, tc + probe - 5);
          const next = snaps.indexOf(snapc(at));
          if (next !== current && next !== -1) {
            current = next;
            classes();
          }
        };

        const resize = () => {
          resizing = true;
          ww = wrap.clientWidth;
          const previous = increase;
          snaps = [];
          const last = slides.length - 1;
          slides.forEach((el) => (el.style.transform = ""));
          cache = slides.map((el, i) => {
            const r = el.getBoundingClientRect();
            const b = { left: r.left, right: r.right, width: r.width };
            snaps.push(Math.floor(b.right));
            if (i === last) {
              doSnap = gsap.utils.snap(b.width);
              increase = b.width;
            }
            const prev = cache[i];
            return { el, b, t: 0, p: prev?.p ?? 0, out: false, visible: true };
          });
          // The reference defers these to the next frame; measured rects are
          // already final here, and deferring left the first layout pass
          // with `max = 0`, which marked every slide off-screen.
          max = cache[cache.length - 1].b.right;
          snapc = gsap.utils.snap(snaps);
          // `t` is in px of the slot width; keep the same slide centred when
          // that width changes.
          if (previous) {
            t = (t / previous) * increase;
            tc = (tc / previous) * increase;
          }
          transforms();
          classes();
          resizing = false;
        };

        const tick = () => {
          const ratio = gsap.ticker.deltaRatio(60);
          // Decay the throw from a release, damped per frame until it is
          // spent; `scroll` re-arms the snap on every step.
          if (fling !== 0 && !dragging) {
            scroll(fling);
            fling *= Math.pow(0.94, ratio);
            if (Math.abs(fling) < 0.1) fling = 0;
          }
          tc = reduced ? t : gsap.utils.interpolate(tc, t, Math.min(1, 0.1 * ratio));
          const diff = gsap.utils.clamp(0, 1, 1 - Math.abs(0.001 * (t - tc)));
          wrap.style.setProperty("--diff", String(diff));
          idx();
          transforms();
        };

        const scroll = (dy: number) => {
          t -= dy;
          window.clearTimeout(snapTimer);
          snapTimer = window.setTimeout(() => {
            // A finger held still mid-drag must not have the strip snap out
            // from under it; the release re-arms the snap.
            if (!dragging) t = doSnap(t);
          }, 100);
        };

        const wheel = (event: WheelEvent) => {
          event.preventDefault();
          /*
           * A trackpad's horizontal swipe and a shift-held wheel both arrive as
           * deltaX, so the strip takes whichever axis the gesture is actually
           * on. deltaY keeps the reference's legacy `wheelDeltaY` reading —
           * ±120 per notch on a mouse, -3x deltaY on a trackpad — while deltaX
           * has no legacy equivalent and is scaled to match.
           */
          if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
            scroll(-3 * event.deltaX * multiplier);
            return;
          }
          const legacy = (event as WheelEvent & { wheelDeltaY?: number }).wheelDeltaY;
          const raw = legacy !== undefined ? legacy : -3 * event.deltaY;
          scroll(raw * multiplier);
        };

        /*
         * Drag. The strip is grabbed and thrown: each move applies the pointer
         * delta directly, and the release carries the last measured velocity
         * on for a moment before the snap catches it.
         *
         * Every slide is a Link, so a drag has to be told apart from a click —
         * past DRAG_SLOP the pointer is dragging, and the click that follows is
         * swallowed once in the capture phase so it cannot navigate.
         */
        const onDown = (event: PointerEvent) => {
          // Let the browser keep its own text/image drags out of the way.
          if (event.button !== 0) return;
          dragging = true;
          dragged = false;
          dragId = event.pointerId;
          dragX = dragStart = event.clientX;
          vel = 0;
          fling = 0;
          velAt = performance.now();
          wrap.classList.add("is-grabbing");
        };

        const onMove = (event: PointerEvent) => {
          if (!dragging || event.pointerId !== dragId) return;
          const dx = event.clientX - dragX;
          if (Math.abs(event.clientX - dragStart) > DRAG_SLOP) dragged = true;
          const now = performance.now();
          const dt = now - velAt;
          if (dt > 0) vel = dx / dt;
          velAt = now;
          dragX = event.clientX;
          // Dragging right should reveal the slides to the left, so the strip
          // moves with the finger rather than against it.
          scroll(dx);
        };

        const onUp = (event: PointerEvent) => {
          if (!dragging || event.pointerId !== dragId) return;
          dragging = false;
          dragId = -1;
          wrap.classList.remove("is-grabbing");
          if (!dragged) return;
          // A pause before lifting the finger is a placement, not a throw.
          if (performance.now() - velAt > 60) vel = 0;
          // Carry the throw: the tick decays this to nothing, then snaps.
          fling = vel * 16;
          scroll(0);
        };

        // A drag ends in a click on whichever slide was under the pointer.
        // Caught on window, in capture: the route curtain's own capture
        // listener is on document, which runs first, and would otherwise
        // navigate to that slide before this ever saw the click.
        const onClickCapture = (event: MouseEvent) => {
          if (!dragged || !wrap.contains(event.target as Node)) return;
          event.preventDefault();
          event.stopPropagation();
          dragged = false;
        };

        resize();
        // Open with the first slide in the centre slot: scroll the strip back
        // by the slots before it, so the wrapped tail fills the left side.
        t = tc = -centerSlot * increase;
        transforms();
        classes();
        gsap.ticker.add(tick);
        wrap.addEventListener("wheel", wheel, { passive: false });
        wrap.addEventListener("pointerdown", onDown);
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
        window.addEventListener("pointercancel", onUp);
        window.addEventListener("click", onClickCapture, true);
        window.addEventListener("resize", resize);

        return () => {
          gsap.ticker.remove(tick);
          window.clearTimeout(snapTimer);
          wrap.removeEventListener("wheel", wheel);
          wrap.removeEventListener("pointerdown", onDown);
          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("pointerup", onUp);
          window.removeEventListener("pointercancel", onUp);
          window.removeEventListener("click", onClickCapture, true);
          window.removeEventListener("resize", resize);
          wrap.classList.remove("is-grabbing");
          wrap.style.removeProperty("--diff");
          slides.forEach((el) => {
            el.style.transform = "";
            el.classList.remove("is-big", "is-left", "is-right", "is-not-visible");
          });
        };
      });
    },
    { scope: root, dependencies: [items.length] },
  );

  return (
    <div
      ref={root}
      className="pcar-wrap absolute inset-0 flex select-none items-start"
      style={{ "--diff": 1 } as CSSProperties}
    >
      <div className="pcar-slides relative flex w-full items-start">
        {items.map((gallery, i) => (
          <article
            key={gallery.slug}
            data-to={`/photography/${gallery.slug}`}
            // Server-rendered classes for the initial state: the first slide
            // is centred, everything after it sits to its right.
            className={`pcar-slide group relative ${i === 0 ? "is-big" : "is-right"}`}
          >
            <Link
              href={`/photography/${gallery.slug}`}
              draggable={false}
              aria-label={`${gallery.title} gallery`}
              className="pcar-content relative block origin-top cursor-pointer pt-[125%]"
            >
              {/* Caption, above the frame. The outer layer takes the CSS
                  shift; the inner one is the intro's. */}
              <div className="pcar-text absolute bottom-full left-0 w-full">
                <div className="pcar-text-inner flex flex-col text-[clamp(13px,1.2vw,19px)] font-medium leading-none tracking-[-0.02em]">
                  <span className="pcar-index leading-none text-muted">[{gallery.index}]</span>
                  <h2 className="mt-[max(4px,0.4vw)] leading-none">{gallery.title}</h2>
                </div>
              </div>

              {/* Scaled layer → reveal mask → counter-translated inner → image. */}
              <div className="pcar-scale absolute inset-0 origin-top overflow-hidden">
                <div className="pcar-mask absolute inset-0 origin-top overflow-hidden">
                  <div className="pcar-mask-inside absolute inset-0 overflow-hidden">
                    <img
                      src={gallery.cover}
                      alt=""
                      draggable={false}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
