"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CornerArrow, RightArrow } from "@/components/Arrows";
import { FilmModal } from "@/components/FilmModal";
import { SectionLabel } from "@/components/SectionLabel";

export type CarouselFilm = {
  id: string;
  title: string;
  duration: string;
  year: number;
  thumb: string;
  aspect?: [number, number];
  channel: string;
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
 * The home page's documentary carousel: every film's thumbnail in a native
 * horizontal scroller, ending on a "view all" card.
 *
 * Native scrolling rather than a transform-driven slider: touch swipes and
 * trackpad gestures work for free, snapping is CSS, and nothing fights the
 * page's ScrollSmoother. The arrows are for mouse users, who have no
 * horizontal wheel; they page a full view of cards at a time and disable at
 * either end.
 *
 * A film card plays its film in place, in a modal over the page — the
 * documentary page's pinned player. Only the closing card leads to
 * /documentary.
 */
export function FilmCarousel({ films, total }: { films: CarouselFilm[]; total: number }) {
  const track = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [playing, setPlaying] = useState<CarouselFilm | null>(null);
  // Stable, so the modal's Escape/focus effect doesn't re-run each render.
  const closePlayer = useCallback(() => setPlaying(null), []);

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

  return (
    <div>
      <div className="shell flex items-center justify-between gap-6">
        <SectionLabel>Films &amp; Documentaries</SectionLabel>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Previous films"
            className={arrowBtn}
            disabled={atStart}
            onClick={() => step(-1)}
          >
            <RightArrow back />
          </button>
          <button
            type="button"
            aria-label="Next films"
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
          crowd them on a phone. */}
      <h2 className="shell mt-3 text-[clamp(1.5rem,2.6vw,2.25rem)] font-semibold leading-[1.15] tracking-[-0.03em] md:mt-4 md:w-[70%]">
        People have the most interesting stories
      </h2>

      <div
        ref={track}
        className="mt-6 flex snap-x snap-mandatory md:mt-8 gap-4 overflow-x-auto overscroll-x-contain [scrollbar-width:none] md:gap-6 [&::-webkit-scrollbar]:hidden"
        style={{ paddingInline: SHELL_INSET, scrollPaddingInline: SHELL_INSET }}
      >
        {films.map((film) => (
          <button
            key={film.id}
            type="button"
            aria-haspopup="dialog"
            onClick={() => setPlaying(film)}
            data-card
            className="group/film flex w-[78vw] shrink-0 cursor-pointer snap-start flex-col gap-4 text-left sm:w-[44vw] md:w-[31vw] xl:w-[24vw]"
          >
            <span className="relative block aspect-video overflow-hidden bg-chip">
              <img
                src={film.thumb}
                alt=""
                loading="lazy"
                decoding="async"
                /* A film with no maxres thumbnail gets YouTube's 120px grey
                   placeholder (served as a 404 with an image body, so it
                   loads rather than errors); step down to hqdefault, which
                   every public video has. */
                onLoad={(e) => {
                  const img = e.currentTarget;
                  if (img.naturalWidth <= 120 && img.src.includes("maxresdefault")) {
                    img.src = img.src.replace("maxresdefault", "hqdefault");
                  }
                }}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/film:scale-[1.04]"
              />
              <span className="absolute bottom-3 right-3 bg-foreground/80 px-1.5 py-0.5 text-[12px] font-medium tabular-nums text-background">
                {film.duration}
              </span>
            </span>
            <span className="flex flex-col gap-1">
              <span className="text-[16px] font-semibold leading-[1.3] tracking-[-0.03em] transition-opacity duration-300 group-hover/film:opacity-70">
                {film.title}
              </span>
              <span className="text-[13px] font-medium text-muted">{film.year}</span>
            </span>
          </button>
        ))}

        {/* The closing card: a thumbnail-sized box, so it lines up with the
            row, inverting on hover like the site's link rows. */}
        <a
          href="/documentary"
          data-card
          className="group/all flex w-[78vw] shrink-0 snap-start flex-col sm:w-[44vw] md:w-[31vw] xl:w-[24vw]"
        >
          <span className="flex aspect-video flex-col justify-between border border-foreground/25 p-5 transition-colors duration-300 group-hover/all:bg-foreground group-hover/all:text-background">
            <span className="text-[13px] font-medium text-muted transition-colors duration-300 group-hover/all:text-background/60">
              {total} films
            </span>
            <span className="flex items-end justify-between gap-3 text-[24px] font-semibold leading-[1.15] tracking-[-0.03em]">
              View all
              <CornerArrow tight className="mb-[0.25em] w-3.5 shrink-0 transition-transform duration-300 group-hover/all:translate-x-0.5 group-hover/all:-translate-y-0.5" />
            </span>
          </span>
        </a>
      </div>

      <FilmModal film={playing} onClose={closePlayer} />
    </div>
  );
}
