import { GALLERIES } from "@/lib/photography";
import { BOOKS } from "@/lib/books";

/**
 * Warm the images a route opens on, while the curtain is down.
 *
 * The photography now comes from R2 rather than `public/`, so a navigation
 * that used to hit local disk is a network round trip. The curtain covers the
 * page for about half a second on the way in — this spends that time fetching
 * what the next page paints first, so it arrives on frames that are already
 * decoded rather than on empty boxes that fill in afterwards.
 *
 * Only the first screenful is warmed. The gallery routes build hundreds of
 * tiles, and requesting all of them would saturate the connection and starve
 * the handful that are actually about to be visible.
 */

/** Tiles visible on the gallery canvas before any panning. */
const GALLERY_LEAD = 12;
/** Covers either side of the carousel's active slide. */
const INDEX_LEAD = 6;

/** Resolves once the image is fetched and decoded, or immediately on failure. */
function warm(url: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    // `decode()` keeps the main thread from doing that work during the reveal,
    // but it rejects on a decode error, so failures fall through to resolve.
    img.onload = () => (img.decode?.() ?? Promise.resolve()).then(() => resolve(), () => resolve());
    img.onerror = () => resolve();
    img.src = url;
  });
}

/** The images a path paints first, most important first. */
function imagesFor(pathname: string): string[] {
  // A gallery: /photography/<slug>
  const match = /^\/photography\/([^/]+)\/?$/.exec(pathname);
  if (match) {
    const gallery = GALLERIES.find((g) => g.slug === match[1]);
    if (!gallery) return [];
    // The canvas opens on the first frame at full size over its own thumb, so
    // that one frame is worth more than the tiles around it.
    const [first] = gallery.frames;
    return [
      ...(first ? [first.thumb, first.src] : []),
      ...gallery.frames.slice(0, GALLERY_LEAD).map((f) => f.thumb),
    ];
  }

  // The index: the carousel's covers, starting from the first slide.
  if (/^\/photography\/?$/.test(pathname)) {
    return GALLERIES.slice(0, INDEX_LEAD).map((g) => g.cover);
  }

  // The bookshelf: every spine strip paints at rest, and the first volume
  // stands open on its cover art. These are local `public/` files, but
  // warming them still means the shelf reveals decoded rather than stalling.
  if (/^\/books\/?$/.test(pathname)) {
    return [
      ...BOOKS.map((b) => b.art.spine),
      ...BOOKS.slice(0, 2).map((b) => b.art.cover),
    ];
  }

  // /documentary is a text-only filmography — nothing to warm.

  return [];
}

/**
 * Fetch a route's opening images, resolving when they are ready or when
 * `budgetMs` runs out — whichever comes first.
 *
 * The budget matters more than completeness: a slow connection must not hold
 * the curtain down indefinitely, so the reveal proceeds regardless and the
 * stragglers simply arrive as they land.
 */
export function preloadRoute(pathname: string, budgetMs: number): Promise<void> {
  const urls = imagesFor(pathname);
  if (!urls.length) return Promise.resolve();
  return Promise.race([
    Promise.all(urls.map(warm)).then(() => undefined),
    new Promise<void>((resolve) => window.setTimeout(resolve, budgetMs)),
  ]);
}
