"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { usePageReady } from "@/components/PageTransition";
import { CtaPill } from "@/components/CtaPill";
import { SoundToggle } from "@/components/SoundToggle";
import { PrintRequestTrigger } from "@/components/PrintRequestDock";
import { CornerArrow } from "@/components/Arrows";
import { SOCIALS } from "@/components/SiteFooter";
import { AI_SERVICES, AiIcon, aiHref } from "@/components/AiIcons";

/*
 * Root-relative rather than bare hashes: the header renders on the
 * /photography routes too, where a plain `#ventures` would resolve against the
 * current page and go nowhere. SmoothScroll matches `/#` hrefs while on the
 * home page, so these scroll smoothly there and navigate from anywhere else.
 */
const NAV = [
  // About is removed for now — restore by adding
  // { label: "About", href: "/about" } back here, with the route.
  // Work With Me is removed too — restore with
  // { label: "Work With Me", href: "/#work-with-me" }; the section itself
  // still exists, and the footer's Contact entry still reaches the page.
  { label: "Photography", href: "/photography" },
  { label: "Films", href: "/documentary" },
  { label: "Publications", href: "/books" },
  { label: "Ventures", href: "/#ventures" },
];

/*
 * The sheet lists what the footer lists — Home first, Contact last — so a
 * phone has everything the footer offers without scrolling down to it. The
 * bar keeps NAV: there the wordmark is Home and the CTA is Contact.
 */
const MOBILE_NAV = [{ label: "Home", href: "/" }, ...NAV, { label: "Contact", href: "/#contact" }];

/* Relative luminance of a computed `rgb(...)` colour; null if unparseable. */
function luminance(color: string): number | null {
  const m = color.match(/[\d.]+/g);
  if (!m || m.length < 3) return null;
  const [r, g, b] = m.slice(0, 3).map((v) => {
    const c = Number(v) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/*
 * The bar: bymonolog.com's navbar, markup for markup. Its grid, type scale,
 * colours, link fill, sound toggle, CTA surfaces, intro and footer fade live
 * in the `.navbar_*` rules in globals.css and the effects below.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const ready = usePageReady();
  const root = useRef<HTMLElement>(null);
  const isHome = pathname === "/";

  /*
   * A link that leaves the page would otherwise leave the sheet open behind
   * the route transition. Rather than closing it from an effect — which
   * paints the sheet open on the new route for one commit before tearing it
   * down — the open state stores the pathname it was opened at, and `open` is
   * derived from it. Any navigation makes that stale, so the sheet renders
   * closed on the new route with no second render.
   */
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const open = openedAt === pathname;
  const setOpen = useCallback(
    (next: boolean | ((current: boolean) => boolean)) => {
      setOpenedAt((current) => {
        const wasOpen = current === pathname;
        const wantOpen = typeof next === "function" ? next(wasOpen) : next;
        return wantOpen ? pathname : null;
      });
    },
    [pathname],
  );

  /*
   * Lock the page behind the sheet. The gallery routes already pin
   * `documentElement` to `overflow: hidden`, so this touches `body` only and
   * restores the previous value rather than clearing it outright.
   */
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Escape closes the sheet.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  /*
   * Intro, the reference's timeline: the bar flips visible at 0.3s as the
   * wordmark rises out of the row's clip from a full height below, and the
   * links, then the CTA cluster, follow at a 0.0525s stagger (0.0625s off the
   * home page), each a 0.95s ease-transition. The bar persists across routes
   * here, so it plays once, on the first page the visitor sees — the
   * reference re-runs it per page only because its header is inside the
   * swapped container.
   */
  const played = useRef(false);
  const intro = useRef<gsap.Context | null>(null);
  useEffect(() => {
    const bar = root.current;
    if (!ready || !bar) return;
    // Later pages: just make sure the bar is up. The home hero hides it for
    // its own entrance and, reverting on unmount, leaves it at the CSS
    // hidden state when the visitor navigates away.
    if (played.current) {
      gsap.set(bar, { autoAlpha: 1 });
      return;
    }
    played.current = true;
    const stagger = isHome ? 0.0525 : 0.0625;
    intro.current = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "ease-transition" } });
      tl.from(".navbar_home", { yPercent: 100, duration: 0.95, rotate: 0.001 }, isHome ? 0.3 : 0.25)
        .to(bar, { autoAlpha: 1, duration: 0 }, "<")
        .from(".navbar_links_li", { yPercent: 100, duration: 0.95, rotate: 0.001, stagger }, "<")
        .from(
          // The reference tweens `.navbar_cta_wrap > *`; the print-request
          // trigger also lives in that cell and runs its own reveal, so the
          // three that do rise are named instead.
          [".navbar_left_sound_wrap", ".navbar_cta_contain", ".navbar_menu_btn"],
          { yPercent: 100, rotate: 0.001, duration: 0.95, stagger },
          "<",
        );
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) tl.progress(1);
    }, root);
  }, [ready, isHome]);
  // Reverted on unmount only: `ready` drops on every navigation, and undoing
  // the intro then would hide the bar for good, since it plays once.
  useEffect(() => () => intro.current?.revert(), []);

  /*
   * Nav theme, the reference's section watcher: on every scroll, the section
   * whose box contains the bar's mid-line (`data-theme-section="light|dark"`)
   * sets `data-theme-nav` on the header, and the colours switch with it.
   *
   * Where no section claims the point — this site's pages mostly carry none
   * — the theme falls back to the page background's luminance, so the bar
   * also follows the ramp as the slider moves it (body's `data-theme`).
   */
  useEffect(() => {
    const bar = root.current;
    if (!bar) return;
    let frame = 0;

    const resolve = () => {
      frame = 0;
      const y = bar.offsetHeight / 2;
      let theme: string | null = null;
      document.querySelectorAll<HTMLElement>("[data-theme-section]").forEach((section) => {
        const r = section.getBoundingClientRect();
        if (r.top <= y && r.bottom >= y) theme = section.dataset.themeSection ?? null;
      });
      if (!theme) {
        const l = luminance(getComputedStyle(document.body).backgroundColor);
        theme = l !== null && l < 0.5 ? "dark" : "light";
      }
      // Header and body both, as the reference sets every `[data-theme-nav]`:
      // the body's copy is what themes the pills across the page.
      if (bar.dataset.themeNav !== theme) bar.dataset.themeNav = theme;
      if (document.body.dataset.themeNav !== theme) document.body.dataset.themeNav = theme;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(resolve);
    };

    resolve();
    document.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      document.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pathname]);

  /*
   * Footer fade, the reference's: once the footer's top enters the viewport
   * the bar fades out (0.4s power2.out) and stops taking clicks, and comes
   * back the moment the footer leaves again. Re-armed per route, since the
   * footer is part of the page that swaps.
   */
  useEffect(() => {
    const bar = root.current;
    const footer = document.querySelector(".footer_wrap_main");
    if (!bar || !footer) return;
    const row = bar.querySelector<HTMLElement>(".navbar_contain");
    const trigger = ScrollTrigger.create({
      trigger: footer,
      start: "top bottom",
      onEnter: () => {
        gsap.to(bar, { opacity: 0, duration: 0.4, ease: "power2.out" });
        if (row) row.style.pointerEvents = "none";
      },
      onLeaveBack: () => {
        gsap.to(bar, { opacity: 1, duration: 0.4, ease: "power2.out" });
        if (row) row.style.pointerEvents = "";
      },
    });
    return () => trigger.kill();
  }, [pathname, ready]);

  return (
    <header
      ref={root}
      data-theme-nav="light"
      data-navigation-status={open ? "is-open" : "is-closed"}
      className="navbar_wrap"
    >
      <div className="navbar_contain grid-site">
        <div className="navbar_left_contain">
          <Link href="/" aria-label="Return to home" className="navbar_home">
            Amar Ramesh
          </Link>
        </div>

        <nav className="navbar_links text-style-small text-trim-off" aria-label="Primary">
          <ul className="navbar_links_ul">
            {NAV.map((item) => (
              <li key={item.label} className="navbar_links_li">
                <a href={item.href} data-link-hover className="navbar_link">
                  <div className="navbar_link_text text-style-main">{item.label}</div>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="navbar_cta_wrap text-style-small text-trim-off">
          {/* The print-request trigger: zero-width until a print is saved. */}
          <PrintRequestTrigger />

          <SoundToggle />

          <div className="navbar_cta_contain">
            <CtaPill label="Get in Touch" href="/#contact" />
          </div>

          {/* The label animates Menu -> Close, so it is both the opener and
              the closer. Shown below 48rem by the `.navbar_menu_btn` rules. */}
          <button
            type="button"
            data-menu-btn
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="navbar_menu_btn"
          >
            <span className="navbar_menu_span-wrap">
              <span className="navbar_menu_span">Menu</span>
              <span className="navbar_menu_span is-close" aria-hidden>
                Close
              </span>
            </span>
          </button>
        </div>
      </div>

      {/*
       * The sheet and the bar are siblings inside the same fixed header, and
       * the header paints no background of its own — so the sheet must cover
       * the page (z-10) while the bar sits above it (z-20), keeping the
       * wordmark and the toggle that closes it clickable.
       *
       * Always mounted so it can animate out as well as in; `inert` keeps the
       * closed sheet out of the tab order and the accessibility tree. The
       * motion lives in the `.mobile-menu*` rules in globals.css.
       */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        data-open={open || undefined}
        inert={!open}
        className="mobile-menu pointer-events-auto fixed inset-0 z-10 bg-background md:hidden"
      >
        <div className="mobile-menu_inner shell">
          <nav aria-label="Primary">
            <ul className="mobile-menu_ul">
              {MOBILE_NAV.map((item, i) => {
                // Home matches itself alone: no other path starts with "//".
                const current = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <li
                    key={item.label}
                    className="mobile-menu_li"
                    style={{ "--i": i } as CSSProperties}
                  >
                    <a
                      href={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={current ? "page" : undefined}
                      className="mobile-menu_link"
                    >
                      <span className="mobile-menu_clip">
                        <span className="mobile-menu_label">{item.label}</span>
                      </span>
                      <span className="mobile-menu_index">
                        {current && (
                          <span aria-hidden className="size-1.5 rounded-full bg-foreground" />
                        )}
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mobile-menu_foot mobile-menu_fade">
            <CtaPill label="Get in Touch" href="/#contact" onClick={() => setOpen(false)} />

            {/* The footer's three blocks, in its order and wording. */}
            <div className="mobile-menu_details">
              <div>
                <p className="text-muted">(Personal details)</p>
                <a href="mailto:hello@amarramesh.com" className="link-wipe">
                  hello@amarramesh.com
                </a>
              </div>
              <div>
                <p className="text-muted">(Socials)</p>
                <ul>
                  {SOCIALS.map((social) => (
                    <li key={social.label}>
                      <a
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-[0.3em]"
                      >
                        {social.label}
                        <CornerArrow className="w-[0.75em]" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-muted">(Ask AI About Me)</p>
                {/* The footer's chips: 2.5em squares on their own font size. */}
                <div className="footer_middle_wrap is-ai text-[16px]">
                  {AI_SERVICES.map((service) => (
                    <a
                      key={service.name}
                      href={aiHref(service.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`Ask ${service.label} about Amar Ramesh`}
                      className="footer_ai_link"
                    >
                      <span className="sr-only">Ask {service.label} about Amar Ramesh</span>
                      <AiIcon name={service.name} instance="menu" className="h-full w-full" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <p className="mobile-menu_base text-muted">
              <span>© 2026, Amar Ramesh</span>
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
