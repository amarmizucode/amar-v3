"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useGSAP } from "@gsap/react";
import { gsap, DUR } from "@/lib/gsap";
import type { Frame } from "@/lib/photography";

/**
 * One photograph over the blurred page — FilmModal's stage for a still:
 * scrim, the frame at its own ratio capped to the viewport, Close above its
 * corner on md+ and along the bottom on a phone, the caption under it all.
 * Escape and the scrim close it; the arrow keys and the side buttons step
 * through `frames`, wrapping at the ends.
 *
 * Portals to <body> so `position: fixed` means the viewport.
 */
export function PhotoLightbox({
  frames,
  index,
  caption,
  onStep,
  onClose,
}: {
  frames: Frame[];
  /** The frame showing, or null when closed. */
  index: number | null;
  caption: string;
  onStep: (index: number) => void;
  onClose: () => void;
}) {
  const overlay = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const open = index !== null;

  const close = () => {
    const el = overlay.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onClose();
      return;
    }
    gsap.to(el, { autoAlpha: 0, duration: DUR.fast, ease: "ease-transition", onComplete: onClose });
  };

  const step = (by: number) => {
    if (index === null) return;
    onStep((index + by + frames.length) % frames.length);
  };

  // Keys: Escape out, arrows between frames. Re-bound per frame so the
  // handlers see the current index.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // Focus moves into the dialog and back to the card after; the page is
  // locked behind it.
  useEffect(() => {
    if (!open) return;
    const returnTo = document.activeElement as HTMLElement | null;
    closeBtn.current?.focus({ preventScroll: true });
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
      returnTo?.focus({ preventScroll: true });
    };
  }, [open]);

  useGSAP(
    () => {
      const el = overlay.current;
      if (!open || !el) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(el, { autoAlpha: 1 });
        return;
      }
      gsap
        .timeline({ defaults: { ease: "ease-transition" } })
        .fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: DUR.fast, overwrite: true })
        .fromTo(
          el.querySelector("[data-photo-frame]"),
          { scale: 0.96 },
          { scale: 1, duration: DUR.normal },
          "<",
        );
    },
    { dependencies: [open] },
  );

  if (index === null) return null;
  const frame = frames[index];
  const label = `${caption} · ${index + 1} / ${frames.length}`;

  return createPortal(
    <div
      ref={overlay}
      role="dialog"
      aria-modal
      aria-label={label}
      className="fixed inset-0 z-[1200] text-foreground"
    >
      <button
        type="button"
        aria-label="Close photo"
        tabIndex={-1}
        onClick={close}
        className="absolute inset-0 cursor-pointer bg-background/85 backdrop-blur-sm"
      />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          data-photo-frame
          className="pointer-events-auto relative w-screen bg-chip md:w-(--frame-w)"
          style={
            {
              aspectRatio: frame.ratio,
              "--frame-w": `min(80vw, calc(78svh * ${frame.width} / ${frame.height}))`,
            } as React.CSSProperties
          }
        >
          <img
            key={frame.full}
            src={frame.full}
            alt={`${caption}, photograph ${index + 1}`}
            className="absolute inset-0 h-full w-full object-contain"
          />
          <div className="absolute right-0 top-0 hidden -translate-y-[calc(100%+10px)] items-center gap-2 md:flex">
            <kbd className="close-kbd" aria-hidden>
              Esc
            </kbd>
            <button ref={closeBtn} type="button" onClick={close} className="close-btn">
              Close
            </button>
          </div>
          <p className="absolute inset-x-0 top-full mt-3 text-center text-[13px] font-medium md:hidden">
            {label}
          </p>
        </div>
      </div>

      {frames.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={() => step(-1)}
            className="close-btn fixed left-[var(--site-margin)] top-1/2 hidden -translate-y-1/2 md:block"
          >
            &larr;
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={() => step(1)}
            className="close-btn fixed right-[var(--site-margin)] top-1/2 hidden -translate-y-1/2 md:block"
          >
            &rarr;
          </button>
        </>
      )}

      <div className="fixed inset-x-0 bottom-0 flex justify-center gap-2 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] md:hidden">
        {frames.length > 1 && (
          <button type="button" aria-label="Previous photo" onClick={() => step(-1)} className="close-btn" style={{ padding: "0.625rem 1rem" }}>
            &larr;
          </button>
        )}
        <button type="button" onClick={close} className="close-btn" style={{ padding: "0.625rem 1.25rem" }}>
          Close
        </button>
        {frames.length > 1 && (
          <button type="button" aria-label="Next photo" onClick={() => step(1)} className="close-btn" style={{ padding: "0.625rem 1rem" }}>
            &rarr;
          </button>
        )}
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 hidden items-center justify-center pb-6 text-[13px] font-medium md:flex">
        {label}
      </div>
    </div>,
    document.body,
  );
}
