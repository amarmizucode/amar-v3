"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/*
 * The reference's cursor bubble, rule for rule.
 *
 * A single fixed pill trails the pointer on two `quickTo` tweens — 0.4s
 * power3.out on each axis, so x and y settle independently and the pill
 * arcs rather than tracks straight. On every move it reads
 * `elementFromPoint` and walks up for `[data-cursor-hover]`; the nearest
 * one's `data-cursor-text` becomes the label and the wrapper gets
 * `data-cursor="active"`. When the pill's own right edge has reached the
 * viewport it gets `active-edge` instead, which flips it to the pointer's
 * left so it never hangs off-screen. Pressing dips it to 0.9.
 *
 * `elementFromPoint` is the whole trick: hit-testing the point rather than
 * listening on each target means the bubble is correct after a scroll under
 * a still pointer, and needs no listener per target.
 *
 * Pointer-only. On touch there is no cursor to decorate, and the matchMedia
 * gate here mirrors the `(hover: hover) and (pointer: fine)` gate the CSS
 * uses, so neither side renders it alone.
 */
export function CursorBubble() {
  const host = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = host.current;
    const text = label.current;
    if (!el || !text) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let x = 0;
    let y = 0;
    let moved = false;

    const toX = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
    const toY = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });

    /*
     * Hit-test the last known point. The wrapper is `pointer-events: none`,
     * so it never shows up as the element under the cursor and can't shadow
     * the target it is labelling.
     */
    const sync = () => {
      const target = document
        .elementFromPoint(x, y)
        ?.closest<HTMLElement>("[data-cursor-hover]");
      const box = el.getBoundingClientRect();
      // Measured on the pill, not the pointer: what must stay on screen is
      // the pill, and at `active` it extends to the pointer's right.
      const atEdge = box.right >= window.innerWidth;

      el.setAttribute("data-cursor", target ? (atEdge ? "active-edge" : "active") : "");

      if (target) {
        const next = target.getAttribute("data-cursor-text");
        if (next) text.textContent = next;
      }
    };

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      moved = true;
      toX(x);
      toY(y);
      requestAnimationFrame(sync);
    };

    // The pointer can sit still while the page moves under it.
    const onScroll = () => {
      if (moved) requestAnimationFrame(sync);
    };

    const onDown = (e: MouseEvent) => {
      if (e.button === 0) gsap.to(el, { scale: 0.9, duration: 0.4, ease: "power2.out" });
    };

    const onUp = (e: MouseEvent) => {
      if (e.button === 0) gsap.to(el, { scale: 1, duration: 0.3, ease: "power2.out" });
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  return (
    <div ref={host} data-cursor="" aria-hidden className="cursor_wrap">
      <div className="cursor-bubble">
        <span ref={label} data-cursor-text-target className="cursor-bubble__text" />
      </div>
    </div>
  );
}
