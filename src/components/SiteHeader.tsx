"use client";

import { useEffect, useState } from "react";
import { CtaPill } from "@/components/CtaPill";

const NAV = [
  { label: "Works", href: "#works" },
  { label: "Books", href: "#ventures" },
  { label: "Initiatives", href: "#ventures" },
  { label: "About", href: "#about" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  // Lock the page behind the mobile sheet.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
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
  }, [open]);

  return (
    <header
      className="navbar_wrap fixed inset-x-0 top-0 z-[999] w-full"
      style={{ paddingBlock: "var(--site-margin)" }}
    >
      <div className="navbar_contain shell grid-12 items-center bg-transparent">
        {/* Wordmark: columns 1-5. */}
        <div
          className="navbar_left_contain col-span-6 flex items-center justify-start md:col-span-5"
          style={{ columnGap: "var(--nav-space-6)" }}
        >
          {/* The clip each reveal slides out of. */}
          <span className="inline-flex overflow-hidden">
            <a
              href="#top"
              aria-label="Return to home"
              className="navbar_home relative flex items-center justify-center text-[15px] font-semibold uppercase tracking-[-0.01em]"
            >
              Amar Ramesh
            </a>
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
            <CtaPill label="Get in Touch" />
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="navbar_menu_btn relative flex items-center justify-center overflow-hidden text-[15px] font-medium tracking-[-0.03em] md:hidden"
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
        <div className="fixed inset-0 z-40 bg-background pt-[calc(var(--site-margin)*2+2rem)] md:hidden">
          <nav
            className="flex flex-col"
            style={{ paddingInline: "var(--site-margin)" }}
          >
            {NAV.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="display text-[13vw] leading-[1.05]"
              >
                {item.label}
              </a>
            ))}

            <CtaPill label="Get in Touch" className="mt-8 self-start" onClick={() => setOpen(false)} />
          </nav>
        </div>
      )}
    </header>
  );
}
