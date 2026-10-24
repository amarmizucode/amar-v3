import { CtaPill } from "@/components/CtaPill";
import { FilmCarousel } from "@/components/FilmCarousel";
import { MediaFrame } from "@/components/MediaFrame";
import { PhotoCarousel } from "@/components/PhotoCarousel";
import { Reveal } from "@/components/Reveal";
import { SectionLabel } from "@/components/SectionLabel";
import { BSF_FILMS, CHANNEL, FILMS, thumbUrl } from "@/lib/documentary";
import { GALLERIES } from "@/lib/photography";
import { BOOKS } from "@/lib/books";

/**
 * The home page's three bodies of work — documentary, photography and books —
 * each a preview leading to its own page, and each set in its own shape so
 * the run of three reads as three kinds of work rather than one grid thrice:
 *
 *  - Documentary is a cinema strip: every film's thumbnail in a horizontal
 *    carousel that ends on a "view all" card.
 *  - Photography is the same carousel with gallery covers.
 *  - Books is the shelf: a single header row, then every book in one row.
 *
 * Server components on purpose: the gallery manifest alone is ~100KB, and
 * reading it here keeps it on the server; only the tiles shown reach the
 * browser. Internal links are plain anchors so the route curtain's
 * document-level click handler picks them up like the header links.
 */

export function DocumentarySection() {
  // Only what a card and its player show crosses to the client — no blurbs.
  const films = FILMS.map((f) => ({
    id: f.id,
    title: f.title,
    duration: f.duration,
    year: f.year,
    thumb: thumbUrl(f.id),
    aspect: f.aspect,
    channel: CHANNEL.name,
  }));

  return (
    // The carousel places its own header and track: the track bleeds past
    // the shell, so the section itself carries no shell padding.
    <section id="documentary" className="pb-20 md:pb-28">
      {/* The strip shows Culture of India; the count is everything the
          documentary page lists, Big Short Films included. */}
      <FilmCarousel films={films} total={FILMS.length + BSF_FILMS.length} />
    </section>
  );
}

export function PhotographySection() {
  // Only what a card shows crosses to the client carousel.
  const galleries = GALLERIES.map((g) => ({
    slug: g.slug,
    title: g.title,
    cover: g.cover,
    count: g.frames.length,
  }));
  return (
    // The carousel places its own header and track: the track bleeds past
    // the shell, so the section itself carries no shell padding.
    <section id="photography" className="pb-20 md:pb-28">
      <PhotoCarousel galleries={galleries} total={GALLERIES.length} />
    </section>
  );
}

/** `className` sets the vertical spacing, so a page can drop the top padding
 * where the section before it already supplies the gap. */
export function BooksSection({ className = "py-20 md:py-28" }: { className?: string }) {
  return (
    <section id="books" className={`shell ${className}`}>
      {/* One header row across the measure — the label on the left and the
          way to the shelf on the right — so the books themselves get the full
          width. */}
      <Reveal className="grid-12 items-end gap-y-6">
        <div className="col-span-12 md:col-span-6">
          <SectionLabel>Books</SectionLabel>
        </div>
        <div className="col-span-12 md:col-start-10 md:col-span-3 md:justify-self-end">
          <CtaPill label="Browse the shelf" href="/books" />
        </div>
      </Reveal>

      {/* The whole shelf: every book in a single row on a wide screen, two
          rows of four on a tablet, pairs on a phone (four across there leaves
          covers under 80px). Product shots of the books themselves, so no
          drift — the whole object stays in frame. */}
      <Reveal className="mt-8 md:mt-10">
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 lg:grid-cols-8 lg:gap-x-5">
          {BOOKS.map((book) => (
            <a key={book.slug} href="/books" className="group/book flex flex-col gap-2">
              <MediaFrame ratio="1 / 1" src={book.cover} parallax={0} />
              <p className="text-[13px] font-semibold leading-[1.3] tracking-[-0.02em] transition-opacity duration-300 group-hover/book:opacity-60">
                {book.title}
              </p>
            </a>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
