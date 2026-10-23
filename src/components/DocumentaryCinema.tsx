"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, DUR } from "@/lib/gsap";
import { usePageReady } from "@/components/PageTransition";
import { CornerArrow, RightArrow } from "@/components/Arrows";
import { SectionLabel } from "@/components/SectionLabel";
import { CHANNEL, thumbUrl, watchUrl, type Film } from "@/lib/documentary";

/**
 * Documentary cinema — one viewport that does not scroll, like the
 * photography index, but built around a single stage rather than a strip:
 *
 *  - The stage shows the active film's still; clicking it (or a row, or
 *    Enter) swaps the still for an embedded YouTube player, autoplaying.
 *  - The right column lists every film. Hover previews a film on the stage;
 *    while one is playing, hover is ignored so the picture is not yanked
 *    away mid-watch — clicking a row switches the player to that film.
 *  - Arrow keys and the band's arrows step through the archive; the display
 *    title and still crossfade on every change. Escape closes the player.
 *
 * The active film's title runs along the bottom in display type, the same
 * band the photography page gives its wordmark.
 */
export function DocumentaryCinema({ films }: { films: Film[] }) {
  const root = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const start = usePageReady();

  const [active, setActive] = useState(0);
  /** The outgoing still, kept mounted beneath the fade until it completes. */
  const [prev, setPrev] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);

  // Read through refs inside stable callbacks, so handlers never re-bind.
  const activeRef = useRef(active);
  const playingRef = useRef(playing);
  useEffect(() => {
    activeRef.current = active;
    playingRef.current = playing;
  }, [active, playing]);

  const film = films[active];
  const counter = (i: number) => String(i + 1).padStart(2, "0");

  const select = useCallback((i: number) => {
    if (i === activeRef.current) return;
    setPrev(activeRef.current);
    setActive(i);
  }, []);

  const step = useCallback(
    (dir: 1 | -1) => {
      const next = (activeRef.current + dir + films.length) % films.length;
      select(next);
      listRef.current
        ?.querySelectorAll<HTMLElement>("[data-film-row]")
        [next]?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    },
    [films.length, select],
  );

  // Keyboard: arrows browse, Enter plays, Escape closes the player.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        step(1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        step(-1);
      } else if (e.key === "Enter" && !playingRef.current) {
        setPlaying(true);
      } else if (e.key === "Escape") {
        setPlaying(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  /*
   * Warm the archive's stills while the page idles, nearest neighbours first,
   * so a hover or an arrow press lands on a frame that is already decoded.
   */
  useEffect(() => {
    const order = [...films.keys()].sort(
      (a, b) => Math.abs(a - active) - Math.abs(b - active),
    );
    let i = 0;
    let timer = 0;
    const warmNext = () => {
      if (i >= order.length) return;
      const img = new Image();
      img.src = thumbUrl(films[order[i++]].id);
      timer = window.setTimeout(warmNext, 250);
    };
    warmNext();
    return () => window.clearTimeout(timer);
    // Runs once; the first film is a fine centre for the sweep.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Intro — the hero reveal vocabulary: stage rises, rows stagger in,
        the title line climbs out of its mask. Hidden states are set from JS
        so a script failure leaves the page readable. */
  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const stage = root.current?.querySelectorAll(".dc-stage");
      const rows = root.current?.querySelectorAll("[data-film-row]");
      const title = root.current?.querySelectorAll(".dc-title");
      const aside = root.current?.querySelectorAll(".dc-fade");
      if (!stage || !rows || !title || !aside) return;

      if (reduced) {
        gsap.set([stage, rows, title, aside], { clearProps: "all" });
        return;
      }

      gsap.set(stage, { autoAlpha: 0, y: 28 });
      gsap.set(rows, { autoAlpha: 0, y: 14 });
      gsap.set(title, { yPercent: 110 });
      gsap.set(aside, { autoAlpha: 0 });

      if (!start) return;

      gsap
        .timeline({ defaults: { ease: "ease-transition" } })
        .to(stage, { autoAlpha: 1, y: 0, duration: DUR.slow })
        .to(rows, { autoAlpha: 1, y: 0, duration: DUR.normal, stagger: 0.018 }, "-=0.8")
        .to(title, { yPercent: 0, duration: DUR.slow }, "-=0.85")
        .to(aside, { autoAlpha: 1, duration: DUR.normal }, "-=0.7");
    },
    { scope: root, dependencies: [start] },
  );

  /* ── Change — crossfade the incoming still over the outgoing one and run
        the new title up through the band's mask. */
  const seen = useRef(false);
  useGSAP(
    () => {
      if (!seen.current) {
        // Mount render: the intro owns the first reveal.
        seen.current = true;
        return;
      }
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) {
        setPrev(null);
        return;
      }
      gsap
        .timeline({
          defaults: { ease: "ease-transition" },
          onComplete: () => setPrev(null),
        })
        .fromTo(
          ".dc-still-active",
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: DUR.normal },
        )
        .fromTo(
          ".dc-title",
          { yPercent: 110 },
          { yPercent: 0, duration: DUR.normal },
          "<",
        );
    },
    { scope: root, dependencies: [active] },
  );

  return (
    <main
      ref={root}
      className="relative isolate flex h-svh flex-col overflow-hidden shell pt-[calc(var(--site-margin)*2+2.75rem)]"
    >
      <h1 className="sr-only">Documentary — Amar Ramesh</h1>

      <div className="flex min-h-0 flex-1 flex-col gap-5 md:grid-12">
        {/* ── Stage ──────────────────────────────────────────────── */}
        <div className="dc-stage relative col-span-12 aspect-video w-full shrink-0 overflow-hidden bg-chip md:col-span-8 md:aspect-auto md:h-full">
          {prev !== null && (
            <img
              src={thumbUrl(films[prev].id)}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          <img
            key={film.id}
            src={thumbUrl(film.id)}
            alt=""
            className="dc-still-active dc-drift absolute inset-0 h-full w-full object-cover"
          />

          {!playing && (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              aria-label={`Play ${film.title}`}
              className="group absolute inset-0 z-10 flex cursor-pointer items-center justify-center"
            >
              <span className="flex size-16 items-center justify-center rounded-full bg-background/90 backdrop-blur-sm transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110 md:size-20">
                <svg viewBox="0 0 24 24" className="ml-[3px] w-5 text-foreground md:w-6" fill="currentColor" aria-hidden>
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
              <span className="absolute bottom-3 left-3 bg-background/90 px-2 py-1 text-[11px] font-medium tracking-[-0.02em]">
                {film.duration}
              </span>
            </button>
          )}

          {playing && (
            <div className="absolute inset-0 z-20 bg-black">
              <iframe
                key={film.id}
                src={`https://www.youtube-nocookie.com/embed/${film.id}?autoplay=1&rel=0&playsinline=1`}
                title={film.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
              />
              <button
                type="button"
                onClick={() => setPlaying(false)}
                className="absolute right-3 top-3 z-10 bg-background px-3 py-1.5 text-[12px] font-medium tracking-[-0.02em] transition-colors hover:bg-chip"
              >
                Close ✕
              </button>
            </div>
          )}
        </div>

        {/* ── Index of films ─────────────────────────────────────── */}
        <div className="col-span-12 flex min-h-0 flex-1 flex-col md:col-start-9 md:col-span-4 md:h-full">
          <div className="dc-fade flex flex-col gap-3 pb-5">
            <SectionLabel>The films</SectionLabel>
            <p className="text-[13px] leading-[1.5] text-muted">
              {CHANNEL.name} — a growing archive of India&rsquo;s living culture, every film
              researched, directed and filmed by Amar Ramesh.
            </p>
            <a
              href={CHANNEL.url}
              target="_blank"
              rel="noopener noreferrer"
              className="link-wipe flex w-fit items-center gap-[0.3em] text-[13px] font-medium"
            >
              Watch the channel
              <CornerArrow className="w-[0.8em]" />
            </a>
          </div>

          <div
            ref={listRef}
            className="min-h-0 flex-1 overflow-y-auto border-t border-rule [scrollbar-width:thin]"
          >
            {films.map((entry, i) => (
              <button
                key={entry.id}
                type="button"
                data-film-row
                aria-current={i === active}
                onMouseEnter={() => {
                  // Hover previews — unless a film is playing, where a stray
                  // pointer pass would yank the picture away mid-watch.
                  if (!playingRef.current) select(i);
                }}
                onClick={() => {
                  select(i);
                  setPlaying(true);
                }}
                className={`grid w-full cursor-pointer grid-cols-12 items-baseline gap-x-2 border-b border-rule py-3 text-left transition-opacity duration-300 ${
                  i === active ? "opacity-100" : "opacity-40 hover:opacity-100"
                }`}
              >
                <span className="col-span-2 text-[12px] font-medium text-muted">
                  {counter(i)}
                </span>
                <span className="col-span-8 text-[15px] font-semibold leading-[1.25] tracking-[-0.03em]">
                  {entry.title}
                </span>
                <span className="col-span-2 text-right text-[12px] font-medium text-muted">
                  {entry.duration}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom band — the active film in display type, with the
           counter and controls on the list's columns. ─────────────── */}
      <div className="shrink-0 pb-[var(--site-margin)] pt-5">
        <div className="grid-12 items-end gap-y-3">
          <div className="col-span-12 overflow-hidden md:col-span-8">
            <h2
              key={film.id}
              className="dc-title display overflow-hidden text-ellipsis whitespace-nowrap !text-[clamp(1.6rem,3.8vw,3.6rem)]"
            >
              {film.short ?? film.title}
            </h2>
          </div>

          {/* pr clears the fixed theme/grid pills pinned to the corner; on a
              phone the row moves above the title, off the bottom-left pill. */}
          <div className="dc-fade order-first col-span-12 pr-12 md:order-0 md:col-start-9 md:col-span-4">
            <p className="hidden text-[13px] leading-[1.5] text-muted md:line-clamp-2">
              {film.blurb}
            </p>
            <div className="flex items-center justify-between gap-4 md:pt-3">
              <a
                href={watchUrl(film.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="link-wipe text-[13px] font-medium tabular-nums text-muted"
              >
                {counter(active)}/{films.length} &middot; {film.year} &middot; YouTube ↗
              </a>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Previous film"
                  onClick={() => step(-1)}
                  className="flex size-9 cursor-pointer items-center justify-center border border-rule transition-colors hover:bg-chip"
                >
                  <RightArrow back className="w-[11px]" />
                </button>
                <button
                  type="button"
                  aria-label="Next film"
                  onClick={() => step(1)}
                  className="flex size-9 cursor-pointer items-center justify-center border border-rule transition-colors hover:bg-chip"
                >
                  <RightArrow className="w-[11px]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
