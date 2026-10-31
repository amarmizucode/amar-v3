"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { usePageReady } from "@/components/PageTransition";
import { ContactCta } from "@/components/ContactModal";
import { SoundToggle } from "@/components/SoundToggle";
import { SOUND_AVAILABLE } from "@/lib/sound";
import { RightArrow } from "@/components/Arrows";
import { galleryBySlug } from "@/lib/photography";

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
  { label: "Books", href: "/books" },
  { label: "Ventures", href: "/#ventures" },
];

/*
 * The sheet lists NAV plus Contact, as the reference's menu does — its rows
 * are its nav pages with Contact closing the list, no Home entry: the
 * wordmark above the panel is Home, and the bar's CTA still reaches the
 * contact section directly.
 */
const MOBILE_NAV = [...NAV, { label: "Contact", href: "/#contact" }];

/* Relative luminance of an `rgb(...)` or `#rgb` / `#rrggbb` colour (theme
   tokens resolve to hex, computed colours to rgb); null if unparseable. */
function luminance(color: string): number | null {
  let channels: number[];
  const hex = color.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const h = hex[1].length === 3 ? hex[1].replace(/./g, "$&$&") : hex[1];
    channels = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  } else {
    const m = color.match(/[\d.]+/g);
    if (!m || m.length < 3) return null;
    channels = m.slice(0, 3).map(Number);
  }
  const [r, g, b] = channels.map((v) => {
    const c = v / 255;
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
  const menuRef = useRef<HTMLDivElement>(null);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const isHome = pathname === "/";
  // On a gallery the wordmark continues as a breadcrumb: Photography / <name>.
  const crumbGallery = galleryBySlug(pathname.match(/^\/photography\/([^/]+)/)?.[1] ?? "");

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

  // Escape closes the sheet, as does growing past the breakpoint that hides
  // it (a rotation or resize), which would otherwise leave the page locked.
  // Closing hands focus back to the toggle if it was inside the sheet, which
  // goes inert and would drop it on <body>.
  useEffect(() => {
    if (!open) return;
    const menu = menuRef.current;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const desktop = window.matchMedia("(min-width: 48rem)");
    const onDesktop = () => desktop.matches && setOpen(false);
    window.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onDesktop);
    return () => {
      window.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onDesktop);
      if (menu?.contains(document.activeElement)) menuBtn.current?.focus();
    };
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
    // The home hero owns the bar's entrance there: it hides the bar on mount
    // and raises the wordmark, links and CTA inside its own timeline, so the
    // header comes in step with the hero. Running this intro as well put two
    // tweens on the same elements — on a reload the bar showed empty for
    // ~0.7s, then filled in after the hero had settled.
    if (isHome) {
      played.current = true;
      return;
    }
    // Later pages: just make sure the bar is up. The home hero hides it for
    // its own entrance and, reverting on unmount, leaves it at the CSS
    // hidden state when the visitor navigates away.
    if (played.current) {
      gsap.set(bar, { autoAlpha: 1 });
      return;
    }
    played.current = true;
    const stagger = 0.0625;
    intro.current = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "ease-transition" } });
      tl.from(".navbar_home", { yPercent: 100, duration: 0.95, rotate: 0.001 }, 0.25)
        .to(bar, { autoAlpha: 1, duration: 0 }, "<")
        .from(".navbar_links_li", { yPercent: 100, duration: 0.95, rotate: 0.001, stagger }, "<")
        .from(
          // The reference tweens `.navbar_cta_wrap > *`; the three are named
          // so the conditional sound toggle can drop out of the list.
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
   * whose box contains the bar's mid-line sets `data-theme-nav` on the
   * header, and the colours switch with it. Both pairs are tones of the theme
   * ramp, so the bar follows the slider whichever it is on:
   *   - `page` (and no section at all): the page's own ink;
   *   - `invert`: an inverted band, so the band's ink (the page's ground);
   *   - `photo`: a photograph, which wants light ink whatever the stop — the
   *     pair whose ink is light, read off the page ground's luminance.
   */
  useEffect(() => {
    const bar = root.current;
    if (!bar) return;
    let frame = 0;

    const resolve = () => {
      frame = 0;
      const y = bar.offsetHeight / 2;
      let theme = "page";
      document.querySelectorAll<HTMLElement>("[data-theme-section]").forEach((section) => {
        const r = section.getBoundingClientRect();
        if (r.top <= y && r.bottom >= y) theme = section.dataset.themeSection ?? theme;
      });
      if (theme === "photo") {
        // The stop's own ground token, not body's computed background: that
        // fades for 0.3s on a theme change (`body[data-theme]` in globals.css),
        // so read the moment the stop switches it still gave the old colour.
        const body = getComputedStyle(document.body);
        const ground =
          body.getPropertyValue("--color--background--100").trim() || body.backgroundColor;
        const l = luminance(ground);
        // A dark page has light ink; on a light one the inverted pair does.
        theme = l !== null && l < 0.5 ? "page" : "invert";
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
    let faded = false;
    const trigger = ScrollTrigger.create({
      trigger: footer,
      start: "top bottom",
      onEnter: () => {
        faded = true;
        gsap.to(bar, { opacity: 0, duration: 0.4, ease: "power2.out" });
        if (row) row.style.pointerEvents = "none";
      },
      onLeaveBack: () => {
        faded = false;
        gsap.to(bar, { opacity: 1, duration: 0.4, ease: "power2.out" });
        if (row) row.style.pointerEvents = "";
      },
    });
    return () => {
      trigger.kill();
      // kill() fires no callbacks, so a footer link clicked while the bar is
      // faded would carry the fade — and the dead clicks — onto a page that
      // has no footer to bring it back. Undo it here, and only if it ran:
      // the home intro holds the bar at 0 itself.
      if (!faded) return;
      gsap.killTweensOf(bar, "opacity");
      gsap.set(bar, { opacity: 1 });
      if (row) row.style.pointerEvents = "";
    };
  }, [pathname, ready]);

  return (
    <header
      ref={root}
      data-theme-nav="page"
      data-navigation-status={open ? "is-open" : "is-closed"}
      className="navbar_wrap"
    >
      <div className="navbar_contain grid-site">
        <div className="navbar_left_contain">
          <Link href="/" aria-label="Return to home" className="navbar_home">
            Amar Ramesh
          </Link>

          {/* The wordmark is the trail's first step; the separators are drawn
              by `.navbar_crumbs_li::before`. Keyed by gallery so the rise
              replays when one gallery leads to another. */}
          {crumbGallery && (
            <nav key={crumbGallery.slug} aria-label="Breadcrumb" className="navbar_crumbs">
              <ol className="navbar_crumbs_ol">
                <li className="navbar_crumbs_li">
                  <Link href="/photography" className="navbar_crumbs_link">
                    Photography
                  </Link>
                </li>
                <li className="navbar_crumbs_li">
                  <span aria-current="page" className="navbar_crumbs_current">
                    {crumbGallery.title}
                  </span>
                </li>
              </ol>
            </nav>
          )}
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
          {SOUND_AVAILABLE && <SoundToggle />}

          <div className="navbar_cta_contain">
            <ContactCta label="Get in Touch" />
          </div>

          {/* The label animates Menu -> Close, so it is both the opener and
              the closer. Shown below 48rem by the `.navbar_menu_btn` rules. */}
          <button
            type="button"
            ref={menuBtn}
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
       * The sheet and the bar are siblings inside the same fixed header; the
       * bar (z-20) stays above the sheet (z-10), so the wordmark, the CTA and
       * the Menu/Close toggle stay visible and clickable over the panel — the
       * reference's layering, where the open menu recolours the bar rather
       * than hiding it (see the is-open rules in globals.css).
       *
       * Always mounted so it can animate out as well as in; `inert` keeps the
       * closed sheet out of the tab order and the accessibility tree. The
       * motion lives in the `.mobile-menu*` rules in globals.css.
       */}
      <div
        ref={menuRef}
        id="mobile-menu"
        data-open={open || undefined}
        inert={!open}
        className="mobile-menu fixed inset-0 z-10 md:hidden"
      >
        {/* The reference's `menu_overlay_close`: the page behind the panel,
            dimmed and blurred, and one tap from closing the sheet. */}
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="mobile-menu_scrim"
        />

        {/* The reference's `menu_contain`: a black panel 55dvh deep under
            the bar, its rows bottom-aligned and set like the footer's list. */}
        <div className="mobile-menu_panel">
          <nav aria-label="Menu">
            <ul className="mobile-menu_ul">
              {MOBILE_NAV.map((item, i) => {
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
                      <span aria-hidden className="mobile-menu_arrow">
                        <RightArrow className="inline-arrow" />
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
