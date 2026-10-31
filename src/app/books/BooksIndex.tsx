"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { useGSAP } from "@gsap/react";
import { CornerArrow } from "@/components/Arrows";
import { Eyebrow } from "@/components/Eyebrow";
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

/** `value`, or the last non-null value it had: state adjusted during render,
 *  React's sanctioned way to remember something from a previous render. */
function useLastNonNull<T>(value: T | null, initial: T): T {
  const [last, setLast] = useState(initial);
  if (value != null && value !== last) setLast(value);
  return value ?? last;
}
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
      // The paragraph beneath the shelf rises in once the books have landed.
      gsap.set(".bk-intro", { y: 14, autoAlpha: 0 });
      const introIn = { y: 0, autoAlpha: 1, duration: DUR.normal, ease: "ease-transition" };

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
        tl.to(".bk-intro", introIn, ">-0.2");
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
        .to(vols, { yPercent: 0, stagger: 0.055 }, 0)
        .to(".bk-intro", introIn, 0.6);
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
    setOpen(i);
  };

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
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("bk-viewing");
      window.removeEventListener("keydown", onKey);
    };
  }, [viewing, requestClose]);

  /* The caption keeps the last hovered book's lines while it fades away, so
   * a mouse-leave does not empty the block mid-fade; the peek keeps its last
   * cover the same way. */
  const featured = books[useLastNonNull(active, 0)];
  const peekBook = books[useLastNonNull(peek, 0)];
  const book = open != null ? books[open] : null;

  return (
    <div ref={root}>
      <main id="main" className="relative isolate h-svh overflow-hidden">
        <h1 className="sr-only">Books - Amar Ramesh</h1>

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
                  aria-label={`${b.title} - open the book`}
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

          {/* A word on the books, always on show beneath the shelf. */}
          <p className="bk-intro text-[clamp(15px,1.15vw,18px)] leading-[1.3] tracking-[-0.01em] text-muted">
            I&rsquo;ve always loved books, and creating them has become one of my favourite
            things to do. From photographing a subject and researching its history to working on
            the design and production, I enjoy being involved in the process. Many of my books
            explore art, architecture and cultural traditions, subjects I find endlessly
            fascinating.
          </p>
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

      </main>

      {/* ── Viewer ─────────────────────────────────────────────────────── */}
      {/* Portalled to <body>: `main` is an isolated stacking context, so a
          dialog rendered inside it can never paint above the fixed site
          header however high its z-index goes. */}
      {book && typeof document !== "undefined"
        ? createPortal(
          <div
            ref={overlay}
            role="dialog"
            aria-modal="true"
            aria-label={`${book.title} - book details`}
            className="bk-lg"
          >
            {/* Clicking off the panel closes it, as the film player does. */}
            <button
              type="button"
              aria-label="Close book details"
              tabIndex={-1}
              onClick={requestClose}
              className="bk-lg_scrim"
            />

            {/* The print-requests panel's look on the earlier measure: a
                fixed-height panel that scrolls inside, the category and
                Close along its head, the book's name and details in the
                right-hand column. */}
            <div className="bk-lg_panel works">
              <div className="flex items-center justify-between gap-6">
                <Eyebrow>{book.category}</Eyebrow>
                <div className="flex items-center gap-2">
                  {/* The shortcut sits with the button it doubles for. */}
                  <kbd className="close-kbd" aria-hidden>
                    Esc
                  </kbd>
                  <button
                    ref={closeBtn}
                    type="button"
                    onClick={requestClose}
                    className="close-btn"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="bk-lg_body">
                {/* Every shot the store carries, stacked as the print
                    requests stack theirs: the cover full width, the plates
                    in masonry columns below, each uncropped. Keyed per
                    book, so stepping to a neighbour starts at its cover. */}
                <div key={`${book.slug}-shots`} className="bk-lg_mask">
                  <div className="bk-lg_mask_inside">
                    <img
                      src={book.cover}
                      alt={`${book.title} - cover`}
                      draggable={false}
                      className="bk-lg_lead"
                    />
                    {book.plates.length > 0 && (
                      <div className="bk-lg_plates">
                        {book.plates.map((src, n) => (
                          <img
                            key={src}
                            src={src}
                            alt={`${book.title} - plate ${n + 1}`}
                            draggable={false}
                            loading="lazy"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <TextCol key={book.slug} book={book} />
              </div>
            </div>
          </div>,
            document.body,
          )
        : null}

    </div>
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
      className="bk-lg_text flex flex-col items-start gap-5"
    >
      <h2 className="section_heading">{book.title}</h2>
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
          All books - maralabs.in
        </a>
      </div>
    </div>
  );
}
