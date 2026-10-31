"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, DUR } from "@/lib/gsap";
import { assetUrl } from "@/lib/assetUrl";
import { MediaFrame } from "@/components/MediaFrame";
import { StickyPortrait } from "@/components/StickyPortrait";

const PORTRAIT = assetUrl("/assets/amar-ramesh.jpg");
/**
 * The same frame with the backdrop cut away, pixel-aligned with PORTRAIT.
 * Served from this origin, not through assetUrl: it is used as a CSS
 * mask-image, which is fetched in CORS mode, and the R2 bucket sends no
 * CORS headers — a cross-origin mask silently fails and the layer vanishes.
 */
const CUTOUT = "/assets/amar-ramesh-cutout.webp";

/** The greeting chip's headshot, already cropped to the face. */
const HEADSHOT = "/assets/amar-ramesh-headshot.jpg";

/**
 * One display line, in its own mask so it can rise into place. `lead` is the
 * line's first letter when it is an A, whose ink starts at its origin; every
 * other line opens on a straight stem (H, I, P, F, E, M) and takes the
 * default bearing. See .hero_line.
 */
function Line({ children, lead }: { children: ReactNode; lead?: "A" }) {
  return (
    <span className="hero_mask">
      <span className={`hero_line${lead ? ` hero_line--${lead}` : ""}`}>{children}</span>
    </span>
  );
}

/**
 * A two-line caption hung beside a display line, top-aligned with its caps.
 * `side` is which side of the word it hangs on.
 */
function Note({ side, children }: { side: "left" | "right"; children: ReactNode }) {
  return (
    <span
      aria-hidden
      className={`hero_note hidden md:block ${side === "left" ? "right-full mr-(--grid-gutter) text-right" : "left-full ml-3"}`}
    >
      {children}
    </span>
  );
}

/** The portrait set into the first line, cropped to the face. */
function Chip() {
  return (
    <span
      aria-hidden
      className="hero_chip relative mx-[0.12em] inline-block h-[0.78em] w-[0.78em] overflow-hidden rounded-full align-[-0.06em]"
    >
      <img
        src={HEADSHOT}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
    </span>
  );
}

/**
 * Hero, after sebastian-martinez.com's: the display type steps down the right
 * of the frame — a greeting, the name, then his five roles with small
 * captions hung off them — while the portrait sits in a 4:5 frame in the
 * bottom-left corner.
 *
 * Below `md` it takes the reference's phone layout instead: the portrait goes
 * full-bleed behind everything, the name heads the frame, and the roles
 * land at the bottom over a scrim, in white.
 *
 * Every display line rises out of its own mask as the photo wipes up.
 * The section is an inverted band, as About is, so the two read as one
 * ground and the portrait can hold in view across both. It overlaps About by
 * a pixel (`-mb-px`): ScrollSmoother leaves the seam on a fractional pixel,
 * where both grounds anti-alias their edge and the page's light ground showed
 * through as a hairline. It fills the viewport; About drops its top padding
 * from `md` (page.tsx) so the hero's own foot is the only gap between them.
 */
export function Hero({ start }: { start: boolean }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      // The navbar is rendered outside this component's scope, so its nodes
      // are queried from the document rather than as scoped selector strings.
      const q = (sel: string) => gsap.utils.toArray<HTMLElement>(document.querySelectorAll(sel));
      const navWrap = q(".navbar_wrap");

      if (reduced) {
        gsap.set(navWrap, { autoAlpha: 1 });
        return;
      }

      const navHome = q(".navbar_home");
      const navItems = q(".navbar_links_li");
      const navCta = q(".navbar_cta_wrap > *");

      // Initial states — everything waits below its mask until `start`. Set
      // from JS (not markup) so a script failure leaves the page readable.
      // 140, not 110: the masks clip past the line box (see .hero_mask), so a
      // hidden line has to clear that taller window too.
      gsap.set(".hero_line", { yPercent: 140 });
      gsap.set(".hero_chip", { scale: 0 });
      gsap.set(".hero_photo", { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(".hero_photo_img", { scale: 1.2 });
      gsap.set(navWrap, { autoAlpha: 0 });

      if (!start) return;

      const tl = gsap.timeline({ defaults: { ease: "ease-transition" } });

      tl.to(".hero_photo", { clipPath: "inset(0% 0% 0% 0%)", duration: DUR.slow })
        .to(".hero_photo_img", { scale: 1, duration: DUR.slow * 1.6 }, "<")
        .to(".hero_line", { yPercent: 0, duration: DUR.slow, stagger: 0.065 }, "<0.15")
        .to(".hero_chip", { scale: 1, duration: DUR.slow }, "-=0.6");

      // Navbar entrance, exactly as the reference sequences it: the wordmark
      // leads, then the links and CTA rise out of their own clips in stagger.
      tl.from(navHome, { yPercent: 100, duration: DUR.slow, rotate: 0.001 }, "<0.05")
        .to(navWrap, { autoAlpha: 1, duration: 0 }, "<")
        .from(navItems, { yPercent: 100, duration: DUR.slow, rotate: 0.001, stagger: 0.0625 }, "<")
        .from(navCta, { yPercent: 100, rotate: 0.001, duration: DUR.slow, stagger: 0.0625 }, "<");
    },
    { scope: root, dependencies: [start] },
  );

  return (
    <section
      ref={root}
      id="top"
      data-theme-section="invert"
      className="hero relative isolate -mb-px flex min-h-svh flex-col overflow-x-clip"
    >
      {/* Phones only: the portrait, full-bleed behind the type. From `md`
          it is the framed portrait in the shell below. */}
      <div className="hero_photo absolute inset-0 -z-10 overflow-hidden md:hidden">
        <img
          src={PORTRAIT}
          alt="Amar Ramesh"
          className="hero_photo_img absolute inset-0 h-full w-full object-cover object-[50%_20%]"
        />
        {/* Scrims, top and bottom, where white type sits over the photo. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(to_bottom,rgb(0_0_0/0.45),transparent_30%,transparent_45%,rgb(0_0_0/0.65))]"
        />
      </div>

      {/* Phones only: the figure again, cut from its backdrop and stacked
          over the name, so "Amar" reads as set behind him. It carries the
          same scrim, masked to his outline, so the layer is invisible except
          where it covers the type; it shares .hero_photo / .hero_photo_img
          with the portrait to wipe and settle in step with it. The roles
          (z-2 below) stay in front. */}
      <div
        aria-hidden
        className="hero_photo pointer-events-none absolute inset-0 z-1 overflow-hidden md:hidden"
      >
        <div
          className="hero_photo_img absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgb(0 0 0 / 0.45), transparent 30%, transparent 45%, rgb(0 0 0 / 0.65)), url(${CUTOUT})`,
            backgroundSize: "100% 100%, cover",
            backgroundPosition: "0 0, 50% 20%",
            backgroundRepeat: "no-repeat",
            maskImage: `url(${CUTOUT})`,
            maskSize: "cover",
            maskPosition: "50% 20%",
            maskRepeat: "no-repeat",
          }}
        />
      </div>

      {/* On phones the bar sits over the photo, so claim it as a photo
          section (light ink on every stop); hidden from `md`, where the bar
          sits on the ground. */}
      <div
        aria-hidden
        data-theme-section="photo"
        className="pointer-events-none absolute inset-0 md:hidden"
      />

      <div className="shell relative flex flex-1 flex-col pt-24 pb-5 max-md:text-white md:pt-32 md:pb-8">
        {/* The display stack. Each line takes its own columns, so the stack
            steps right as it descends the way the reference's does; the
            crafts share one left edge (column 7). */}
        <h1 className="hero_title relative z-2 order-3 mt-auto md:order-1 md:mt-0 md:grid-12">
          <span className="hidden md:col-span-8 md:col-start-5 md:block">
            <Line>
              Hi, welcome
              <Chip />
              home
            </Line>
          </span>
          <span className="hidden md:col-span-7 md:col-start-6 md:block">
            <Line>It&rsquo;s me - Amar</Line>
          </span>
          <span className="block md:col-span-6 md:col-start-7">
            <span className="relative inline-block">
              <Line>Photographer,</Line>
              <Note side="left">
                Weddings, temples
                <br />
                people, places
              </Note>
            </span>
          </span>
          <span className="block md:col-span-6 md:col-start-7">
            <span className="relative inline-block">
              <Line>Filmmaker,</Line>
              <Note side="right">
                Documentaries
                <br />
                short films
              </Note>
            </span>
          </span>
          <span className="block md:col-span-6 md:col-start-7">
            <Line lead="A">Author,</Line>
          </span>
          <span className="block md:col-span-6 md:col-start-7">
            <span className="relative inline-block">
              <Line>Entrepreneur,</Line>
              <Note side="left">
                Studio A, Mara Labs
                <br />
                Big Short Films
              </Note>
            </span>
          </span>
          <span className="block md:col-span-6 md:col-start-7">
            <span className="relative inline-block">
              <Line>Mentor</Line>
              <Note side="right">
                Camera was only
                <br />
                the beginning
              </Note>
            </span>
          </span>
        </h1>

        {/* Phones only: the name heads the frame, as the reference's does. */}
        <p aria-hidden className="hero_title hero_sig order-1 md:hidden">
          <Line lead="A">Amar</Line>
        </p>

        {/* From `md`: the portrait in a 4:5 frame with a slow drift, in the
            bottom-left corner. Taken out of flow and bottom-aligned with the shell's padding, so it
            sits beside the stack (columns 1–3, clear of the captions hung
            left of column 7) rather than below it, and the hero still fits
            one screen. */}
        <div className="hero_frame absolute bottom-8 left-[var(--grid-margin)] hidden md:block">
          {/* Held in view, once it nears the top, until About's content has
              scrolled past — hence `overflow-x-clip` on the section rather
              than `overflow-hidden`, which would cut it off as it travels. */}
          <StickyPortrait through="#about">
            <MediaFrame
              ratio="4 / 5"
              src={PORTRAIT}
              alt="Portrait of Amar Ramesh"
              parallax={14}
              className="hero_photo"
            />
          </StickyPortrait>
        </div>
      </div>
    </section>
  );
}
