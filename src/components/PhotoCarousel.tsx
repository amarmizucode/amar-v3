"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CornerArrow, RightArrow } from "@/components/Arrows";
import { SectionLabel } from "@/components/SectionLabel";

export type CarouselGallery = {
  slug: string;
  title: string;
  cover: string;
  /** How many photographs the gallery holds. */
  count: number;
};

/*
 * The track bleeds to both viewport edges but its first and last cards sit on
 * the page shell's edges: the inline padding (and the matching scroll
 * padding, so snapping lands there too) is the shell's own inset — its margin,
 * plus half of whatever the viewport has beyond --grid-max.
 */
const SHELL_INSET =
  "max(var(--grid-margin), calc((100% - var(--grid-max)) / 2 + var(--grid-margin)))";

/**
 * The home page's photography carousel — the documentary carousel's build,
 * card for card, with gallery covers in the film thumbnails' place: a native
 * horizontal scroller of 4:5 covers, ending on a "view all" card.
 *
 * Native scrolling rather than a transform-driven slider: touch swipes and
 * trackpad gestures work for free, snapping is CSS, and nothing fights the
 * page's ScrollSmoother. The arrows are for mouse users, who have no
 * horizontal wheel; they page a full view of cards at a time and disable at
 * either end. Each card leads to its gallery; the closing card to the index.
 */
export function PhotoCarousel({
  galleries,
  total,
}: {
  galleries: CarouselGallery[];
  total: number;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const el = track.current;
    if (!el) return;
    // A pixel of slack: fractional widths leave scrollLeft a hair short of max.
    setAtStart(el.scrollLeft <= 1);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    sync();
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      el.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [sync]);

  /* A page per press: as many whole cards as fit between the shell insets,
     so the next batch slides in together. Read live so it holds at every
     breakpoint, and always a whole number of cards so snapping agrees. */
  const step = (dir: 1 | -1) => {
    const el = track.current;
    const card = el?.querySelector<HTMLElement>("[data-card]");
    if (!el || !card) return;
    const style = getComputedStyle(el);
    const gap = parseFloat(style.columnGap) || 0;
    const visible =
      el.clientWidth - (parseFloat(style.paddingLeft) || 0) - (parseFloat(style.paddingRight) || 0);
    const pitch = card.offsetWidth + gap;
    const perPage = Math.max(1, Math.floor((visible + gap) / pitch));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * perPage * pitch, behavior: reduced ? "auto" : "smooth" });
  };

  /* The testimonials strip's bare arrows: no ring, just the glyph, dimming
     on hover and fading out when the end is reached. */
  const arrowBtn =
    "w-4 cursor-pointer transition-opacity hover:opacity-60 disabled:pointer-events-none disabled:opacity-30";

  const cardW = "w-[60vw] sm:w-[34vw] md:w-[24vw] xl:w-[18vw]";

  return (
    <div>
      <div className="shell flex items-center justify-between gap-6">
        <SectionLabel>Photography</SectionLabel>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Previous galleries"
            className={arrowBtn}
            disabled={atStart}
            onClick={() => step(-1)}
          >
            <RightArrow back />
          </button>
          <button
            type="button"
            aria-label="Next galleries"
            className={arrowBtn}
            disabled={atEnd}
            onClick={() => step(1)}
          >
            <RightArrow />
          </button>
        </div>
      </div>

      {/* The section's headline, from the copy doc. It sits under the
          eyebrow row rather than in it: that row is a justify-between flex
          with the paging arrows at its end, where a full sentence would
          crowd them on a phone. The shell is the wrapper, not the h2: a
          shell is max-width with auto margins, so a narrower h2 carrying
          it would be centred rather than flush left. */}
      <div className="shell">
        <h2 className="mt-3 max-w-[22ch] text-[clamp(1.5rem,2.6vw,2.25rem)] font-semibold leading-[1.15] tracking-[-0.03em] md:mt-4">
        All these years, and I still love picking up my camera
        </h2>
      </div>

      <div
        ref={track}
        className="mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain [scrollbar-width:none] md:mt-8 md:gap-6 [&::-webkit-scrollbar]:hidden"
        style={{ paddingInline: SHELL_INSET, scrollPaddingInline: SHELL_INSET }}
      >
        {galleries.map((gallery) => (
          // eslint-disable-next-line @next/next/no-html-link-for-pages -- plain anchor so the route curtain handles the transition, as everywhere on the site.
          <a
            key={gallery.slug}
            href={`/photography/${gallery.slug}`}
            data-card
            className={`group/cover flex shrink-0 snap-start flex-col gap-4 ${cardW}`}
          >
            <span className="relative block aspect-[4/5] overflow-hidden bg-chip">
              <img
                src={gallery.cover}
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/cover:scale-[1.04]"
              />
            </span>
            <span className="flex flex-col gap-1">
              <span className="text-[16px] font-semibold leading-[1.3] tracking-[-0.03em] transition-opacity duration-300 group-hover/cover:opacity-70">
                {gallery.title}
              </span>
              <span className="text-[13px] font-medium text-muted">{gallery.count} frames</span>
            </span>
          </a>
        ))}

        {/* The closing card: a cover-sized box, so it lines up with the
            row, inverting on hover like the site's link rows. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- plain anchor so the route curtain handles the transition, as everywhere on the site. */}
        <a
          href="/photography"
          data-card
          className={`group/all flex shrink-0 snap-start flex-col ${cardW}`}
        >
          <span className="flex aspect-[4/5] flex-col justify-between border border-foreground/25 p-5 transition-colors duration-300 group-hover/all:bg-foreground group-hover/all:text-background">
            <span className="text-[13px] font-medium text-muted transition-colors duration-300 group-hover/all:text-background/60">
              {total} galleries
            </span>
            <span className="flex items-end justify-between gap-3 text-[20px] font-semibold leading-[1.15] tracking-[-0.03em] sm:text-[24px]">
              View all
              <CornerArrow
                tight
                className="mb-[0.25em] w-3.5 shrink-0 transition-transform duration-300 group-hover/all:translate-x-0.5 group-hover/all:-translate-y-0.5"
              />
            </span>
          </span>
        </a>
      </div>
    </div>
  );
}
