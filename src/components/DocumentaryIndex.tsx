"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText, DUR } from "@/lib/gsap";
import { usePageReady } from "@/components/PageTransition";
import { BSF_CHANNEL, CHANNEL, type ChannelFilm } from "@/lib/documentary";

/**
 * Documentary index — seyityilmaz.com's structure in this site's language.
 *
 * From the reference: the filmography left, floated mid-page; a sticky,
 * viewport-centred identity block right; hovering a row floats its film over
 * the blurred page, already playing, and follows the cursor from row to row;
 * clicking pins it open with sound and close chrome.
 *
 * From this site: the 12-column shell, the lede type, rule-separated rows
 * with the footer's hover fill — held, full width, on the film that is
 * showing — the heroes' masked line intro, and the theme palette instead of
 * the reference's pastel gradient.
 *
 * The page scrolls natively — no SmoothScroll — because the sticky intro
 * cannot engage inside ScrollSmoother's transformed content. The player
 * portals to <body> so `position: fixed` means the viewport.
 */
export function DocumentaryIndex({ films }: { films: ChannelFilm[] }) {
  const root = useRef<HTMLElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const player = useRef<HTMLIFrameElement>(null);
  const start = usePageReady();

  /*
   * Two tiers, like the reference: hovering a row floats its film playing
   * muted (a hover is not a user gesture, so muted autoplay is all a browser
   * allows — the reference's own videos are muted too), and clicking pins it
   * open with sound and close chrome. Neither ever becomes non-null on the
   * server, so the portal below never renders there.
   */
  const [hover, setHover] = useState<number | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const shown = open ?? hover;
  const pinned = open !== null;

  /* Closes either tier. Hover is cleared too: it outlives the pointer now,
     so leaving it set would drop a closed pinned film straight back into
     its preview. */
  const close = useCallback(() => {
    const el = overlay.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const clear = () => {
      setOpen(null);
      setHover(null);
    };
    if (!el || reduced) {
      clear();
      return;
    }
    gsap.to(el, {
      autoAlpha: 0,
      duration: DUR.fast,
      ease: "ease-transition",
      onComplete: clear,
    });
  }, []);

  // Escape closes the player, pinned or previewing.
  useEffect(() => {
    if (shown === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shown, close]);

  /*
   * A preview stays up after the pointer leaves its row — only hovering
   * another title swaps it, and only a click elsewhere closes it. The
   * preview lets pointer events fall through, so a click on the video
   * itself is caught here by its bounds and pins that film instead.
   */
  useEffect(() => {
    if (hover === null || open !== null) return;
    const onClick = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest?.("[data-film-row]")) return;
      const frame = overlay.current?.querySelector("[data-player-frame]");
      const r = frame?.getBoundingClientRect();
      if (
        r &&
        e.clientX >= r.left &&
        e.clientX <= r.right &&
        e.clientY >= r.top &&
        e.clientY <= r.bottom
      ) {
        setOpen(hover);
        return;
      }
      close();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [hover, open, close]);

  // Lock the page behind a pinned player, restoring what was there before.
  useEffect(() => {
    if (open === null) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  /*
   * Sound. The iframe loads muted (autoplay demands it) and is unmuted
   * through YouTube's postMessage API as soon as a film shows — on hover,
   * not just on pin. Browsers honour the unmute once the page has had any
   * interaction at all (the click that navigated here counts); on a
   * completely untouched first load they keep it muted, and nothing can
   * override that. The command is retried briefly because a cold-opened
   * player may not be listening yet when the first message goes out.
   */
  useEffect(() => {
    if (shown === null) return;
    const send = () => {
      const w = player.current?.contentWindow;
      if (!w) return;
      for (const [func, args] of [
        ["unMute", []],
        ["setVolume", [100]],
        ["playVideo", []],
      ] as const) {
        w.postMessage(JSON.stringify({ event: "command", func, args }), "*");
      }
    };
    send();
    const retry = window.setInterval(send, 350);
    const stop = window.setTimeout(() => window.clearInterval(retry), 2500);
    return () => {
      window.clearInterval(retry);
      window.clearTimeout(stop);
    };
  }, [shown]);

  /* ── Intro — the hero vocabulary: the lede climbs out of its line masks,
        the rows stagger up. Hidden states are set from JS so a script
        failure leaves the page readable. */
  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const ledeLines = gsap.utils
        .toArray<HTMLElement>(".di-lede", root.current)
        .map(
          (el) =>
            new SplitText(el, {
              type: "lines",
              linesClass: "split-line",
              mask: "lines",
            }),
        )
        .flatMap((s) => s.lines);
      const rows = root.current?.querySelectorAll("[data-film-row]");
      if (!rows) return;

      if (reduced) {
        gsap.set(ledeLines, { yPercent: 0 });
        gsap.set(rows, { clearProps: "opacity,visibility,transform" });
        return;
      }

      gsap.set(ledeLines, { yPercent: 110 });
      gsap.set(rows, { autoAlpha: 0, y: 14 });

      if (!start) return;

      gsap
        .timeline({ defaults: { ease: "ease-transition" } })
        .to(ledeLines, { yPercent: 0, duration: DUR.slow, stagger: 0.05 })
        .to(rows, { autoAlpha: 1, y: 0, duration: DUR.normal, stagger: 0.025 }, "-=0.85");
    },
    { scope: root, dependencies: [start] },
  );

  /* ── Player entrance — addressed by ref: the overlay lives in a portal,
        outside any scope selector. */
  useGSAP(
    () => {
      if (shown === null) return;
      const el = overlay.current;
      if (!el) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) {
        gsap.set(el, { autoAlpha: 1 });
        return;
      }
      const frame = el.querySelector("[data-player-frame]");
      gsap
        .timeline({ defaults: { ease: "ease-transition" } })
        // overwrite: a title hovered mid-close kills the fade-out, so its
        // onComplete can't clear the film that just replaced it.
        .fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: DUR.fast, overwrite: true })
        .fromTo(frame, { scale: 0.96 }, { scale: 1, duration: DUR.normal }, "<");
    },
    { dependencies: [shown] },
  );

  /* ── Follow the cursor — the reference's "Follow Mouse" interaction, with
        its own numbers: while a preview floats unpinned, the frame drifts
        after the pointer, mapped over the whole viewport (X: −3vw at the left
        edge to +35vw at the right, Y: −5vh to +4vh) on a half-second ease, so
        it trails the mouse rather than sticking to it. Since the pointer must
        stay over the list (the left quarter) for a preview to exist at all,
        in practice X swims a few vw and Y carries the travel as the cursor
        runs down the rows. Once the pointer leaves the titles the frame
        stops where it is. Pinning eases the frame back to true centre.

        A useEffect, not useGSAP: the hook ignores a returned cleanup, and
        this one's cleanup — unhooking the listener and recentring — is the
        half that makes pinning work. The deps are booleans on purpose: the
        frame element persists from row to row, so re-running per row would
        blip the frame through centre mid-scrub. */
  useEffect(() => {
    if (shown === null || pinned) return;
    const frame = overlay.current?.querySelector("[data-player-frame]");
    if (!frame) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // No cursor to follow on a touch screen.
    if (window.matchMedia("(hover: none)").matches) return;

    const xTo = gsap.quickTo(frame, "x", { duration: 0.5, ease: "power3.out" });
    const yTo = gsap.quickTo(frame, "y", { duration: 0.5, ease: "power3.out" });
    const onMove = (e: MouseEvent) => {
      // Only a pointer on a title steers; off the list the frame holds
      // where it was left, since the preview now outlives the hover.
      if (!(e.target as Element | null)?.closest?.("[data-film-row]")) return;
      const tx = e.clientX / window.innerWidth;
      const ty = e.clientY / window.innerHeight;
      xTo(window.innerWidth * (tx * 0.38 - 0.03));
      yTo(window.innerHeight * (ty * 0.09 - 0.05));
    };
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      // Overwrite kills the quickTo tweens mid-flight; scale is untouched.
      gsap.to(frame, {
        x: 0,
        y: 0,
        duration: 0.35,
        ease: "power3.out",
        overwrite: "auto",
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown === null, pinned]);

  const film = shown !== null ? films[shown] : null;
  const [aw, ah] = film?.aspect ?? [16, 9];

  return (
    <main ref={root} className="min-h-svh shell">
      <h1 className="sr-only">Documentary</h1>

      <div className="grid-12 pb-24 md:pb-0">
        {/* ── Filmography — left column. Sized like the reference's list:
             content width (the short titles keep it narrow), centred in its
             column, first row starting at the viewport's vertical centre
             (its stickymenu floats between 25vh margins), rows 8px apart. */}
        <div className="col-span-12 md:row-start-1 md:col-span-3">
          <div className="flex flex-col items-start pb-4 pt-4 md:items-center md:pb-[20svh] md:pt-[45svh]">
            <div className="flex w-full flex-col gap-2 md:w-max md:max-w-full">
              {films.map((entry, i) => {
                return (
                  <button
                    key={entry.id}
                    type="button"
                    data-film-row
                    aria-haspopup="dialog"
                    aria-current={shown === i}
                    /*
                     * Hover floats the film playing; moving down the list
                     * scrubs from preview to preview. Leaving the row keeps
                     * it up — a click elsewhere closes it (see above). A
                     * pinned film ignores the pointer so a stray pass never
                     * swaps what someone is watching.
                     */
                    onMouseEnter={() => {
                      if (open === null) setHover(i);
                    }}
                    onClick={() => setOpen(i)}
                    /*
                     * The site's row interaction: the fill wipes across the
                     * whole row — title and year both — the labels slide +10px,
                     * and `is-active` holds that state on the film showing.
                     */
                    /*
                     * pr is the +10px the labels slide on hover plus 10px of
                     * air, so the year still sits clear inside the fill after
                     * the slide instead of landing on its edge.
                     */
                    className={`footer_hover_row flex w-full cursor-pointer items-baseline justify-between gap-10 py-3.5 pl-2.5 pr-5 text-left ${
                      shown === i ? "is-active" : ""
                    }`}
                  >
                    <span className="footer_hover_label whitespace-nowrap text-[16px] font-medium leading-[1.3] tracking-[-0.02em]">
                      {entry.short ?? entry.title}
                    </span>
                    <span className="footer_hover_label shrink-0 text-[14px] font-medium text-muted">
                      {entry.year}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Identity — right column, sticky for the viewport height and
             vertically centred, holding still while the list scrolls. ── */}
        {/* col-start-6: the lede's left edge lands on the same grid line the
            header's nav links start from. */}
        {/* min-h-[60svh]: on a phone the lede owns the first 60% of the
            viewport (centred within it), so the list below starts at the 60%
            line. md trades it for the full-height sticky box. */}
        <div className="order-first col-span-12 flex min-h-[60svh] flex-col items-start justify-center gap-8 pt-28 md:order-0 md:row-start-1 md:col-start-6 md:col-span-5 md:sticky md:top-0 md:h-svh md:pt-0">
          <p className="di-lede text-lede font-semibold">
            I am a documentary filmmaker at{" "}
            <a href={CHANNEL.url} target="_blank" rel="noopener noreferrer" className="link-wipe">
              {CHANNEL.name}
            </a>{" "}
            — a growing archive of the crafts, rituals, festivals and living traditions of India,
            researched, directed and filmed with my team — and the founder of{" "}
            <a
              href={BSF_CHANNEL.url}
              target="_blank"
              rel="noopener noreferrer"
              className="link-wipe"
            >
              {BSF_CHANNEL.name}
            </a>
            , real and inspiring stories told one film at a time.
          </p>
        </div>
      </div>

      {/* ── The player — centred over the blurred page on the film's own
           ratio. Hover mode lets every pointer event fall through, so the
           row underneath keeps its hover and the preview can follow the
           cursor; pinned mode turns the scrim and ✕ back on. ──────── */}
      {film &&
        createPortal(
          <div
            ref={overlay}
            role="dialog"
            aria-modal={pinned}
            aria-label={film.title}
            className={`fixed inset-0 z-[1200] ${pinned ? "" : "pointer-events-none"}`}
          >
            {/* Hover mode draws no scrim, and on md the frame centres in the
                half right of the list — the list itself stays crisp and
                scrubbable. Pinning dims the whole page and recentres. */}
            {pinned && (
              <button
                type="button"
                aria-label="Close player"
                onClick={close}
                className="absolute inset-0 cursor-pointer bg-background/85 backdrop-blur-sm"
              />
            )}

            {/* The hover float zone starts exactly at the list's right edge
                (3 columns + their gutters + the page margin ≈ 25vw + 24px,
                plus a little air), so the preview can never cover a row. */}
            <div
              className={`pointer-events-none absolute inset-0 flex items-center justify-center ${
                pinned ? "" : "md:pl-[calc(25vw+40px)]"
              }`}
            >
              {/* The width lives in a variable so the breakpoints can disagree:
                  pinned on a phone takes the full viewport width (the tap that
                  pins is the only interaction there), md+ keeps the capped
                  stage size. */}
              <div
                data-player-frame
                className={`relative bg-black ${
                  pinned ? "pointer-events-auto w-screen md:w-(--frame-w)" : "w-(--frame-w)"
                }`}
                style={
                  {
                    aspectRatio: `${aw} / ${ah}`,
                    "--frame-w": pinned
                      ? `min(80vw, calc(81svh * ${aw} / ${ah}))`
                      : `min(52vw, calc(74svh * ${aw} / ${ah}))`,
                  } as React.CSSProperties
                }
              >
                {/* One player for both tiers, loaded muted (a hover is not a
                    gesture, so muted is all autoplay allows — the reference's
                    videos are muted too). Pinning unmutes it in place via the
                    effect above, so hover rolls into sound seamlessly. */}
                {/* YouTube refuses to configure the player without a Referer
                    (error 153, "video player configuration error") — mobile
                    browsers strip it under their stricter privacy defaults
                    unless the policy is declared on the iframe itself. The
                    origin param is likewise required alongside enablejsapi. */}
                <iframe
                  key={film.id}
                  ref={player}
                  src={`https://www.youtube-nocookie.com/embed/${film.id}?autoplay=1&mute=1&rel=0&playsinline=1&enablejsapi=1&loop=1&playlist=${film.id}&origin=${encodeURIComponent(window.location.origin)}`}
                  title={film.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-0"
                />
                {/* Close sits above the frame's corner on md+; on a phone it
                    moves to the bottom of the screen (below), where the thumb
                    already is. */}
                {pinned && (
                  <button
                    type="button"
                    onClick={close}
                    className="absolute right-0 top-0 hidden -translate-y-[calc(100%+10px)] cursor-pointer bg-background px-3 py-1.5 text-[12px] font-medium tracking-[-0.02em] transition-colors hover:bg-chip md:block"
                  >
                    Close
                  </button>
                )}

                {/* Phone caption: the title right under the video rather than
                    at the screen's foot. */}
                {pinned && (
                  <p className="absolute inset-x-0 top-full mt-3 text-center text-[13px] font-medium md:hidden">
                    {film.title} &middot; {film.channel.name}
                  </p>
                )}
              </div>
            </div>

            {/* The phone's Close, centred along the bottom edge. */}
            {pinned && (
              <div className="fixed inset-x-0 bottom-0 flex justify-center pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] md:hidden">
                <button
                  type="button"
                  onClick={close}
                  className="cursor-pointer bg-background px-5 py-2.5 text-[13px] font-medium tracking-[-0.02em] transition-colors hover:bg-chip"
                >
                  Close
                </button>
              </div>
            )}

            <div className="pointer-events-none fixed inset-x-0 bottom-0 hidden items-center justify-center pb-6 text-[13px] font-medium md:flex">
              {film.title} &middot; {film.channel.name}
            </div>
          </div>,
          document.body,
        )}
    </main>
  );
}
