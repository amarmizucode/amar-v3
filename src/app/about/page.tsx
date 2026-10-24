import type { Metadata } from "next";
import { AboutHero } from "@/components/AboutHero";
import { JourneyRail, type Chapter } from "@/components/JourneyRail";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Reveal } from "@/components/Reveal";
import { SectionLabel } from "@/components/SectionLabel";
import { HighlightText } from "@/components/HighlightText";
import { MediaFrame } from "@/components/MediaFrame";
import { CtaPill } from "@/components/CtaPill";
import { CornerArrow } from "@/components/Arrows";
import { SiteFooter } from "@/components/SiteFooter";
import { InNumbers, Recognition } from "@/components/Highlights";
import { MEDIA } from "@/lib/media";
import { BOOKS } from "@/lib/books";
import { assetUrl } from "@/lib/assetUrl";

export const metadata: Metadata = {
  title: "About — Amar Ramesh",
  description:
    "Engineer turned storyteller. Founder of Studio A, Big Short Films, Mara Labs and the Kanavu Fellowship — over seven hundred and fifty weddings across twenty-two countries, a thousand temples documented, and eight books.",
};

/*
 * The journey, told as five chapters that ride a pinned horizontal track on
 * desktop (JourneyRail) and stack vertically everywhere else.
 */
const CHAPTERS: Chapter[] = [
  {
    kicker: "Seattle — 2004",
    title: "The first camera",
    blurb:
      "A master's in electronics and computer science, a software career in the United States — and a camera bought in 2004 to record weekend travels. Apprenticeships with award-winning photographers in the Pacific Northwest turned the hobby into a craft.",
    image: MEDIA.services[4],
  },
  {
    kicker: "Chennai — 2010",
    title: "The return",
    blurb:
      "A one-way ticket home in 2010. The software career stayed behind; the temples of Tamil Nadu became the first body of work — the Land of Temples project that set the course for everything after.",
    image: MEDIA.work4,
  },
  {
    kicker: "Studio A",
    title: "The studio",
    blurb:
      "What began as one man with a camera is now a team of twenty-five and one of India's most sought-after wedding studios — over seven hundred and fifty weddings across twenty-two countries.",
    image: MEDIA.venture1,
  },
  {
    kicker: "The wider frame",
    title: "Films & books",
    blurb:
      "Documentary film through Big Short Films — Jamakkaalam led to the Centre for Weavers — and publishing through Mara Labs: pictorial monographs on the temples, portals and people of South India.",
    image: MEDIA.venture3,
  },
  {
    kicker: "Giving back",
    title: "Kanavu",
    blurb:
      "A year-long fellowship run with the Chennai Photo Biennale, training women photographers and filmmakers from small Tamil Nadu towns — photography, lighting, storytelling, editing and the business of both.",
    image: MEDIA.venture4,
  },
];

export default function About() {
  return (
    <SmoothScroll>
      <main className="flex-1">
        {/* ── Hero — display staircase with photographs set into the type. */}
        <AboutHero />

        {/* ── Portrait + statements — portrait and roles keep to one quiet
             column on the left; the statements take the frame from col 5 with
             a full gutter column of air between, and section-scale gaps so the
             three paragraphs read as beats rather than a wall. */}
        <section
          className="shell"
          style={{
            paddingTop: "var(--section-space-small)",
            paddingBottom: "var(--section-space-large)",
          }}
        >
          <div className="grid-12 gap-y-14">
            <Reveal className="col-span-12">
              <SectionLabel>The short version</SectionLabel>
            </Reveal>

            <Reveal className="col-span-8 sm:col-span-6 md:col-span-3">
              <MediaFrame
                ratio="4 / 5"
                src={assetUrl("/assets/amar-ramesh.jpg")}
                parallax={14}
              />
              <p className="mt-4 text-[13px] font-medium text-muted">
                Photographer · Filmmaker · Author &amp; Mentor
              </p>
            </Reveal>

            <div className="col-span-12 flex flex-col gap-12 md:col-start-5 md:col-span-7 md:gap-20">
              <HighlightText className="text-statement font-semibold">
                I grew up in Chennai, studied engineering, and spent years writing software in the
                United States — until a camera, bought to record weekend travels, quietly took over.
              </HighlightText>
              <HighlightText className="text-statement font-semibold">
                In 2010 I came home with a one-way ticket and began photographing the temples I grew
                up around. That project became Studio A, and Studio A became a way of telling
                stories — of couples, weavers, musicians, dancers and the living culture of South
                India.
              </HighlightText>
              <HighlightText className="text-statement font-semibold">
                Today that work spans photography, documentary film, publishing and mentorship. The
                medium changes. The job does not: find the story, and give it a form people can
                see, feel and remember.
              </HighlightText>
            </div>
          </div>
        </section>

        {/* ── The journey — pinned horizontal ride through five chapters. ── */}
        <div className="pb-20 md:pb-28">
          <JourneyRail chapters={CHAPTERS} />
        </div>

        {/* ── In numbers ─────────────────────────────────────────── */}
        <InNumbers />

        {/* ── Books — the full Mara Labs catalogue; every row leads to the
             shelf, with the site's inverting row interaction marking the way. */}
        <section className="shell pb-20 md:pb-28">
          <div className="grid-12 gap-y-12">
            <Reveal className="col-span-12 md:col-span-3">
              <SectionLabel>Books</SectionLabel>
              <p className="mt-6 max-w-[30ch] text-[15px] leading-[1.55] text-muted">
                Eight pictorial monographs, written and photographed by Amar, published through
                Mara Labs.
              </p>
              <a
                href="/books"
                className="link-wipe mt-5 flex w-fit items-center gap-[0.3em] text-[13px] font-medium"
              >
                Browse the shelf
                <CornerArrow className="w-[0.8em]" />
              </a>
            </Reveal>

            <div className="col-span-12 md:col-start-6 md:col-span-7">
              {BOOKS.map((book) => (
                <a
                  key={book.slug}
                  href="/books"
                  aria-label={`${book.title} — browse the books shelf`}
                  className="footer_hover_row grid grid-cols-12 gap-y-2 border-b border-rule py-6 first:border-t"
                >
                  <span className="footer_hover_label col-span-11 sm:col-span-2 text-[13px] font-medium text-muted">
                    {book.index}/{String(BOOKS.length).padStart(2, "0")}
                  </span>
                  <h3 className="footer_hover_label col-span-12 sm:col-span-4 text-[19px] font-semibold tracking-[-0.03em]">
                    {book.title}
                  </h3>
                  <p className="footer_hover_label col-span-12 sm:col-start-7 sm:col-span-5 text-[15px] leading-[1.55] text-muted">
                    {book.blurb}
                  </p>
                  <span className="footer_hover_marker col-start-12 col-span-1 row-start-1 flex items-center justify-end self-center sm:row-start-auto">
                    <CornerArrow className="w-[14px]" />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ── Recognition — the honours as laurel wreaths, and the press. ─── */}
        <Recognition />

        {/* ── Closing ────────────────────────────────────────────── */}
        <section className="shell pb-24 md:pb-36">
          <div className="grid-12">
            <div className="col-span-12 md:col-start-4 md:col-span-6 flex flex-col items-center gap-10 text-center">
              <HighlightText className="text-lede font-semibold max-w-[600px]">
                If you have built something worth talking about — a culture worth preserving, an
                idea worth sharing — I would love to hear the story behind it.
              </HighlightText>
              <CtaPill label="Tell me your story" href="mailto:hello@amarramesh.com" />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </SmoothScroll>
  );
}
