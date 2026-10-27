"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { initSound, isSoundEnabled, subscribeSound } from "@/lib/sound";

/*
 * The nav's sound button, markup and motion from the reference.
 *
 * One speaker glyph with two sets of strokes over it: two arcs for "on", a
 * cross for "off". Toggling draws one set out and the other in along their
 * own length — strokeDashoffset from the path length to 0 — with a 1px blur
 * and fade riding along, 0.2s out, 0.3s in, 0.05s between paths, on
 * ease-secondary. The first paint is set without animating.
 *
 * The click itself is not handled here: the sound module matches this
 * button by class in its capturing document listener, flips the state and
 * persists it. This component only mirrors that state onto the icon and the
 * ARIA attributes.
 */
export function SoundToggle() {
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const btn = button.current;
    if (!btn) return;

    const curves = Array.from(btn.querySelectorAll<SVGPathElement>(".navbar_path_curve"));
    const crosses = Array.from(btn.querySelectorAll<SVGPathElement>(".navbar_path_cross"));
    [...curves, ...crosses].forEach((path) => {
      gsap.set(path, { strokeDasharray: path.getTotalLength() + 1 });
    });

    const hidden = {
      strokeDashoffset: (_: number, path: SVGPathElement) => path.getTotalLength() + 1,
      opacity: 0,
      filter: "blur(1px)",
    };
    const shown = { strokeDashoffset: 0, opacity: 1, filter: "blur(0px)" };

    let tl: gsap.core.Timeline | null = null;
    const apply = (on: boolean, animate: boolean) => {
      tl?.kill();
      btn.setAttribute("aria-pressed", String(on));
      btn.setAttribute("aria-label", on ? "Mute sound" : "Enable sound");
      const show = on ? curves : crosses;
      const hide = on ? crosses : curves;
      if (!animate) {
        gsap.set(hide, hidden);
        gsap.set(show, shown);
        return;
      }
      tl = gsap.timeline();
      tl.to(hide, { ...hidden, duration: 0.2, ease: "ease-secondary", stagger: 0.05 }, 0);
      tl.to(show, { ...shown, duration: 0.3, ease: "ease-secondary", stagger: 0.05 }, 0);
    };

    apply(isSoundEnabled(), false);
    const unsubscribe = subscribeSound((on) => apply(on, true));
    initSound();

    return () => {
      unsubscribe();
      tl?.kill();
    };
  }, []);

  return (
    <div className="navbar_left_sound_wrap">
      <button
        ref={button}
        type="button"
        aria-label="Enable sound"
        aria-pressed={false}
        className="navbar_left_sound_btn"
      >
        <span className="navbar_left_sound_container">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            viewBox="0 0 26 26"
            fill="none"
            className="navbar_left_sound_on"
            aria-hidden
          >
            <path
              d="M17 10.002C17.6491 10.8674 18 11.9201 18 13.002C18 14.0838 17.6491 15.1365 17 16.002"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="navbar_path_curve"
            />
            <path
              d="M20.364 6.63794C21.1998 7.47367 21.8627 8.46583 22.315 9.55776C22.7673 10.6497 23.0001 11.82 23.0001 13.0019C23.0001 14.1838 22.7673 15.3542 22.315 16.4461C21.8627 17.5381 21.1998 18.5302 20.364 19.3659"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="navbar_path_curve"
            />
            <path
              d="M23 10.002L17 16.002"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="navbar_path_cross"
            />
            <path
              d="M17 10.002L23 16.002"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="navbar_path_cross"
            />
            <path
              d="M12 5.70398C11.9998 5.56469 11.9583 5.42859 11.8809 5.31284C11.8034 5.19709 11.6934 5.10688 11.5647 5.05361C11.436 5.00033 11.2944 4.98637 11.1577 5.01349C11.0211 5.04061 10.8956 5.10759 10.797 5.20598L7.413 8.58898C7.2824 8.72036 7.12703 8.82451 6.95589 8.89541C6.78475 8.9663 6.60124 9.00252 6.416 9.00198H4C3.73478 9.00198 3.48043 9.10734 3.29289 9.29487C3.10536 9.48241 3 9.73676 3 10.002V16.002C3 16.2672 3.10536 16.5216 3.29289 16.7091C3.48043 16.8966 3.73478 17.002 4 17.002H6.416C6.60124 17.0014 6.78475 17.0377 6.95589 17.1086C7.12703 17.1795 7.2824 17.2836 7.413 17.415L10.796 20.799C10.8946 20.8978 11.0203 20.9651 11.1572 20.9924C11.2941 21.0196 11.436 21.0057 11.5649 20.9522C11.6939 20.8988 11.804 20.8083 11.8815 20.6922C11.959 20.5761 12.0002 20.4396 12 20.3V5.70398Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
    </div>
  );
}
