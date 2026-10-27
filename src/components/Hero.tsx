"use client";

import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText, DUR } from "@/lib/gsap";
import { createDotShader, type DotShaderHandle } from "@/lib/dotShader";
import { CtaPill } from "@/components/CtaPill";

/** Reads a theme custom property off <body>, falling back when unset. */
function readThemeColor(prop: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.body).getPropertyValue(prop).trim();
  return value || fallback;
}

/**
 * Hero: masked line reveal on the copy, display type rising from a mask, and
 * the dot-matrix shader revealing alongside — the reference's intro timeline
 * (`yt`) with this project's content.
 */
export function Hero({ start }: { start: boolean }) {
  const root = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasWrap = useRef<HTMLDivElement>(null);
  const shader = useRef<DotShaderHandle | null>(null);

  // Shader lives outside the GSAP context so it survives re-renders.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!canvasWrap.current || !canvasRef.current) return;

    shader.current = createDotShader(canvasWrap.current, canvasRef.current, {
      pixelSize: 6,
      gooeyness: 0.58,
      // Well below the ported default (0.0045) — a slow, barely-moving drift.
      timeSpeed: 0.0006,
      // invert:0 keeps the dots sparse instead of flooding to a solid mass.
      invert: 0,
      contrast: 1.1,
      bias: -0.08,
      // Seeded from the live theme, then kept in sync below.
      bg: readThemeColor("--color--background--100", "#ffffff"),
      fg: readThemeColor("--color--foreground--100", "#000000"),
      transparentBg: 1,
    });

    return () => {
      shader.current?.destroy();
      shader.current = null;
    };
  }, []);

  // The theme ramp is a data attribute on <body>; repaint the dots when it
  // changes so they never stay black on a dark stop.
  useEffect(() => {
    const sync = () =>
      shader.current?.setForeground(readThemeColor("--color--foreground--100", "#000000"));
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { attributes: true, attributeFilter: ["data-theme"] });
    sync();
    return () => observer.disconnect();
  }, []);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const paras = gsap.utils.toArray<HTMLElement>(".hero_content_p");
      const splits = paras.map(
        (p) => new SplitText(p, { type: "lines", linesClass: "split-line", mask: "lines" }),
      );
      const displaySplits = gsap.utils
        .toArray<HTMLElement>(".hero_display")
        .map((d) => new SplitText(d, { type: "lines", linesClass: "split-line", mask: "lines" }));

      const allLines = splits.flatMap((s) => s.lines);
      const displayLines = displaySplits.flatMap((s) => s.lines);

      if (reduced) {
        gsap.set([...allLines, ...displayLines], { yPercent: 0 });
        gsap.set(".hero_content_cta", { autoAlpha: 1, y: 0 });
        gsap.set(".hero_canvas_wrap", { autoAlpha: 0.32 });
        gsap.set(document.querySelectorAll(".navbar_wrap"), { autoAlpha: 1 });
        return;
      }

      // The navbar is rendered outside this component's scope, so its nodes
      // are queried from the document rather than as scoped selector strings.
      const q = (sel: string) => gsap.utils.toArray<HTMLElement>(document.querySelectorAll(sel));
      const navWrap = q(".navbar_wrap");
      const navHome = q(".navbar_home");
      const navItems = q(".navbar_links_li");
      // :not(.preq-trigger): the print-request trigger manages its own
      // entrance (it collapses while the list is empty); riding this intro
      // too left it parked a row below the CTA whenever the tween was
      // interrupted mid-flight.
      const navCta = q(".navbar_cta_wrap > :not(.preq-trigger)");

      // Initial states — everything sits below its mask until `start`. Set from
      // JS (not markup) so a script failure leaves the page readable.
      gsap.set(allLines, { yPercent: 110 });
      gsap.set(displayLines, { yPercent: 110 });
      gsap.set(".hero_content_cta", { autoAlpha: 0, y: 16 });
      gsap.set(".hero_canvas_wrap", { autoAlpha: 0 });
      gsap.set(navWrap, { autoAlpha: 0 });

      if (!start) return;

      const tl = gsap.timeline({ defaults: { ease: "ease-transition" } });

      tl.to(allLines, { yPercent: 0, duration: DUR.slow, stagger: 0.05 })
        .to(displayLines, { yPercent: 0, duration: DUR.slow, stagger: 0.065 }, "-=0.85")
        .to(".hero_canvas_wrap", { autoAlpha: 0.32, duration: DUR.slow }, "<")
        .to(".hero_content_cta", { autoAlpha: 1, y: 0, duration: DUR.slow }, "-=0.7");

      // Navbar entrance, exactly as the reference sequences it: the wordmark
      // leads, then the links and CTA rise out of their own clips in stagger.
      tl.from(navHome, { yPercent: 100, duration: DUR.slow, rotate: 0.001 }, "<0.05")
        .to(navWrap, { autoAlpha: 1, duration: 0 }, "<")
        .from(navItems, { yPercent: 100, duration: DUR.slow, rotate: 0.001, stagger: 0.0625 }, "<")
        .from(navCta, { yPercent: 100, rotate: 0.001, duration: DUR.slow, stagger: 0.0625 }, "<");

      // Shader reveal rides the same timeline.
      if (shader.current) {
        tl.to(
          shader.current.revealState,
          {
            reveal: 1,
            duration: 3,
            ease: "ease-secondary",
            onUpdate: shader.current.syncReveal,
          },
          "<",
        );
      }
    },
    { scope: root, dependencies: [start] },
  );

  return (
    <section
      ref={root}
      id="top"
      className="hero_home relative isolate flex min-h-svh flex-col overflow-hidden shell pt-28 md:pt-32 pb-8"
    >
      {/* Dot texture, clipped to the section and held well behind the type. */}
      <div
        ref={canvasWrap}
        data-hero-canvas-container
        className="hero_canvas_wrap pointer-events-none absolute right-0 top-0 -z-10 h-[55%] w-full opacity-0 mix-blend-multiply md:w-[42%]"
        style={{
          maskImage: "radial-gradient(120% 100% at 100% 0%, #000 30%, transparent 78%)",
          WebkitMaskImage: "radial-gradient(120% 100% at 100% 0%, #000 30%, transparent 78%)",
        }}
      >
        <canvas ref={canvasRef} data-hero-canvas className="h-full w-full" />
      </div>

      {/* One row, vertically centred: a narrow copy column with its CTA on
          the left, and the statement filling the rest at display size. */}
      <div className="grid-12 my-auto shrink-0 items-center gap-y-12">
        <div className="col-span-12 md:col-span-3">
          <p className="hero_content_p text-lede font-semibold">
            What started with photography has taken me into the fascinating worlds of art,
            architecture, culture, films and books. I&rsquo;ve met some incredible people along the
            way, discovered places I might never have visited otherwise, and found myself exploring
            things I never imagined I&rsquo;d be doing. And there&rsquo;s still so much more I want
            to discover.
          </p>
          <div className="hero_content_cta mt-8">
            <CtaPill label="Explore My Work" href="/#works" />
          </div>
        </div>

        <div className="col-span-12 md:col-start-5 md:col-span-8">
          <p className="hero_display display-statement">The camera was just the beginning</p>
        </div>
      </div>

      <div className="grid-12 shrink-0 pt-20 md:pt-32">
        <h1 className="contents">
          <span className="hero_display display optical-A col-span-12 md:col-span-4">Amar</span>
          <span className="hero_display display optical-R col-span-12 md:col-span-8">Ramesh</span>
        </h1>
      </div>
    </section>
  );
}
