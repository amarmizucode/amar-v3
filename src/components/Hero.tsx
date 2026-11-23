"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText, DUR } from "@/lib/gsap";
import { assetUrl } from "@/lib/assetUrl";

/** The phone layout's full-bleed portrait. */
const PORTRAIT = assetUrl("/assets/amar-ramesh.jpg");
/**
 * The same frame with the backdrop cut away, pixel-aligned with PORTRAIT.
 * Served from this origin, not through assetUrl: it is used as a CSS
 * mask-image, which is fetched in CORS mode, and the R2 bucket sends no
 * CORS headers — a cross-origin mask silently fails and the layer vanishes.
 */
const CUTOUT = "/assets/amar-ramesh-cutout.webp";

/**
 * One line of the crafts stack, in its own mask so it can rise into place.
 * `lead` is the line's first letter when it is an A, whose ink starts at its
 * origin; every other line opens on a straight stem (P, F, E, M) and takes
 * the default bearing. See .hero_line.
 */
function Line({ children, lead }: { children: ReactNode; lead?: "A" }) {
  return (
    <span className="hero_mask">
      <span className={`hero_line${lead ? ` hero_line--${lead}` : ""}`}>{children}</span>
    </span>
  );
}

/**
 * A two-line caption hung beside a craft, top-aligned with its caps. `side`
 * is which side of the word it hangs on. Desktop only.
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

/**
 * One craft, linking to its work, with its caption when it has one. A plain
 * anchor, not next/link, so the route curtain's click handler picks it up.
 * The row (`data-craft`) is what dims on hover, caption and all; the anchor
 * (`data-craft-trigger`) is what takes it, so the empty run beside a short
 * word doesn't.
 */
function Craft({
  children,
  href,
  lead,
  note,
  side = "left",
}: {
  children: ReactNode;
  href: string;
  lead?: "A";
  note?: ReactNode;
  side?: "left" | "right";
}) {
  return (
    <span data-craft className="block">
      <span className="relative inline-block">
        <a href={href} data-craft-trigger className="block">
          <Line lead={lead}>{children}</Line>
        </a>
        {note && <Note side={side}>{note}</Note>}
      </span>
    </span>
  );
}

/**
 * Hero: the crafts stack and the name, each rising from a mask — the
 * reference's intro timeline (`yt`) with this project's content.
 *
 * The crafts hover as the Services list's rows do (Services.tsx), without
 * its frames: the hovered one stays at full strength while the rest drop to
 * 30%, and leaving the stack returns it to rest. Pointer devices only; on
 * touch a tap is the link.
 */
export function Hero({ start }: { start: boolean }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(hover: hover) and (pointer: fine)", () => {
        const stack = root.current?.querySelector<HTMLElement>("[data-crafts]");
        if (!stack) return;
        const rows = gsap.utils.toArray<HTMLElement>("[data-craft]", stack);
        const triggers = gsap.utils.toArray<HTMLElement>("[data-craft-trigger]", stack);

        const activate = (i: number) =>
          rows.forEach((row, n) =>
            gsap.to(row, { opacity: n === i ? 1 : 0.3, duration: 0.2, ease: "ease-fade" }),
          );

        // Rest: every craft full strength.
        const reset = () => gsap.to(rows, { opacity: 1, duration: 0.2, ease: "ease-fade" });

        const offs = triggers.map((trigger, i) => {
          const onEnter = () => activate(i);
          trigger.addEventListener("mouseenter", onEnter);
          return () => trigger.removeEventListener("mouseenter", onEnter);
        });
        stack.addEventListener("mouseleave", reset);

        return () => {
          offs.forEach((off) => off());
          stack.removeEventListener("mouseleave", reset);
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const displaySplits = gsap.utils
        .toArray<HTMLElement>(".hero_display")
        .map((d) => new SplitText(d, { type: "lines", linesClass: "split-line", mask: "lines" }));

      const displayLines = displaySplits.flatMap((s) => s.lines);

      if (reduced) {
        gsap.set([...displayLines, ".hero_line"], { yPercent: 0 });
        gsap.set(document.querySelectorAll(".navbar_wrap"), { autoAlpha: 1 });
        return;
      }

      // The navbar is rendered outside this component's scope, so its nodes
      // are queried from the document rather than as scoped selector strings.
      const q = (sel: string) => gsap.utils.toArray<HTMLElement>(document.querySelectorAll(sel));
      const navWrap = q(".navbar_wrap");
      const navHome = q(".navbar_home");
      const navItems = q(".navbar_links_li");
      const navCta = q(".navbar_cta_wrap > *");

      // Initial states — everything sits below its mask until `start`. Set from
      // JS (not markup) so a script failure leaves the page readable.
      // The crafts start at 140, not 110: their masks clip past the line box
      // (see .hero_mask), so a hidden line has to clear that taller window.
      gsap.set(".hero_line", { yPercent: 140 });
      gsap.set(displayLines, { yPercent: 110 });
      gsap.set(".hero_lede", { autoAlpha: 0, y: 16 });
      // Phones only (hidden from md, where these tweens are harmless): the
      // portrait wipes up from the bottom and settles from a slight zoom.
      gsap.set(".hero_photo", { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(".hero_photo_img", { scale: 1.2 });
      gsap.set(navWrap, { autoAlpha: 0 });

      if (!start) return;

      const tl = gsap.timeline({ defaults: { ease: "ease-transition" } });

      tl.to(".hero_photo", { clipPath: "inset(0% 0% 0% 0%)", duration: DUR.slow })
        .to(".hero_photo_img", { scale: 1, duration: DUR.slow * 1.6 }, "<")
        .to(".hero_line", { yPercent: 0, duration: DUR.slow, stagger: 0.065 }, "<0.15")
        .to(displayLines, { yPercent: 0, duration: DUR.slow, stagger: 0.065 }, "-=0.85")
        .to(".hero_lede", { autoAlpha: 1, y: 0, duration: DUR.slow }, "<");

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
    // Inverted, like About below it, so the two read as one band; full
    // bleed, with the shell inside so the ground runs edge to edge.
    <section
      ref={root}
      id="top"
      data-theme-section="invert"
      className="hero hero_home relative isolate -mb-px flex min-h-svh flex-col overflow-hidden"
    >
      {/* Phones only: the portrait, full-bleed behind the type. */}
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
          over the name, so the name reads as set behind him wherever the two
          meet. It carries the same scrim, masked to his outline, so the layer
          is invisible except where it covers the type; it shares .hero_photo /
          .hero_photo_img with the portrait to wipe and settle in step with
          it. The crafts (z-2 below) stay in front. */}
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
          section (light ink on every stop); hidden from md, where the bar
          sits on the band. */}
      <div
        aria-hidden
        data-theme-section="photo"
        className="pointer-events-none absolute inset-0 md:hidden"
      />

      {/* Columns follow the navbar's: the crafts and "Ramesh" under the links
          (from column 5, where About's copy starts too); "Amar" under the
          wordmark (columns 1–4), which the captions hung left of the crafts
          otherwise have to themselves. On phones: the name heads the photo,
          the crafts and the offer sit at its foot. */}
      <div className="shell flex flex-1 flex-col pt-24 pb-5 max-md:text-white md:pt-32 md:pb-8">
        {/* Phones only: the name, stacked, behind the cut-out figure. */}
        <h1 className="hero_title hero_sig md:hidden">
          <Line lead="A">Amar</Line>
          <Line>Ramesh</Line>
        </h1>

        <div className="relative z-2 mt-auto shrink-0 md:my-auto">
          <h2 data-crafts className="hero_title md:grid-12">
            <span className="block md:col-span-8 md:col-start-5">
              <Craft
                href="/photography"
                note={
                  <>
                    Weddings, temples
                    <br />
                    people, places
                  </>
                }
              >
                Photographer,
              </Craft>
              <Craft
                href="/documentary"
                side="right"
                note={
                  <>
                    Documentaries
                    <br />
                    short films
                  </>
                }
              >
                Filmmaker,
              </Craft>
              <Craft href="/books" lead="A">
                Author,
              </Craft>
              <Craft
                href="/#ventures"
                note={
                  <>
                    Studio A, Mara Labs
                    <br />
                    Big Short Films
                  </>
                }
              >
                Entrepreneur,
              </Craft>
              <Craft
                href="/#ventures"
                side="right"
                note={
                  <>
                    Camera was only
                    <br />
                    the beginning
                  </>
                }
              >
                Mentor
              </Craft>
            </span>
          </h2>

          {/* Phones only: what the crafts add up to, in a sentence. The
              right padding clears the floating controls. */}
          <p className="hero_lede mt-4 pr-16 md:hidden">
            I take on photography, films, books and cultural projects for families, brands and
            institutions.
          </p>
        </div>

        {/* From md: the name, split across the grid. On phones it heads the
            photo instead (above). */}
        <div className="grid-12 shrink-0 pt-16 max-md:hidden md:pt-24">
          <h1 className="contents">
            <span className="hero_display display optical-A col-span-12 md:col-span-4">Amar</span>
            <span className="hero_display display optical-R col-span-12 md:col-start-5 md:col-span-8">
              Ramesh
            </span>
          </h1>
        </div>
      </div>
    </section>
  );
}
