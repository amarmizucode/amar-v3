"use client";

import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useGSAP } from "@gsap/react";
import { gsap, DUR } from "@/lib/gsap";

export type ModalFilm = {
  id: string;
  title: string;
  /** The video's native frame; omitted means 16:9. */
  aspect?: [number, number];
  /** Channel name for the caption. */
  channel: string;
};

/**
 * A film played in place, over the blurred page — the documentary page's
 * pinned player on its own, for surfaces that open one film at a time (the
 * home page's carousel). Same stage: scrim, the film's own ratio capped to
 * the viewport, Close above the frame's corner on md+ and along the bottom
 * on a phone, the caption under it all. Escape, the scrim and Close all
 * fade it out before `onClose` unmounts it.
 *
 * Portals to <body> so `position: fixed` means the viewport, not
 * ScrollSmoother's transformed content.
 */
export function FilmModal({ film, onClose }: { film: ModalFilm | null; onClose: () => void }) {
  const overlay = useRef<HTMLDivElement>(null);
  const player = useRef<HTMLIFrameElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    const el = overlay.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!el || reduced) {
      onClose();
      return;
    }
    gsap.to(el, { autoAlpha: 0, duration: DUR.fast, ease: "ease-transition", onComplete: onClose });
  }, [onClose]);

  // Escape closes; focus moves into the dialog and back to the card after.
  useEffect(() => {
    if (!film) return;
    const returnTo = document.activeElement as HTMLElement | null;
    closeBtn.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      returnTo?.focus({ preventScroll: true });
    };
  }, [film, close]);

  // Lock the page behind the player, restoring what was there before.
  useEffect(() => {
    if (!film) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [film]);

  /*
   * Sound, as on the documentary page: the iframe loads muted (autoplay
   * demands it) and is unmuted through YouTube's postMessage API — the click
   * that opened it is the gesture that lets the browser honour that. Retried
   * briefly because a cold player may not be listening yet.
   */
  useEffect(() => {
    if (!film) return;
    const send = () => {
      const w = player.current?.contentWindow;
      if (!w) return;
      for (const [func, args] of [
        ["unMute", []],
        ["setVolume", [100]],
        ["playVideo", []],
      ] as const) {
        w.postMessage(JSON.stringify({ event: "command", func, args }), "*");
      }
    };
    send();
    const retry = window.setInterval(send, 350);
    const stop = window.setTimeout(() => window.clearInterval(retry), 2500);
    return () => {
      window.clearInterval(retry);
      window.clearTimeout(stop);
    };
  }, [film]);

  useGSAP(
    () => {
      const el = overlay.current;
      if (!film || !el) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(el, { autoAlpha: 1 });
        return;
      }
      gsap
        .timeline({ defaults: { ease: "ease-transition" } })
        .fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: DUR.fast, overwrite: true })
        .fromTo(
          el.querySelector("[data-player-frame]"),
          { scale: 0.96 },
          { scale: 1, duration: DUR.normal },
          "<",
        );
    },
    { dependencies: [film] },
  );

  if (!film) return null;
  const [aw, ah] = film.aspect ?? [16, 9];

  return createPortal(
    <div
      ref={overlay}
      role="dialog"
      aria-modal
      aria-label={film.title}
      className="fixed inset-0 z-[1200] text-foreground"
    >
      <button
        type="button"
        aria-label="Close player"
        tabIndex={-1}
        onClick={close}
        className="absolute inset-0 cursor-pointer bg-background/85 backdrop-blur-sm"
      />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          data-player-frame
          className="pointer-events-auto relative w-screen bg-black md:w-(--frame-w)"
          style={
            {
              aspectRatio: `${aw} / ${ah}`,
              "--frame-w": `min(80vw, calc(81svh * ${aw} / ${ah}))`,
            } as React.CSSProperties
          }
        >
          {/* Referrer policy and origin are both required, or YouTube
              refuses to configure the player (error 153). */}
          <iframe
            key={film.id}
            ref={player}
            src={`https://www.youtube-nocookie.com/embed/${film.id}?autoplay=1&mute=1&rel=0&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`}
            title={film.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
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
            {film.title} &middot; {film.channel}
          </p>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 flex justify-center pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] md:hidden">
        <button
          type="button"
          onClick={close}
          className="close-btn"
          style={{ padding: "0.625rem 1.25rem" }}
        >
          Close
        </button>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 hidden items-center justify-center pb-6 text-[13px] font-medium md:flex">
        {film.title} &middot; {film.channel}
      </div>
    </div>,
    document.body,
  );
}
