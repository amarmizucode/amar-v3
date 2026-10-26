"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap, DUR } from "@/lib/gsap";
import { Preloader } from "@/components/Preloader";
import { preloadRoute } from "@/lib/preloadRoute";

const ReadyContext = createContext(false);

/**
 * True once the page is on show: after the preloader on the first load, and
 * after the curtain lifts on every navigation. Intros key off this so they
 * never play behind a cover.
 */
export const usePageReady = () => useContext(ReadyContext);

/** If the route has not mounted by then, lift the curtain anyway. */
const STUCK_MS = 4000;

/**
 * How long the curtain will wait on the next route's images before revealing
 * anyway.
 *
 * The strips take ~0.5s to close and the fetch starts as they begin, so the
 * transition already absorbs most of this; only the remainder is a real wait.
 * Measured against the bucket, a gallery's opening thumbs land in roughly a
 * second over a warm connection, so this is set just past that — far enough
 * to be useful, short enough that a slow network shortens the wait rather
 * than stalling behind a covered page.
 */
const PRELOAD_MS = 1200;

/**
 * The curtain is up to twelve strips on the page grid, one per column; CSS
 * hides strips as the grid's guide count steps down on smaller screens.
 */
const STRIPS = 12;
/*
 * The striped wipe between pages is hidden for now. Everything the curtain
 * does besides paint stays: it still gates `ready`, warms the next route's
 * images, scrolls to the top and honours a hash. `strips()` simply returns
 * nothing, so the GSAP timelines run empty and their onStart/onComplete
 * callbacks fire on schedule — which is what keeps navigation working.
 * Flip back to false to restore the wipe.
 */
const CURTAIN_HIDDEN = true;

/** Total spread of the stagger across the strips, left to right. */
const SWEEP = 0.385;

/**
 * Route transitions, owned by the root layout.
 *
 * Every click on an internal link is intercepted in the capture phase — Next
 * `Link` and plain anchors alike — and turned into: the curtain's strips
 * sweep up over the page one column at a time, the route is pushed, and when
 * the new pathname mounts they retract off it in the same order. Back/forward
 * cannot be intercepted, so those get the retract only. Same-page hash links
 * are left alone.
 *
 * The preloader lives here too, so it plays once per visit — on whichever
 * page is loaded first — and never on a client-side navigation.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const curtain = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  // Curtain is down and a route is on its way.
  const busy = useRef(false);
  const pendingHref = useRef<string | null>(null);
  const lastPath = useRef(pathname);
  const stuckTimer = useRef(0);
  /* The in-flight image warm for the route being navigated to, so the reveal
   * can wait on it. Already resolved (or absent) means reveal immediately. */
  const warming = useRef<Promise<void> | null>(null);

  // Only the strips the current breakpoint shows; the stagger spreads the
  // same sweep time over however many there are.
  const strips = () =>
    gsap.utils
      .toArray<HTMLElement>(".pt-strip", curtain.current)
      .filter((el) => getComputedStyle(el).display !== "none");
  const stagger = (count: number) => (count > 1 ? SWEEP / (count - 1) : 0);

  // Strips collapsed until needed; hidden until hydrated so the server markup
  // never flashes a full-screen panel.
  useLayoutEffect(() => {
    if (CURTAIN_HIDDEN) return;
    gsap.set(strips(), { scaleY: 0, transformOrigin: "50% 100%" });
    gsap.set(curtain.current, { autoAlpha: 1 });
  }, []);

  const runReveal = useCallback((hash?: string) => {
    if (!curtain.current) return;
    window.clearTimeout(stuckTimer.current);
    window.scrollTo(0, 0);
    if (hash) {
      requestAnimationFrame(() => document.querySelector(hash)?.scrollIntoView());
    }
    if (CURTAIN_HIDDEN) {
      // No wipe to play, so release the page and finish on the next frame.
      setReady(true);
      requestAnimationFrame(() => {
        busy.current = false;
      });
      return;
    }

    const els = strips();
    gsap
      .timeline()
      // Retract upward, left to right.
      .set(els, { transformOrigin: "50% 0%" })
      .to(els, {
        scaleY: 0,
        duration: DUR.normal,
        ease: "ease-transition",
        stagger: stagger(els.length),
        // Release the page as the curtain starts to clear, so its intro
        // plays through the lift rather than after it.
        onStart: () => setReady(true),
      })
      .add(() => {
        busy.current = false;
      });
  }, []);

  /*
   * Reveal once the next page's images are warm. `preloadRoute` caps its own
   * wait, so this can only ever hold the curtain for that budget — and the
   * stuck timer is still armed underneath as the final guarantee.
   */
  const reveal = useCallback(
    (hash?: string) => {
      const pending = warming.current;
      warming.current = null;
      if (!pending) {
        runReveal(hash);
        return;
      }
      pending.then(() => runReveal(hash));
    },
    [runReveal],
  );

  const navigate = useCallback(
    (href: string) => {
      if (busy.current) return;
      busy.current = true;
      pendingHref.current = href;
      setReady(false);
      // Start fetching the destination's images now rather than after the
      // strips land, so the wipe and the network run concurrently.
      warming.current = preloadRoute(
        new URL(href, window.location.href).pathname,
        PRELOAD_MS,
      );

      const push = () => {
          router.push(href);
          // The last-resort lift bypasses the image wait: whatever has not
          // arrived by now is not worth holding a covered page for.
          stuckTimer.current = window.setTimeout(() => {
            warming.current = null;
            runReveal();
          }, STUCK_MS);
      };

      if (CURTAIN_HIDDEN) {
        // Straight to the route; the reveal effect below handles the rest.
        push();
        return;
      }

      const els = strips();
      gsap
        .timeline()
        // Grow up from the bottom, left to right.
        .set(els, { scaleY: 0, transformOrigin: "50% 100%" })
        .to(els, { scaleY: 1, duration: 0.5, ease: "ease-menu", stagger: stagger(els.length) })
        .add(push);
    },
    [router, runReveal],
  );

  // The route changed: lift the curtain off the new page.
  useEffect(() => {
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;
    const href = pendingHref.current;
    pendingHref.current = null;
    const hash = href && href.includes("#") ? href.slice(href.indexOf("#")) : undefined;
    if (!busy.current) {
      // Back/forward: nothing covered the page, so cover it now and lift.
      busy.current = true;
      setReady(false);
      if (!CURTAIN_HIDDEN) gsap.set(strips(), { scaleY: 1 });
    }
    reveal(hash);
  }, [pathname, reveal]);

  // Intercept internal navigation.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const anchor = (event.target as Element).closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      // Same page: a hash or in-page link, handled by the page itself.
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      event.preventDefault();
      event.stopPropagation();
      navigate(url.pathname + url.search + url.hash);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [navigate]);

  return (
    <ReadyContext.Provider value={ready}>
      <Preloader onDone={() => setReady(true)} />
      {children}
      {/* While CURTAIN_HIDDEN, the strips are not rendered at all: left in
          the tree they sit at their default scaleY and would show the moment
          anything made the container visible. */}
      {!CURTAIN_HIDDEN && (
        <div ref={curtain} aria-hidden className="pt-curtain" style={{ visibility: "hidden" }}>
          {Array.from({ length: STRIPS }, (_, i) => (
            <span key={i} className="pt-strip" />
          ))}
        </div>
      )}
    </ReadyContext.Provider>
  );
}
