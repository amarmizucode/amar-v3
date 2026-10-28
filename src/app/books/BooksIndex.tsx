"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useGSAP } from "@gsap/react";
import { CornerArrow, RightArrow } from "@/components/Arrows";
import { usePageReady } from "@/components/PageTransition";
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

  /** The volume standing open on the shelf (hover / focus), if any — the
   * shelf rests with every book closed. */
  const [active, setActive] = useState<number | null>(null);
  /** The book in the detail viewer, or null while the shelf is on show. */
  const [open, setOpen] = useState<number | null>(null);
  /** Phone only: the book held under a finger, its cover lifted off the pile. */
  const [peek, setPeek] = useState<number | null>(null);
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

      /* Phones: the pile is dropped. Every book starts above the viewport
       * and falls with free-fall physics — quadratic acceleration, fall time
       * from its own drop distance (t ∝ √d) — then settles with the smallest
       * of hops, a few pixels scaled to the drop. Books release in order —
       * bottom of the pile first, building upward — with a pinch of random
       * jitter inside each step, small enough that the order always reads. */
      if (window.matchMedia("(max-width: 767px)").matches) {
        const tl = gsap.timeline({ paused: !readyRef.current, delay: 0.25 });
        [...vols].reverse().forEach((el, n) => {
          const dist = el.getBoundingClientRect().bottom + 40;
          gsap.set(el, { y: -dist });
          const release = n * 0.13 + Math.random() * 0.05;
          const hop = Math.min(8, Math.max(3, dist * 0.012));
          tl.to(
            el,
            { y: 0, duration: Math.sqrt(dist / 2400), ease: "power1.in" },
            release,
          )
            .to(el, { y: -hop, duration: 0.12, ease: "power1.out" }, ">")
            .to(el, { y: 0, duration: 0.14, ease: "power1.in" }, ">");
        });
        intro.current = tl;
        return;
      }

      /* Desktop: the volumes rise out of the shelf's clip. */
      gsap.set(vols, { yPercent: 112 });
      intro.current = gsap
        .timeline({
          paused: !readyRef.current,
          delay: 0.25,
          defaults: { ease: "expo.out", duration: 1.5 },
        })
        .to(vols, { yPercent: 0, stagger: 0.055 }, 0);
    },
    { scope: root },
  );

  /* ── Caption: in with the hovered book's lines, away when none is ────── */
  const prevActive = useRef<number | null>(null);
  useEffect(() => {
    if (prevActive.current === active) return;
    prevActive.current = active;
    const el = cap.current;
    if (!el) return;
    if (reduced()) {
      gsap.set(el, { autoAlpha: active == null ? 0 : 1 });
      if (active != null) gsap.set(el.children, { clearProps: "y,opacity,visibility" });
      return;
    }
    if (active == null) {
      gsap.to(el, { autoAlpha: 0, duration: DUR.fast, ease: "ease-transition", overwrite: true });
      return;
    }
    gsap.set(el, { autoAlpha: 1 });
    gsap.fromTo(
      el.children,
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

  /* ── Phone hold-to-peek ──────────────────────────────────────────────── */
  /* Holding a book lifts its cover over the pile; releasing drops it back.
   * A press shorter than the threshold stays a tap and opens the viewer; a
   * longer one is a peek, and the click it releases into is swallowed. */
  const holdTimer = useRef(0);
  const peeked = useRef(false);

  const holdStart = (i: number) => {
    if (!window.matchMedia("(max-width: 767px)").matches) return;
    // Warm the art so the peek paints instantly even on its first hold.
    new Image().src = books[i].art.cover;
    window.clearTimeout(holdTimer.current);
    holdTimer.current = window.setTimeout(() => {
      peeked.current = true;
      setPeek(i);
    }, 220);
  };

  const holdEnd = () => {
    window.clearTimeout(holdTimer.current);
    setPeek(null);
    // The release's click (when the browser sends one) fires right after
    // pointerup; the flag outlives it by a beat, then clears for real taps.
    window.setTimeout(() => {
      peeked.current = false;
    }, 80);
  };

  /* ── Viewer open / close / step ──────────────────────────────────────── */
  const openBook = (i: number) => {
    if (peeked.current) return;
    setActive(i);
    setShot(0);
    setOpen(i);
  };

  const step = useCallback(
    (dir: 1 | -1) => {
      setShot(0);
      setOpen((o) => (o == null ? o : (o + dir + books.length) % books.length));
      setActive((a) => (a == null ? a : (a + dir + books.length) % books.length));
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

  /* The caption keeps the last hovered book's lines while it fades away, so
   * a mouse-leave does not empty the block mid-fade; the peek keeps its last
   * cover the same way. */
  const lastShown = useRef(0);
  if (active != null) lastShown.current = active;
  const featured = books[active ?? lastShown.current];
  const lastPeek = useRef(0);
  if (peek != null) lastPeek.current = peek;
  const peekBook = books[peek ?? lastPeek.current];
  const book = open != null ? books[open] : null;
  const next = open != null ? books[(open + 1) % books.length] : null;
  const prev = open != null ? books[(open - 1 + books.length) % books.length] : null;
  const shots = book ? [book.cover, ...book.plates] : [];

  return (
    <div ref={root}>
      <main className="relative isolate h-svh overflow-hidden">
        <h1 className="sr-only">Books — Amar Ramesh</h1>

        <div className="bk-stage absolute inset-0 z-10" data-peek={peek != null}>
          {/* Leaving the shelf closes whichever book was open. */}
          <div className="bk-shelf" role="list" onMouseLeave={() => setActive(null)}>
            {books.map((b, i) => (
              <article
                key={b.slug}
                role="listitem"
                className={`bk-vol ${i === active ? "is-open" : ""}`}
                /* The measured art proportions; the stylesheet derives each
                 * volume's height, spine width and cover width from these, so
                 * the shelf keeps the set's true formats and relative sizes. */
                style={
                  {
                    "--hr": b.art.heightRatio,
                    "--sr": b.art.spineRatio,
                    "--cr": b.art.coverRatio,
                    /* The phone pile's jitter: deterministic per position, so
                     * the server and client agree and the pile still looks
                     * casually dropped. */
                    "--mx": `${(i * 53) % 31}px`,
                  } as CSSProperties
                }
              >
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => openBook(i)}
                  onPointerDown={() => holdStart(i)}
                  onPointerUp={holdEnd}
                  onPointerCancel={holdEnd}
                  onContextMenu={(e) => e.preventDefault()}
                  aria-label={`${b.title} — open the book`}
                  className="bk-vol_btn"
                >
                  {/* The 3D book: the real spine strip faces out, the cover
                      artwork stands at a right angle behind it, and `is-open`
                      swivels the pair on the spine's left edge so the cover
                      swings around to the viewer. */}
                  <span className="bk-book" aria-hidden>
                    <span className="bk-face bk-face_spine">
                      <img src={b.art.spine} alt="" draggable={false} />
                    </span>
                    <span className="bk-face bk-face_cover">
                      <img
                        src={b.art.cover}
                        alt=""
                        draggable={false}
                        loading={i === 0 ? "eager" : "lazy"}
                      />
                    </span>
                  </span>
                  {/* Phones have no hover: the books lie flat in a pile, each
                      row the spine art turned horizontal, and a tap opens the
                      detail view. */}
                  <span className="bk-row_art" aria-hidden>
                    <img src={b.art.spine} alt="" draggable={false} />
                  </span>
                </button>
              </article>
            ))}
          </div>

          {/* The hovered book's name, small and quiet beneath the shelf.
              Hidden until a book stands open; GSAP owns it from then on. */}
          <div ref={cap} className="bk-cap" style={{ opacity: 0, visibility: "hidden" }}>
            <p className="text-[13px] font-semibold uppercase tracking-[0.04em] text-muted">
              {featured.title}
            </p>
          </div>
        </div>

        {/* Phone peek: the held book stands up over the dimmed pile and
            swivels open — the same spine-to-cover turn as the web hover. */}
        <div className="bk-peek" aria-hidden data-on={peek != null}>
          <span
            className="bk-peek_vol"
            style={
              {
                "--hr": peekBook.art.heightRatio,
                "--sr": peekBook.art.spineRatio,
                "--cr": peekBook.art.coverRatio,
              } as CSSProperties
            }
          >
            <span className="bk-book">
              <span className="bk-face bk-face_spine">
                <img src={peekBook.art.spine} alt="" draggable={false} />
              </span>
              <span className="bk-face bk-face_cover">
                <img src={peekBook.art.cover} alt="" draggable={false} />
              </span>
            </span>
          </span>
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
          className="btn-pill"
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
