"use client";

import { useRef, type CSSProperties } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/*
 * Each frame's trigger needs a refresh once the page has laid out, but a page
 * mounts several frames at once and every refresh re-measures every trigger
 * on it. Coalesce them into one, on the next frame.
 */
let refreshQueued = 0;
const queueRefresh = () => {
  if (refreshQueued) return;
  refreshQueued = requestAnimationFrame(() => {
    refreshQueued = 0;
    ScrollTrigger.refresh();
  });
};

/**
 * Media slot. Renders a placeholder image until real footage lands — swap
 * `src` for a <video> then; the wrapper owns the aspect ratio so the
 * surrounding grid never shifts.
 *
 * The image is intentionally taller than its frame (`height: 120%`) so it can
 * drift vertically inside the clip as the slot crosses the viewport — the
 * reference's approach, where `hero_home_img` is `height: 110%` and gets
 * translated by a `data-target-translate` amount.
 */
export function MediaFrame({
  ratio = "16 / 9",
  ratioMobile,
  src,
  alt = "",
  label,
  className = "",
  parallax = 24,
}: {
  ratio?: string;
  /** Aspect ratio below the md breakpoint. Defaults to `ratio`. */
  ratioMobile?: string;
  src?: string;
  /** Empty (decorative) unless the image carries content. */
  alt?: string;
  label?: string;
  className?: string;
  /** Drift distance as a percentage of the frame height. 0 disables it. */
  parallax?: number;
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!parallax) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const img = root.current?.querySelector("[data-parallax-target]");
      if (!img) return;

      /*
       * The element is `100 + parallax`% of the frame's height, pinned at
       * top: 0, so the surplus it can travel is `parallax` units of frame
       * height — but GSAP's yPercent is a share of the ELEMENT's height, not
       * the frame's. Converting: surplus / elementHeight.
       *
       * Travelling 0 -> -surplus keeps the top edge at or above the frame top
       * and the bottom edge at or below the frame bottom for the whole scrub.
       * (The previous -half..+half range was in frame units and drifted the
       * element clear of the frame, exposing a gap at the top.)
       */
      const surplus = (parallax / (100 + parallax)) * 100;

      gsap.fromTo(
        img,
        { yPercent: 0 },
        {
          yPercent: -surplus,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      );

      queueRefresh();
    },
    { scope: root, dependencies: [parallax, src] },
  );

  return (
    <div
      ref={root}
      style={
        {
          "--ratio-desktop": ratio,
          "--ratio-mobile": ratioMobile ?? ratio,
        } as CSSProperties
      }
      className={`media_frame group relative w-full overflow-hidden bg-chip ${className}`}
    >
      {src ? (
        // Outer span drifts (GSAP owns its transform); the image inside takes
        // the hover zoom, so the two never write the same property.
        <span
          data-parallax-target
          style={{ height: `${100 + parallax}%` }}
          className="absolute inset-x-0 top-0 block w-full overflow-hidden"
        >
          <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
          />
        </span>
      ) : (
        <div className="absolute inset-0 bg-foreground transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]" />
      )}
      {label && (
        <span className="absolute bottom-4 left-4 z-10 text-[13px] font-medium tracking-[-0.02em] text-background/80">
          {label}
        </span>
      )}
    </div>
  );
}
