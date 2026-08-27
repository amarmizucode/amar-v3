"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Theme scale + grid overlay, ported from billysweeney.com.
 *
 * The reference is not a light/dark switch. It is a 17-stop ramp
 * (`theme--00` … `theme--16`) written as a class on <body> and driven by a
 * range input rotated -90deg so it reads as a vertical slider. Stop 00 is
 * pure black, 16 pure white, with tinted stops in between; each defines one
 * foreground at nine opacities over one background.
 *
 * Here the stop lives in React state and is mirrored onto <body> as
 * `data-theme`, since <body> itself is rendered by the server layout. The
 * grid overlay is the reference's `app-grid-overlay`: twelve columns each
 * holding two lines (the gutter edges), animating height 0 -> 100% with a
 * staggered delay so the rule sweeps across the page.
 */

const STOPS = 17; // 00..16
const DEFAULT_STOP = 16; // the reference ships on theme--16 (white)

const pad = (n: number) => String(n).padStart(2, "0");

export function AppControls() {
  const [stop, setStop] = useState(DEFAULT_STOP);
  const [sliderOpen, setSliderOpen] = useState(false);
  const [gridOn, setGridOn] = useState(false);
  const themeOption = useRef<HTMLDivElement>(null);
  const sliderTrack = useRef<HTMLInputElement>(null);

  // The reference honours prefers-color-scheme on load: if it is still on the
  // default white stop and the user prefers dark, it jumps to stop 00.
  useEffect(() => {
    if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
      setStop((current) => (current === DEFAULT_STOP ? 0 : current));
    }
  }, []);

  // <body> is owned by the server layout, so drive its attributes directly.
  useEffect(() => {
    document.body.dataset.theme = pad(stop);
  }, [stop]);

  useEffect(() => {
    if (sliderOpen) document.body.dataset.themeSlider = "open";
    else delete document.body.dataset.themeSlider;
  }, [sliderOpen]);

  // Map a pointer position onto a stop. The track is rotated -90deg with its
  // origin at top-left, so on screen it runs upward from that origin: the
  // distance travelled is (origin.bottom - clientY) over the element's width.
  const stopFromPointer = (clientY: number) => {
    const track = sliderTrack.current;
    if (!track) return null;
    const box = track.getBoundingClientRect();
    // getBoundingClientRect reports the post-rotation box, so the on-screen
    // length of the track is its height here.
    const travelled = box.bottom - clientY;
    const ratio = Math.min(Math.max(travelled / box.height, 0), 1);
    return Math.round(ratio * (STOPS - 1));
  };

  const onSliderPointerDown = (event: React.PointerEvent<HTMLInputElement>) => {
    // Claim the pointer so movement outside the narrow track still tracks.
    event.currentTarget.setPointerCapture(event.pointerId);
    const next = stopFromPointer(event.clientY);
    if (next !== null) setStop(next);
  };

  const onSliderPointerMove = (event: React.PointerEvent<HTMLInputElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    // Stop the page scrolling with the drag on touch.
    event.preventDefault();
    const next = stopFromPointer(event.clientY);
    if (next !== null) setStop(next);
  };

  const onSliderPointerUp = (event: React.PointerEvent<HTMLInputElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  // On touch the slider opens by tap and closes on any outside tap, matching
  // the reference's touchevents branch.
  useEffect(() => {
    if (!sliderOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!themeOption.current?.contains(event.target as Node)) setSliderOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [sliderOpen]);

  return (
    <>
      <aside className="app-aside">
        <div className="options">
          <div
            ref={themeOption}
            className="option theme"
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse") setSliderOpen(true);
            }}
            onPointerLeave={(event) => {
              if (event.pointerType === "mouse") setSliderOpen(false);
            }}
            onPointerDown={(event) => {
              if (event.pointerType !== "mouse") setSliderOpen(true);
            }}
          >
            <div className="icon-container">
              <svg
                className="icon theme"
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 32 32"
                aria-hidden
              >
                <path d="M17 2h-2v6h2V2zm-1 8c-3.31372 0-6 2.68628-6 6s2.68628 6 6 6 6-2.68628 6-6-2.68628-6-6-6zm0 10c-2.20911 0-4-1.79089-4-4s1.79089-4 4-4 4 1.79089 4 4-1.79089 4-4 4zm-1 10h2v-6h-2v6zM11.05029 9.63605 6.80762 5.39337 5.39337 6.80762l4.24268 4.24268 1.41424-1.41425zm9.89954 12.72796 4.24255 4.24261 1.41425-1.41425-4.24261-4.24268-1.41419 1.41432zM8 15H2v2h6v-2zm16 0v2h6v-2h-6zM5.39337 25.19238l1.41425 1.41425 4.24268-4.24261-1.41425-1.41431-4.24268 4.24267zM26.60663 6.80762l-1.41425-1.41425-4.24268 4.24268 1.41431 1.41412 4.24262-4.24255z" />
              </svg>
            </div>

            <div className="slider-container">
              {/* 17 dots, one per stop. */}
              <div className="dots">
                {Array.from({ length: STOPS }).map((_, i) => (
                  <div key={i} className="dot" />
                ))}
              </div>
              <input
                ref={sliderTrack}
                className="slider"
                type="range"
                min={0}
                max={STOPS - 1}
                step={1}
                value={stop}
                aria-label="Theme"
                onChange={(event) => setStop(Number(event.target.value))}
                onPointerDown={onSliderPointerDown}
                onPointerMove={onSliderPointerMove}
                onPointerUp={onSliderPointerUp}
                onPointerCancel={onSliderPointerUp}
              />
            </div>
          </div>

          <button
            type="button"
            className="option grid"
            aria-pressed={gridOn}
            aria-label="Toggle grid overlay"
            onClick={() => setGridOn((on) => !on)}
          >
            <div className="content">
              <svg
                className="icon grid"
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 32 32"
                aria-hidden
              >
                <path d="M5 28h2V4H5v24zm5 0h2V4h-2v24zm5 0h2V4h-2v24zm5 0h2V4h-2v24zm5-24v24h2V4h-2z" />
              </svg>
            </div>
          </button>
        </div>
      </aside>

      {/* Twelve columns, two lines each — the gutter edges. */}
      <div className={`app-grid-overlay${gridOn ? " is--visible" : ""}`} aria-hidden>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="column">
            <div className="line" />
            <div className="line" />
          </div>
        ))}
      </div>
    </>
  );
}
