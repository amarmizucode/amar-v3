"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CtaPill } from "@/components/CtaPill";

/*
 * Root-relative rather than bare hashes: the header renders on the
 * /photography routes too, where a plain `#works` would resolve against the
 * current page and go nowhere. SmoothScroll only intercepts `href^="#"`, so
 * these fall through to normal navigation off the home page and still scroll
 * smoothly once on it.
 */
const NAV = [
  { label: "Works", href: "/#works" },
  { label: "Photography", href: "/photography" },
  { label: "Books", href: "/#ventures" },
  { label: "About", href: "/#about" },
];

export function SiteHeader() {
  const pathname = usePathname();

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
      className="navbar_wrap fixed inset-x-0 top-0 z-[999] w-full"
      style={{ paddingBlock: "var(--site-margin)" }}
    >
      <div className="navbar_contain shell relative z-20 grid-12 items-center bg-transparent">
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
          <div className="navbar_cta_contain hidden overflow-hidden md:block">
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

      {open && (
        /*
         * The sheet and the bar are siblings inside the same fixed header, and
         * the header paints no background of its own — so the sheet must cover
         * the page (z-10) while the bar sits above it (z-20), keeping the
         * wordmark and the toggle that closes it clickable.
         */
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-10 flex flex-col bg-background pt-[calc(var(--site-margin)*2+2rem)] md:hidden"
        >
          <nav
            className="flex flex-col overflow-y-auto"
            style={{ paddingInline: "var(--site-margin)" }}
          >
            {NAV.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="display py-1 text-[13vw] leading-[1.05]"
              >
                {item.label}
              </a>
            ))}

            <CtaPill
              label="Get in Touch"
              href="/#contact"
              className="mt-8 self-start"
              onClick={() => setOpen(false)}
            />
          </nav>
        </div>
      )}

    </header>
  );
}
