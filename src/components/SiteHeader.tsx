"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CtaPill } from "@/components/CtaPill";
import { PrintRequestTrigger } from "@/components/PrintRequestDock";
import { CornerArrow } from "@/components/Arrows";
import { SOCIALS } from "@/components/SiteFooter";
import { AI_SERVICES, AiIcon, aiHref } from "@/components/AiIcons";

/*
 * Root-relative rather than bare hashes: the header renders on the
 * /photography routes too, where a plain `#ventures` would resolve against the
 * current page and go nowhere. SmoothScroll only intercepts `href^="#"`, so
 * these fall through to normal navigation off the home page and still scroll
 * smoothly once on it.
 */
const NAV = [
  { label: "About", href: "/about" },
  { label: "Photography", href: "/photography" },
  { label: "Documentary", href: "/documentary" },
  { label: "Books", href: "/books" },
];

/*
 * The sheet lists what the footer lists — Home first, Contact last — so a
 * phone has everything the footer offers without scrolling down to it. The
 * bar keeps NAV: there the wordmark is Home and the CTA is Contact.
 */
const MOBILE_NAV = [{ label: "Home", href: "/" }, ...NAV, { label: "Contact", href: "/#contact" }];

export function SiteHeader() {
  const pathname = usePathname();
  const root = useRef<HTMLElement>(null);

  /*
   * Sticky, on every page: the bar is fixed and stays put while the page
   * scrolls under it. (It used to ride the first stretch of scroll up and
   * out like an in-flow header; that ride was removed when the header went
   * sticky, so the GSAP scrub and the inner-scroll listener went with it.)
   */
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

  return (
    <header
      ref={root}
      /*
       * pointer-events-none: once the bar has ridden away, this fixed strip
       * must not swallow clicks on the content scrolled under it. The bar and
       * the sheet switch theirs back on. The root itself is never
       * transformed, so the sheet's `position: fixed` keeps the viewport as
       * its containing block.
       */
      /* Block padding lives in .navbar_wrap's CSS, beside its ground. */
      className="navbar_wrap pointer-events-none fixed inset-x-0 top-0 z-[999] w-full"
    >
      <div className="navbar_contain pointer-events-auto shell relative z-20 grid-12 items-center bg-transparent">
        {/* Wordmark: columns 1-5. */}
        <div
          className="navbar_left_contain col-span-6 flex items-center justify-start md:col-span-5"
          style={{ columnGap: "var(--nav-space-6)" }}
        >
          {/* The clip each reveal slides out of. */}
          <span className="inline-flex overflow-hidden">
            <Link
              href="/"
              aria-label="Return to home"
              className="navbar_home relative flex items-center justify-center text-[15px] font-semibold uppercase tracking-[-0.01em]"
            >
              Amar Ramesh
            </Link>
          </span>
        </div>

        {/* Primary nav: one group from column 6, matching the copy below. */}
        <nav className="navbar_links pointer-events-auto hidden md:col-start-6 md:col-span-5 md:block">
          <ul
            className="navbar_links_ul flex items-center"
            style={{
              columnGap: "2px",
              // Negate the links’ own inline padding so the first glyph edge
              // lands exactly on the column-6 line.
              marginInline: "calc(var(--nav-space-1) * -1)",
            }}
          >
            {NAV.map((item) => (
              <li key={item.label} className="navbar_links_li relative flex overflow-hidden">
                <a
                  href={item.href}
                  className="navbar_link nav-link flex w-fit items-center justify-start text-[15px] font-medium tracking-[-0.03em]"
                  style={{ padding: "0.5rem var(--nav-space-1)" }}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* CTA at columns 11-12, plus the mobile menu toggle. */}
        <div
          className="navbar_cta_wrap col-span-6 flex items-center justify-end md:col-start-11 md:col-span-2"
          style={{ columnGap: "var(--nav-space-2)" }}
        >
          {/* The print-request trigger, before the CTA; zero-width until
              a print is saved. Both it and the CTA refuse to shrink: the
              cell is two columns, so with the trigger open the pair grows
              left into the empty grid instead of squeezing the CTA. */}
          <PrintRequestTrigger />

          <div className="navbar_cta_contain hidden shrink-0 overflow-hidden md:block">
            <CtaPill label="Get in Touch" href="/#contact" />
          </div>

          {/* The label animates Menu -> Close, so it is both the opener and
              the closer. `-mr` pulls the enlarged tap area back to the grid
              line so the text still aligns with the edge. */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="navbar_menu_btn relative -mr-[var(--nav-space-1)] flex min-h-[44px] items-center justify-center overflow-hidden text-[15px] font-medium tracking-[-0.03em] md:hidden"
            style={{ padding: "0.25rem var(--nav-space-1)" }}
          >
            <span className="menu-toggle-track">
              <span>Menu</span>
              <span className="is-close" aria-hidden>
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
            <CtaPill
              label="Get in Touch"
              href="/#contact"
              size="text-[17px]"
              onClick={() => setOpen(false)}
            />

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
