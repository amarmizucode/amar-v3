import type { Metadata } from "next";
import Image from "next/image";
import { AboutHero } from "@/components/AboutHero";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Reveal } from "@/components/Reveal";
import { SectionLabel } from "@/components/SectionLabel";
import { HighlightText } from "@/components/HighlightText";
import { MediaFrame } from "@/components/MediaFrame";
import { CtaPill } from "@/components/CtaPill";
import { SiteFooter } from "@/components/SiteFooter";
import { MEDIA } from "@/lib/media";
import { assetUrl } from "@/lib/assetUrl";

export const metadata: Metadata = {
  title: "About — Amar Ramesh",
  description:
    "Engineer turned storyteller. Founder of Studio A, Big Short Films, Mara Labs and the Kanavu Fellowship — over seven hundred and fifty weddings across twenty-two countries, a thousand temples documented, and seven books.",
};

/*
 * The journey, told as numbered chapters rather than a dated timeline — the
 * same kicker / title / blurb rhythm as the home page's Notable Ventures rows.
 */
const CHAPTERS = [
  {
    kicker: "01. Seattle",
    title: "The first camera",
    blurb:
      "A master's in electronics and computer science, a software career in the United States — and a camera bought in 2004 to record weekend travels. Apprenticeships with award-winning photographers in the Pacific Northwest turned the hobby into a craft.",
    image: MEDIA.services[4],
  },
  {
    kicker: "02. Chennai",
    title: "The return",
    blurb:
      "A one-way ticket home in 2010. The software career stayed behind; the temples of Tamil Nadu became the first body of work — the Land of Temples project that set the course for everything after.",
    image: MEDIA.work4,
  },
  {
    kicker: "03. Studio A",
    title: "The studio",
    blurb:
      "What began as one man with a camera is now a team of twenty-five and one of India's most sought-after wedding studios — over seven hundred and fifty weddings across twenty-two countries.",
    image: MEDIA.venture1,
  },
  {
    kicker: "04. The wider frame",
    title: "Films & books",
    blurb:
      "Documentary film through Big Short Films — Jamakkaalam led to the Centre for Weavers — and publishing through Mara Labs: pictorial monographs on the temples, portals and people of South India.",
    image: MEDIA.venture3,
  },
  {
    kicker: "05. Giving back",
    title: "Kanavu",
    blurb:
      "A year-long fellowship run with the Chennai Photo Biennale, training women photographers and filmmakers from small Tamil Nadu towns — photography, lighting, storytelling, editing and the business of both.",
    image: MEDIA.venture4,
  },
];

const NUMBERS = [
  { stat: "750+", label: "weddings photographed" },
  { stat: "22", label: "countries worked in" },
  { stat: "1,000+", label: "temples documented" },
  { stat: "7", label: "books written & photographed" },
];

const BOOKS = [
  {
    index: "01/07",
    title: "Stones & Stories",
    blurb: "A photo journey through the timeless Kanchi Kailasanathar temple, a Pallava marvel.",
  },
  {
    index: "02/07",
    title: "Mogappu — Portals of Chettinad",
    blurb: "The ornamental doorways of Chettinad's mansions, documented before they disappear.",
  },
  {
    index: "03/07",
    title: "Madras Margazhi",
    blurb: "Carnatic musicians photographed against the iconic backdrops of their own city.",
  },
  {
    index: "04/07",
    title: "50 Inspiring Women",
    blurb: "Portraits and stories of fifty women shaping Tamil Nadu on their own terms.",
  },
];

const RECOGNITION = [
  "Fearless Photographers Award",
  "WPPI honours",
  "TEDx — Life Through the Lens",
  "Featured in The Hindu, Reader's Digest, DestinAsian and Wedding Vows",
];

export default function About() {
  return (
    <SmoothScroll>
      <main className="flex-1">
        {/* ── Hero — home-page geometry: ledes mid-frame, display
             type at the bottom of a full viewport. */}
        <AboutHero />

        {/* ── Portrait + statements — same split as the home page's
             about section: image cols 1-3, roles 4-5, copy from 6. */}
        <section
          className="shell"
          style={{
            paddingTop: "var(--section-space-small)",
            paddingBottom: "var(--section-space-large)",
          }}
        >
          <div className="grid-12 gap-y-10">
            <Reveal className="col-span-6 md:col-span-3">
              <Image
                src={assetUrl("/assets/amar-ramesh.jpg")}
                alt="Amar Ramesh"
                width={313}
                height={313}
                sizes="(max-width: 768px) 50vw, 313px"
                className="w-full max-w-[313px] aspect-square object-cover object-top bg-foreground"
              />
            </Reveal>

            <Reveal className="col-span-6 md:col-start-4 md:col-span-2" delay={80}>
              <ul className="text-[16px] leading-[1.25] font-medium">
                <li>Photographer</li>
                <li>Filmmaker</li>
                <li>Author &amp; Mentor</li>
              </ul>
            </Reveal>

            <div className="col-span-12 md:col-start-6 md:col-span-6 flex flex-col gap-6">
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

        {/* ── The journey ────────────────────────────────────────── */}
        <section className="shell pb-20 md:pb-28">
          <Reveal>
            <SectionLabel>The journey</SectionLabel>
          </Reveal>

          <div className="mt-16 border-t border-rule">
            {CHAPTERS.map((chapter) => (
              <div
                key={chapter.title}
                className="grid-12 gap-y-6 border-b border-rule bg-background pb-8"
              >
                <p className="col-span-12 pt-8 md:col-span-2 text-[13px] font-medium text-muted">
                  {chapter.kicker}
                </p>
                <div className="col-span-12 pt-8 md:col-start-3 md:col-span-3 flex flex-col gap-2">
                  <h3 className="text-[19px] font-semibold tracking-[-0.03em]">{chapter.title}</h3>
                  <p className="text-[15px] leading-[1.55] text-muted max-w-[38ch]">
                    {chapter.blurb}
                  </p>
                </div>
                <div className="col-span-12 md:col-start-7 md:col-span-6">
                  <MediaFrame ratio="722 / 415" src={chapter.image} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── In numbers ─────────────────────────────────────────── */}
        <section className="shell pb-20 md:pb-28">
          <div className="grid-12 gap-y-12">
            <Reveal className="col-span-12 md:col-span-3">
              <SectionLabel>In numbers</SectionLabel>
            </Reveal>

            <div className="col-span-12 md:col-start-6 md:col-span-7 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-8">
              {NUMBERS.map((item, i) => (
                <Reveal key={item.label} delay={i * 60}>
                  <span className="inline-block bg-chip px-3 py-1.5 text-[22px] font-semibold tracking-[-0.03em]">
                    {item.stat}
                  </span>
                  <p className="pt-3 text-[15px] font-medium">{item.label}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Books ──────────────────────────────────────────────── */}
        <section className="shell pb-20 md:pb-28">
          <div className="grid-12 gap-y-12">
            <Reveal className="col-span-12 md:col-span-3">
              <SectionLabel>Books</SectionLabel>
            </Reveal>

            <div className="col-span-12 md:col-start-6 md:col-span-7">
              {BOOKS.map((book) => (
                <div
                  key={book.title}
                  className="grid grid-cols-12 gap-y-2 border-b border-rule py-6 first:border-t"
                >
                  <span className="col-span-12 sm:col-span-2 text-[13px] font-medium text-muted">
                    {book.index}
                  </span>
                  <h3 className="col-span-12 sm:col-span-4 text-[19px] font-semibold tracking-[-0.03em]">
                    {book.title}
                  </h3>
                  <p className="col-span-12 sm:col-start-7 sm:col-span-6 text-[15px] leading-[1.55] text-muted">
                    {book.blurb}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Recognition ────────────────────────────────────────── */}
        <section className="shell pb-24 md:pb-36">
          <div className="grid-12 gap-y-12">
            <Reveal className="col-span-12 md:col-span-3">
              <SectionLabel>Recognition</SectionLabel>
            </Reveal>

            <ul className="col-span-12 md:col-start-6 md:col-span-7 flex flex-col">
              {RECOGNITION.map((item) => (
                <li
                  key={item}
                  className="border-b border-rule py-5 text-[17px] font-semibold tracking-[-0.03em] first:border-t"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

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
