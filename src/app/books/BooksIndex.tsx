"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { CornerArrow, RightArrow } from "@/components/Arrows";
import { usePageReady } from "@/components/PageTransition";
import { Wordmark } from "@/components/Wordmark";
import { gsap, DUR } from "@/lib/gsap";
import type { Book } from "@/lib/books";

/** "₹3,800" — store prices are whole rupees, so no paise. */
const rupees = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Books index — the same single non-scrolling viewport as the photography
 * index, with the wordmark along the bottom, but the strip is a bookshelf:
 * every title stands as a spine, and the active one swells open to its cover
 * (CSS width transitions carry the motion; React only moves the `is-open`
 * class, the way the filmstrip moves `is-big`). Clicking a volume opens the
 * detail viewer in place — cover, plates, the story and the way to the Mara
 * Labs store — mirroring how a filmstrip slide opens its gallery.
 *
 * Below 768px there is no hover, so the shelf stacks as flat rows and a tap
 * goes straight to the viewer.
 */
export function BooksIndex({ books }: { books: Book[] }) {
  const root = useRef<HTMLDivElement>(null);
  const cap = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  /** The volume standing open on the shelf (hover / focus / initial). */
  const [active, setActive] = useState(0);
  /** The book in the detail viewer, or null while the shelf is on show. */
  const [open, setOpen] = useState<number | null>(null);
  /** Which shot the viewer's frame holds: 0 is the cover, then the plates. */
  const [shot, setShot] = useState(0);

  const closing = useRef(false);
  const lastFocus = useRef<HTMLElement | null>(null);

  /* ── Intro: volumes rise out of the shelf's clip, caption follows ────── */
  const ready = usePageReady();
  const readyRef = useRef(ready);
  const intro = useRef<gsap.core.Timeline | null>(null);
  useEffect(() => {
    readyRef.current = ready;
    if (ready) intro.current?.play();
  }, [ready]);

  useGSAP(
    () => {
      const vols = gsap.utils.toArray<HTMLElement>(".bk-vol", root.current);
      if (!vols.length || reduced()) return;
      const lines = cap.current ? Array.from(cap.current.children) : [];
      gsap.set(vols, { yPercent: 112 });
      gsap.set(lines, { autoAlpha: 0, y: 18 });
      intro.current = gsap
        .timeline({
          paused: !readyRef.current,
          delay: 0.25,
          defaults: { ease: "expo.out", duration: 1.5 },
        })
        .to(vols, { yPercent: 0, stagger: 0.055 }, 0)
        .to(lines, { autoAlpha: 1, y: 0, stagger: 0.07, duration: 1 }, 0.35);
    },
    { scope: root },
  );

  /* ── Caption swap when another volume takes the shelf ────────────────── */
  const prevActive = useRef(0);
  useEffect(() => {
    if (prevActive.current === active) return;
    prevActive.current = active;
    if (!cap.current || reduced()) return;
    gsap.fromTo(
      cap.current.children,
      { y: 14, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        stagger: DUR.stagger,
        duration: DUR.normal,
        ease: "ease-transition",
        overwrite: true,
      },
    );
  }, [active]);

  /* ── Viewer open / close / step ──────────────────────────────────────── */
  const openBook = (i: number) => {
    setActive(i);
    setShot(0);
    setOpen(i);
  };

  const step = useCallback(
    (dir: 1 | -1) => {
      setShot(0);
      setOpen((o) => (o == null ? o : (o + dir + books.length) % books.length));
      setActive((a) => (a + dir + books.length) % books.length);
    },
    [books.length],
  );

  const requestClose = useCallback(() => {
    if (closing.current || !overlay.current) return;
    const done = () => {
      closing.current = false;
      setOpen(null);
      lastFocus.current?.focus?.();
    };
    if (reduced()) {
      done();
      return;
    }
    closing.current = true;
    gsap.to(overlay.current, {
      autoAlpha: 0,
      duration: DUR.fast,
      ease: "ease-transition",
      onComplete: done,
    });
  }, []);

  /* The entrance plays once per open; stepping between books while the viewer
   * is up swaps only the keyed frame and text column, which animate their own
   * mounts. useLayoutEffect so the from-states land before the overlay paints. */
  const prevOpen = useRef<number | null>(null);
  useLayoutEffect(() => {
    const was = prevOpen.current;
    prevOpen.current = open;
    if (open == null || was != null || !overlay.current) return;
    lastFocus.current = document.activeElement as HTMLElement | null;
    if (reduced()) {
      gsap.set(overlay.current, { autoAlpha: 1 });
    } else {
      const mask = overlay.current.querySelector(".bk-lg_mask");
      const inside = overlay.current.querySelector(".bk-lg_mask_inside");
      gsap
        .timeline({ defaults: { ease: "expo.out", duration: 1.3 } })
        .fromTo(
          overlay.current,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.35, ease: "none" },
          0,
        )
        .fromTo(mask, { yPercent: -101 }, { yPercent: 0 }, 0.05)
        .fromTo(inside, { yPercent: 101 }, { yPercent: 0 }, 0.05);
    }
    closeBtn.current?.focus();
  }, [open]);

  /* The site header gives way while the viewer is up (as the photography
   * viewer does), and the keyboard drives it: Escape out, arrows between books. */
  const viewing = open != null;
  useEffect(() => {
    if (!viewing) return;
    document.body.classList.add("bk-viewing");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") requestClose();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("bk-viewing");
      window.removeEventListener("keydown", onKey);
    };
  }, [viewing, requestClose, step]);

  const featured = books[active];
  const book = open != null ? books[open] : null;
  const next = open != null ? books[(open + 1) % books.length] : null;
  const prev = open != null ? books[(open - 1 + books.length) % books.length] : null;
  const shots = book ? [book.cover, ...book.plates] : [];

  return (
    <div ref={root}>
      <main className="relative isolate h-svh overflow-hidden">
        <h1 className="sr-only">Books — Amar Ramesh</h1>

        {/* Beneath the shelf, so the open volume hangs over it. */}
        <div
          className="bk-wordmark pointer-events-none absolute inset-x-0 bottom-0 z-0"
          style={{ padding: "0 var(--site-margin) var(--site-margin)" }}
        >
          <Wordmark>Books</Wordmark>
        </div>

        <div className="bk-stage absolute inset-0 z-10">
          {/* The active book's line, in the band the header leaves free. */}
          <div ref={cap} className="bk-cap shell">
            <p className="text-[15px] font-medium text-muted">
              [{featured.index}] — {featured.category}
            </p>
            <p className="max-w-[46ch] text-[clamp(17px,1.4vw,22px)] font-medium leading-[1.25] tracking-[-0.02em]">
              {featured.blurb}
            </p>
            <p className="text-[15px] font-medium text-muted">
              {featured.available ? rupees(featured.price) : "Sold out"} — published by Mara Labs
            </p>
          </div>

          <div className="bk-shelf" role="list">
            {books.map((b, i) => (
              <article
                key={b.slug}
                role="listitem"
                className={`bk-vol ${i === active ? "is-open" : ""}`}
              >
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => openBook(i)}
                  aria-label={`${b.title} — open the book`}
                  className="bk-vol_btn"
                >
                  <span className="bk-spine_label" aria-hidden>
                    <span className="bk-spine_idx">[{b.index}]</span>
                    <span>{b.title}</span>
                    <span className="bk-spine_cat">{b.category}</span>
                  </span>
                  <span className="bk-cover" aria-hidden>
                    <img src={b.cover} alt="" draggable={false} loading={i < 2 ? "eager" : "lazy"} />
                  </span>
                </button>
              </article>
            ))}
          </div>
        </div>

        {/* ── Viewer ─────────────────────────────────────────────────── */}
        {book && (
          <div
            ref={overlay}
            role="dialog"
            aria-modal="true"
            aria-label={`${book.title} — book details`}
            className="bk-lg"
          >
            {/* The header's stand-in while it is hidden: title where the
                wordmark sits, Close where the menu button does. */}
            <div className="bk-bar">
              <div className="shell grid-12 items-center">
                <p className="bk-bar_title col-span-8 text-[15px] font-semibold uppercase tracking-[-0.01em] md:col-span-5">
                  [{book.index}] {book.title}
                </p>
                <div className="col-span-4 flex justify-end md:col-start-11 md:col-span-2">
                  <button
                    ref={closeBtn}
                    type="button"
                    onClick={requestClose}
                    className="bk-bar_close text-[15px] font-medium tracking-[-0.03em]"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>

            <div className="bk-lg_scroll">
              <div className="bk-lg_grid shell grid-12">
                <div className="col-span-12 md:col-span-5">
                  <div className="bk-lg_frame">
                    <div className="bk-lg_mask">
                      <div className="bk-lg_mask_inside">
                        <Shot
                          key={`${book.slug}-${shot}`}
                          src={shots[shot]}
                          alt={
                            shot === 0
                              ? `${book.title} — cover`
                              : `${book.title} — plate ${shot}`
                          }
                        />
                      </div>
                    </div>
                  </div>
                  {/* Every shot the store carries; the frame shows the pick. */}
                  <div className="bk-lg_thumbs" role="tablist" aria-label="Book photographs">
                    {shots.map((s, n) => (
                      <button
                        key={s}
                        type="button"
                        role="tab"
                        aria-selected={n === shot}
                        aria-label={n === 0 ? "Cover" : `Plate ${n}`}
                        className={n === shot ? "is-cur" : ""}
                        onClick={() => setShot(n)}
                      >
                        <img src={s} alt="" draggable={false} loading="lazy" />
                      </button>
                    ))}
                  </div>
                </div>

                <TextCol key={book.slug} book={book} />

                {/* Phone: the fixed side pills are gone, so the way through
                    the shelf sits at the foot of the sheet. */}
                {prev && next && (
                  <nav className="bk-lg_mnav col-span-12" aria-label="More books">
                    <button type="button" onClick={() => step(-1)}>
                      <RightArrow className="bk-lg_mnav_arrow" back />
                      {prev.title}
                    </button>
                    <button type="button" onClick={() => step(1)}>
                      {next.title}
                      <RightArrow className="bk-lg_mnav_arrow" />
                    </button>
                  </nav>
                )}
              </div>
            </div>

            {/* Next and previous, pinned to the edges — the photography
                viewer's side pills, so the interaction matches. */}
            {prev && next && (
              <nav className="bk-sides">
                <button
                  type="button"
                  onClick={() => step(1)}
                  className="pg-side pg-side-next"
                  aria-label={`Next book: ${next.title}`}
                >
                  <span className="pg-side_text_contain">
                    <span className="pg-side_text">
                      [{next.index}] {next.title}
                    </span>
                  </span>
                  <span className="pg-side_aside">
                    <span className="pg-side_aside_bg" />
                    <RightArrow className="pg-side_icon" />
                    <RightArrow className="pg-side_icon is-absolute" />
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => step(-1)}
                  className="pg-side pg-side-prev"
                  aria-label={`Previous book: ${prev.title}`}
                >
                  <span className="pg-side_aside">
                    <span className="pg-side_aside_bg" />
                    <RightArrow className="pg-side_icon" back />
                    <RightArrow className="pg-side_icon is-absolute" back />
                  </span>
                  <span className="pg-side_text_contain">
                    <span className="pg-side_text">
                      [{prev.index}] {prev.title}
                    </span>
                  </span>
                </button>
              </nav>
            )}

            <p className="bk-bar_count text-[13px] font-medium">
              {book.index} / {String(books.length).padStart(2, "0")}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

/** The viewer's frame. Keyed per shot, so each swap fades its mount in. */
function Shot({ src, alt }: { src: string; alt: string }) {
  const img = useRef<HTMLImageElement>(null);
  useLayoutEffect(() => {
    if (reduced() || !img.current) return;
    gsap.fromTo(
      img.current,
      { autoAlpha: 0, scale: 1.04 },
      { autoAlpha: 1, scale: 1, duration: DUR.normal, ease: "ease-transition" },
    );
  }, []);
  return (
    <img
      ref={img}
      src={src}
      alt={alt}
      draggable={false}
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}

/**
 * The viewer's text column. Keyed per book, so stepping to a neighbour
 * animates the fresh mount the same way the entrance does.
 */
function TextCol({ book }: { book: Book }) {
  const col = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (reduced() || !col.current) return;
    gsap.fromTo(
      col.current.children,
      { y: 22, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        stagger: DUR.stagger,
        duration: DUR.normal,
        ease: "ease-transition",
        delay: 0.1,
      },
    );
  }, []);

  return (
    <div
      ref={col}
      className="bk-lg_text col-span-12 flex flex-col items-start gap-5 md:col-start-7 md:col-span-6"
    >
      <p className="text-[15px] font-medium text-muted">
        [{book.index}] — {book.category}
      </p>
      <h2 className="text-[clamp(2rem,3.4vw,3.5rem)] font-semibold uppercase leading-[0.95] tracking-[-0.03em]">
        {book.title}
      </h2>
      <p className="max-w-[52ch] text-[clamp(15px,1.15vw,18px)] leading-[1.5] tracking-[-0.01em]">
        {book.description}
      </p>
      <p className="flex items-center gap-3 text-[17px] font-medium">
        <span className={book.available ? "" : "text-muted line-through"}>
          {rupees(book.price)}
        </span>
        {!book.available && (
          <span className="rounded-[var(--nav-radius)] bg-chip px-2.5 py-1 text-[13px] text-muted">
            Sold out
          </span>
        )}
      </p>
      <div className="flex flex-wrap items-center gap-6 pt-1">
        {/* The CTA pill, pointed off-site — the store handles the sale. */}
        <a
          href={book.buyUrl}
          target="_blank"
          rel="noreferrer"
          className="btn-pill text-[15px] font-medium tracking-[-0.03em]"
        >
          <span className="btn-pill_text_contain">
            <span className="btn-pill_text">
              {book.available ? "Get the book" : "View at Mara Labs"}
            </span>
          </span>
          <span className="btn-pill_aside">
            <span className="btn-pill_aside_bg" />
            <CornerArrow className="btn-pill_icon" />
            <CornerArrow className="btn-pill_icon is-absolute" />
          </span>
        </a>
        <a
          href="https://maralabs.in"
          target="_blank"
          rel="noreferrer"
          className="link-wipe text-[15px] font-medium tracking-[-0.02em]"
        >
          All books — maralabs.in
        </a>
      </div>
    </div>
  );
}
