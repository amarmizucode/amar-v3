"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollSmoother } from "@/lib/gsap";

/**
 * GSAP ScrollSmoother. Smoothing is applied by transforming #smooth-content
 * inside a fixed-height #smooth-wrapper, so anything that must stay pinned to
 * the viewport (header, preloader, overlays) has to render OUTSIDE this
 * wrapper — transformed ancestors break `position: fixed`.
 *
 * ScrollSmoother owns ScrollTrigger.update itself, so scrub-linked triggers
 * stay in sync with the smoothed position with no extra wiring.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const wrapper = useRef<HTMLDivElement>(null);

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
      normalizeScroll: true,
      ignoreMobileResize: true,
    });

    return () => smoother.kill();
  }, []);

  return (
    <div id="smooth-wrapper" ref={wrapper}>
      <div id="smooth-content">{children}</div>
    </div>
  );
}
