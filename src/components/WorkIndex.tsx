"use client";

import { useRef, useState, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { Eyebrow } from "@/components/Eyebrow";
import { usePageReady } from "@/components/PageTransition";
import { gsap, SplitText, DUR } from "@/lib/gsap";

export type WorkFilter = { key: string; label: string };

export type WorkItem = {
  key: string;
  /** Title, summary and tags print under the cover; an image-only card
   *  leaves them out and names itself with `label`. */
  title?: string;
  summary?: string;
  tags?: string[];
  label?: string;
  cover: string;
  /** The cover's own ratio, for `natural` covers. */
  ratio?: string;
  /** The pair raised over the cover on hover: a fact left, the call right. */
  hover?: [string, string];
  /** A control laid over the cover's corner, beside the card's own link —
   *  a sibling, since a button cannot sit inside the card's button. */
  action?: ReactNode;
  /** The filter keys this item answers to, besides "all". */
  facets: string[];
  /** A link to follow, or — without one — `onOpen` to call. */
  href?: string;
  onOpen?: () => void;
};

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * A work index — bymonolog.com/work's structure in this site's language,
 * shared by the films and photos pages.
 *
 * From the reference: the counted heading over a rule, the sticky "filter
 * by" column of stacked chips, the grid of cover cards (two columns, three
 * from 90rem) each with title, summary and tag chips, and the hover that
 * settles the zoomed cover and raises a fact / call-to-action pair over it.
 * Its intro and filter-swap timings are lifted from its work script.
 *
 * From this site: the theme palette, and covers in the work's own shape —
 * `landscape` 16:9 for film thumbnails, `portrait` the reference's 4:5, or
 * `natural`: each image at its own ratio, in masonry columns, uncropped.
 */
export function WorkIndex({
  heading,
  filterLabel,
  filters,
  items,
  cover,
  children,
}: {
  heading: string;
  filterLabel: string;
  /** Leads with the "all" filter. */
  filters: WorkFilter[];
  items: WorkItem[];
  cover: "landscape" | "portrait" | "natural";
  /** Anything the cards open — a player, a viewer. */
  children?: ReactNode;
}) {
  const root = useRef<HTMLElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const start = usePageReady();

  const [filter, setFilter] = useState("all");
  const shown = filter === "all" ? items : items.filter((it) => it.facets.includes(filter));

  /* ── Intro — the reference's work timeline: heading lines climb out of
        their masks, the filter chips and cards rise and fade on its
        staggers. Only the cards in the first viewport play; the rest are
        simply there when scrolled to. Hidden states are set from JS so a
        script failure leaves the page readable. */
  useGSAP(
    () => {
      const heading = root.current?.querySelector(".wi-heading");
      const chips = root.current?.querySelectorAll(".wi-filter");
      const cards = gsap.utils
        .toArray<HTMLElement>(".wi-card", root.current)
        .filter((el) => el.getBoundingClientRect().top < window.innerHeight);
      if (!heading || !chips) return;
      if (reduced()) return;

      const split = new SplitText(heading, { type: "lines", linesClass: "split-line", mask: "lines" });
      gsap.set(split.lines, { yPercent: 110 });
      gsap.set(chips, { autoAlpha: 0, y: 12 });
      gsap.set(cards, { autoAlpha: 0, yPercent: 15 });

      if (!start) return;

      gsap
        .timeline({ defaults: { ease: "ease-transition" } })
        .to(split.lines, { yPercent: 0, duration: DUR.slow, stagger: 0.05 }, 0)
        .to(chips, { y: 0, duration: DUR.slow, stagger: 0.04 }, "<0.1")
        .to(chips, { autoAlpha: 1, duration: DUR.fast, stagger: 0.04 }, "<")
        .to(cards, { yPercent: 0, duration: DUR.slow, stagger: 0.05, clearProps: "transform" }, "<")
        .to(cards, { autoAlpha: 1, duration: DUR.fast, stagger: 0.05, clearProps: "opacity,visibility" }, "<");
    },
    // Revert on update: the pre-ready pass's split and hidden states are
    // undone before the ready pass splits again and plays.
    { scope: root, dependencies: [start], revertOnUpdate: true },
  );

  /* ── Filtering — the reference fades the list out (0.25s), swaps it,
        and fades the new set in (0.3s) on the same ease. */
  const choose = (key: string) => {
    if (key === filter) return;
    const el = grid.current;
    if (!el || reduced()) {
      setFilter(key);
      return;
    }
    gsap.to(el, {
      autoAlpha: 0,
      duration: 0.25,
      ease: "ease-transition",
      overwrite: true,
      onComplete: () => {
        setFilter(key);
        gsap.to(el, { autoAlpha: 1, duration: DUR.fast, ease: "ease-transition" });
      },
    });
  };

  const count = String(shown.length).padStart(2, "0");

  return (
    // `works` carries the eyebrow marker and muted tokens, theme by theme.
    <main id="main" ref={root} data-cover={cover} className="works wi-wrap">
      <header className="wi-header">
        <h1 className="wi-heading">{heading}</h1>
        <p className="wi-count" aria-live="polite">
          (<span className="sr-only">{shown.length} shown</span>
          <span aria-hidden>{count}</span>)
        </p>
      </header>

      <div className="wi-content">
        <div className="wi-left">
          <Eyebrow>{filterLabel}</Eyebrow>
          <ul className="wi-filters">
            {filters.map((f) => (
              <li key={f.key}>
                <button
                  type="button"
                  aria-pressed={filter === f.key}
                  aria-controls="wi-grid"
                  onClick={() => choose(f.key)}
                  className="wi-filter"
                >
                  {f.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div ref={grid} id="wi-grid" role="list" className="wi-grid">
          {shown.map((item) => {
            const body = (
              <>
                <span
                  className="wi-cover"
                  style={item.ratio ? { aspectRatio: item.ratio } : undefined}
                >
                  {item.hover && (
                    <span className="wi-hover" aria-hidden>
                      <span className="wi-block">{item.hover[0]}</span>
                      <span className="wi-block">{item.hover[1]}</span>
                    </span>
                  )}
                  <img
                    src={item.cover}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    /* A film with no maxres thumbnail gets YouTube's 120px
                       placeholder; step down to hqdefault (see FilmCarousel).
                       Other covers never match. */
                    onLoad={(e) => {
                      const img = e.currentTarget;
                      if (img.naturalWidth <= 120 && img.src.includes("maxresdefault")) {
                        img.src = img.src.replace("maxresdefault", "hqdefault");
                      }
                    }}
                    className="wi-image"
                  />
                  <span className="wi-overlay" aria-hidden />
                </span>
                {item.title && (
                  <span className="wi-text">
                    <span className="wi-name">{item.title}</span>
                    {item.summary && <span className="wi-summary">{item.summary}</span>}
                    {item.tags && (
                      <span className="wi-tags">
                        {item.tags.map((tag) => (
                          <span key={tag} className="wi-tag">
                            {tag}
                          </span>
                        ))}
                      </span>
                    )}
                  </span>
                )}
              </>
            );
            return (
              <div key={item.key} role="listitem" className="wi-card">
                {item.href ? (
                  <a href={item.href} aria-label={item.label} className="wi-link">
                    {body}
                  </a>
                ) : (
                  <button
                    type="button"
                    aria-haspopup="dialog"
                    aria-label={item.label}
                    onClick={item.onOpen}
                    className="wi-link"
                  >
                    {body}
                  </button>
                )}
                {item.action}
              </div>
            );
          })}
        </div>
      </div>

      {children}
    </main>
  );
}
