"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Image trail — frames spawning under the cursor as it travels the section,
 * each blooming in where the pointer has covered enough ground and fading
 * out a beat later.
 *
 * Renders an absolute layer over its parent (which must be positioned) and
 * listens on that parent, so the whole section is the hover zone while the
 * layer itself takes no pointer. Pure decoration: aria-hidden, skipped for
 * reduced motion and on coarse pointers, where there is no cursor to trail.
 *
 * The deck can run to hundreds of sources: the layer holds only POOL card
 * elements and swaps sources into them. Sources come off a shuffled queue —
 * every image appears once before any repeats — and are preloaded a few
 * deals ahead, so a card never blooms in before its image is in cache; a
 * deal that finds nothing loaded yet re-deals a recently shown source
 * instead of showing an empty card. Mount preloads only the first window
 * (LOOKAHEAD thumbs), so the deck's size costs nothing up front.
 */

/** Cards in the layer — the most that can be mid-animation at once. */
const POOL = 16;
/** Path distance between deals, px. */
const THRESHOLD = 90;
/** Sources preloaded ahead of the next deal. */
const LOOKAHEAD = 5;

export function ImageTrail({ images }: { images: string[] }) {
  const layer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = layer.current;
    const zone = el?.parentElement;
    if (!el || !zone || images.length === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const cards = Array.from(el.children) as HTMLImageElement[];
    gsap.set(cards, { xPercent: -50, yPercent: -50, autoAlpha: 0 });

    let queue: string[] = [];
    const draw = () => {
      if (queue.length === 0) queue = gsap.utils.shuffle([...images]);
      return queue.pop() as string;
    };

    /* The preload window, each entry keeping its Image so `complete` can be
       read at deal time. A deal takes the first finished entry; with none
       finished (a fast sweep on a cold cache) it re-deals a recently shown,
       known-warm source rather than blooming in an empty card. */
    const ready: Array<{ src: string; img: HTMLImageElement }> = [];
    const topUp = () => {
      while (ready.length < LOOKAHEAD) {
        const src = draw();
        const img = new Image();
        img.src = src;
        ready.push({ src, img });
      }
    };
    topUp();

    const shown: string[] = [];
    const take = () => {
      const i = ready.findIndex((entry) => entry.img.complete);
      if (i !== -1) {
        const [entry] = ready.splice(i, 1);
        topUp();
        shown.push(entry.src);
        if (shown.length > 24) shown.shift();
        return entry.src;
      }
      return shown.length ? shown[Math.floor(Math.random() * shown.length)] : null;
    };

    /* The pointer's last spawn point, in layer coordinates. `primed` resets
       on leave so re-entry measures from the entry point, not across the
       gap the cursor skipped. */
    let last = { x: 0, y: 0 };
    let primed = false;
    let next = 0;
    let stack = 0;

    const spawn = (x: number, y: number) => {
      /* Round-robin through the pool: the shuffled queue supplies the
         randomness, and cycling in order means a card is never stolen back
         until POOL deals later, however fast the sweep. */
      const src = take();
      if (!src) return;
      const card = cards[next];
      next = (next + 1) % cards.length;
      card.src = src;
      gsap.killTweensOf(card);
      gsap.set(card, { x, y, zIndex: ++stack, rotation: gsap.utils.random(-9, 9) });
      gsap
        .timeline()
        .fromTo(
          card,
          { autoAlpha: 0, scale: 0.4 },
          { autoAlpha: 1, scale: 1, duration: 0.45, ease: "expo.out" },
        )
        .to(card, { autoAlpha: 0, scale: 0.92, duration: 0.55, ease: "power2.in" }, "+=0.35");
    };

    const onMove = (event: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      if (!primed) {
        last = { x, y };
        primed = true;
        return;
      }
      /* Deal a card every THRESHOLD px ALONG the pointer's path, not one
         per event: a fast sweep covers hundreds of pixels between events,
         and dealing only at event positions left gaps the size of the
         sweep. */
      let dist = Math.hypot(x - last.x, y - last.y);
      while (dist >= THRESHOLD) {
        const t = THRESHOLD / dist;
        last = { x: last.x + (x - last.x) * t, y: last.y + (y - last.y) * t };
        dist = Math.hypot(x - last.x, y - last.y);
        spawn(last.x, last.y);
      }
    };

    const onLeave = () => {
      primed = false;
    };

    zone.addEventListener("mousemove", onMove);
    zone.addEventListener("mouseleave", onLeave);
    return () => {
      zone.removeEventListener("mousemove", onMove);
      zone.removeEventListener("mouseleave", onLeave);
      gsap.killTweensOf(cards);
    };
  }, [images]);

  return (
    <div ref={layer} aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-clip">
      {Array.from({ length: POOL }, (_, i) => (
        // eslint-disable-next-line @next/next/no-img-element -- decorative pool cards; sources are swapped in at deal time.
        <img key={i} alt="" decoding="async" className="trail_card" />
      ))}
    </div>
  );
}
