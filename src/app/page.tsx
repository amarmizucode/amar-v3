import { HomeHero } from "@/components/HomeHero";
import { DocumentarySection, PhotographySection, BooksSection } from "@/components/HomeWork";
import { VenturesAccordion } from "@/components/VenturesAccordion";
import { InNumbers, Recognition } from "@/components/Highlights";
import { HighlightText } from "@/components/HighlightText";
import { Services } from "@/components/Services";
import { Testimonials } from "@/components/Testimonials";
import { Reveal } from "@/components/Reveal";
import { MediaFrame } from "@/components/MediaFrame";
import { Faq } from "@/components/Faq";
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- GapSection is hidden for now, not removed.
import { GapSection } from "@/components/GapSection";
import { SmoothScroll } from "@/components/SmoothScroll";
import { CornerArrow } from "@/components/Arrows";
import { ClosingCta } from "@/components/ClosingCta";
import { CtaPill } from "@/components/CtaPill";
import { SectionLabel } from "@/components/SectionLabel";
import { SiteFooter } from "@/components/SiteFooter";
import { MEDIA } from "@/lib/media";
import { assetUrl } from "@/lib/assetUrl";
import { BSF_CHANNEL, thumbUrl } from "@/lib/documentary";

const WORKS = [
  {
    index: "01/40",
    title: "Culture of India",
    blurb: "Documenting the people, traditions and crafts keeping India's living culture alive.",
    stat: "500+",
    statLabel: "stories & cultural records",
    image: MEDIA.work1,
  },
  {
    index: "02/40",
    title: "Inspiring Women",
    blurb: "Stories of women whose journeys, courage and work create impact around them.",
    stat: "150+",
    statLabel: "Stories documented",
    image: MEDIA.work2,
  },
  {
    index: "03/40",
    title: "The Chettinad Project",
    blurb: "Exploring the architecture, craft, people and visual heritage of Chettinad.",
    stat: "XX+",
    statLabel: "locations documented",
    image: MEDIA.work3,
  },
  {
    index: "04/40",
    title: "Temples of India",
    blurb: "Documenting India's temples, architecture, traditions and the people who keep them alive.",
    stat: "1,000+",
    statLabel: "temples documented",
    image: MEDIA.work4,
  },
];

/**
 * In list order; the row number comes from the position. Each image is the
 * venture's own work:
 *  - Studio A: a frame from the Weddings gallery, which is the Studio A
 *    archive (served from R2 like the rest of the photography).
 *  - Big Short Films: two men sparring, a frame from the Silambam film —
 *    YouTube's auto-captured still rather than a thumbnail, since the
 *    thumbnails are title cards whose type would fight the venture name
 *    laid over it.
 *  - Mara Labs: an open spread of Aranga, from the books mirror.
 *  - Kanavu Fellowship: the fellows and mentors at the 2024 showcase, from
 *    the Chennai Photo Biennale's Kanavu page.
 *  - MIZU: a portrait on one of its hand-painted backdrops, from
 *    mizubackdrops.com.
 * The last three are downloaded copies under public/assets/ventures/.
 *
 * Links: every venture leads off-site. Big Short Films is Studio A's
 * documentary vertical with no site of its own, so it leads to its YouTube
 * channel, where the films are published. Kanavu leads to
 * its page on the Chennai Photo Biennale Foundation site, which runs it.
 */
const VENTURES = [
  {
    area: "Photography",
    title: "Studio A",
    blurb: "Commercial photography studio. Over seven hundred weddings across twenty-two countries.",
    image: assetUrl("/assets/photography-web/studio-a/11.jpg"),
    href: "https://studioa.amarramesh.com/",
    linkLabel: "studioa.amarramesh.com",
  },
  {
    area: "Film",
    title: "Big Short Films",
    blurb: "Documentary filmmaking. Jamakkaalam led to the Centre for Weavers.",
    image: "/assets/ventures/big-short-films.jpg",
    href: BSF_CHANNEL.url,
    linkLabel: "Watch on YouTube",
  },
  {
    area: "Publishing",
    title: "Mara Labs",
    blurb: "Publishing house. Three pictorial monographs on South Indian heritage.",
    image: "/assets/books/aranga/plate-2.jpg",
    href: "https://maralabs.in/",
    linkLabel: "maralabs.in",
  },
  {
    area: "Mentorship",
    title: "Kanavu Fellowship",
    blurb: "A year-long programme training women photographers from small Tamil Nadu towns.",
    image: "/assets/ventures/kanavu.jpg",
    href: "https://chennaiphotobiennale.foundation/cpbx/projects/kanavu-fellowship",
    linkLabel: "About the fellowship",
  },
  {
    area: "Product",
    title: "MIZU",
    blurb: "Hand-made backdrops for photographers and studios.",
    image: "/assets/ventures/mizu.jpg",
    href: "https://www.mizubackdrops.com/",
    linkLabel: "mizubackdrops.com",
  },
];

/*
 * Brands and institutions Amar has made work for. Ramraj Cotton, Annapoorna
 * Hotels (spelled "Annapurna" in the kit; "Annapoorna" is the group's own
 * spelling), DakshinaChitra and Paramount Textiles are the projects his media
 * kit names for Big Short Films, and it credits his cultural films for Tamil
 * Nadu Tourism; the Chennai Hilton commissioned 60 large-format prints for
 * the hotel (121Clicks interview); Kumaraguru Institutions made the Bhavani
 * Jamakkalam book with him; the Chennai Photo Biennale runs the Kanavu
 * Fellowship with Studio A; KLRF (its foods arm, klrf.in/klrffoods) and Thriveni
 * Earthmovers are clients Amar named himself.
 */
/*
 * Logos are each brand's own, kept under public/assets/brands/. SVG where a
 * vector exists anywhere: Hilton from Wikimedia Commons, Annapoorna from its
 * Wikipedia article, Ramraj from the VectorSeek library (cropped to the
 * mark, its off-canvas text removed), Thriveni from its own site (viewBox
 * cropped to the artwork). The rest are PNGs from the brands' own sites,
 * trimmed to the artwork — DakshinaChitra's included, as its orange mark is
 * the one shown here (the only vector is a black wordmark).
 *
 * `ratio` is the artwork's width ÷ height and `weight` an optical nudge;
 * see brandLogoWidth.
 */
const BRANDS = [
  { name: "Ramraj Cotton", logo: "/assets/brands/ramraj-cotton.svg", ratio: 5.75, weight: 0.92 },
  { name: "Annapoorna Hotels", logo: "/assets/brands/annapoorna-hotels.svg", ratio: 3.876, weight: 1 },
  { name: "Hilton Chennai", logo: "/assets/brands/hilton.svg", ratio: 1.311, weight: 1.05 },
  { name: "Paramount Textiles", logo: "/assets/brands/paramount-textiles.png", ratio: 0.931, weight: 1 },
  { name: "Tamil Nadu Tourism", logo: "/assets/brands/tamil-nadu-tourism.png", ratio: 2.466, weight: 1.05 },
  { name: "DakshinaChitra", logo: "/assets/brands/dakshinachitra.png", ratio: 1, weight: 0.9 },
  { name: "Kumaraguru Institutions", logo: "/assets/brands/kumaraguru.png", ratio: 4.324, weight: 1 },
  { name: "Chennai Photo Biennale", logo: "/assets/brands/chennai-photo-biennale.png", ratio: 1, weight: 0.88 },
  { name: "KLRF", logo: "/assets/brands/klrf.png", ratio: 2.964, weight: 0.95 },
  { name: "Thriveni Earthmovers", logo: "/assets/brands/thriveni.svg", ratio: 5.188, weight: 0.92 },
];

/*
 * Logos sized to one visual weight rather than one box. Filling a fixed box
 * makes wide wordmarks read small and square marks loom, so every logo gets
 * the same area instead — a square mark 72px a side, a wordmark wide and
 * short — and `weight` scales that for density: solid fields (Ramraj's
 * green bar, Thriveni's heavy caps) read heavier than their size, thin
 * linework (Hilton, the Tamil Nadu
 * script) lighter. The side matches the Featured-in press marks
 * (PRESS_LOGO_SIDE in Highlights), so the two logo tables read at one
 * size; the cell's own max-width/height caps guard the widest marks.
 */
const BRAND_LOGO_SIDE = 44;
const brandLogoWidth = (ratio: number, weight: number) =>
  Math.round(BRAND_LOGO_SIDE * weight * Math.sqrt(ratio));


/*
 * Each row's hover image is Amar's own work: a Studio A wedding frame (the
 * ventures card's image), the Kalamkari film's YouTube still, and the open
 * Aranga spread that stands for Mara Labs.
 */
const SERVICES = [
  {
    label: "Photography",
    href: "/photography",
    image: assetUrl("/assets/photography-web/studio-a/11.jpg"),
  },
  { label: "Documentary", href: "/documentary", image: thumbUrl("6c_i4EoUaq4") },
  { label: "Publishing", image: "/assets/books/aranga/plate-2.jpg" },
];

const FAQS = [
  {
    q: "Who do you work with?",
    a: "Founders, institutions and brands building something with cultural weight — organizations that want the story behind the work told properly.",
  },
  {
    q: "What kind of projects do you take on?",
    a: "Photography, documentary film, campaigns and long-form cultural documentation. Projects where the narrative matters as much as the image.",
  },
  {
    q: "Do you work internationally?",
    a: "Yes. Based in Chennai, India and working worldwide — over seven hundred projects across twenty-two countries.",
  },
  {
    q: "Can you work on a project from concept to completion?",
    a: "That is the preferred way to work: research, narrative, production and final delivery handled end to end.",
  },
  {
    q: "Can we collaborate with one of your ventures?",
    a: "Studio A, Big Short Films, Mara Labs, Kanavu Fellowship and MIZU all take on collaborations. Tell me what you have in mind.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Weddings, classical dance, folk art, musicians, storytellers — Amar found the thread that tied all of it together and gave our work a voice we could finally share.",
    name: "K. R. Nagarajan",
    role: "Founder, Ramrajcotton",
    avatar: MEDIA.avatar2,
  },
  {
    quote:
      "He spent three days simply watching the weavers before lifting a camera. What came back was not a shoot — it was our history, told properly for the first time.",
    name: "Lakshmi Venkatesh",
    role: "Director, Kanchi Silk Trust",
    avatar: MEDIA.avatar1,
  },
  {
    quote:
      "We had thirty years of work and nothing that explained it. Amar built the story we now open every conversation with.",
    name: "Dr. S. Raghunathan",
    role: "Trustee, Chettinad Heritage",
    avatar: MEDIA.avatar2,
  },
  {
    quote:
      "The film travelled to four festivals, but the part that mattered was watching the artisans see themselves on screen with that much dignity.",
    name: "Meera Krishnan",
    role: "Programme Lead, Craft Council",
    avatar: MEDIA.avatar1,
  },
  {
    quote:
      "Amar asks the questions nobody thinks to ask. By the end our own team understood the work better than when we started.",
    name: "Arjun Subramanian",
    role: "Co-founder, Maatram Foundation",
    avatar: MEDIA.avatar2,
  },
  {
    quote:
      "Six hundred temples, four years, and a consistency of eye across every single frame. That archive is now the reference nobody else has.",
    name: "Prof. Kamala Iyer",
    role: "Head of Archives, Temple Studies",
    avatar: MEDIA.avatar1,
  },
  {
    quote:
      "The mentorship changed how fifteen young photographers in our cohort see their own communities. That outlasts any single commission.",
    name: "Divya Raman",
    role: "Programme Director, Kanavu",
    avatar: MEDIA.avatar2,
  },
  {
    quote:
      "We came for photographs and left with a way of talking about ourselves. Our funding conversations have not been the same since.",
    name: "Vikram Anand",
    role: "CEO, Inspiring Women India",
    avatar: MEDIA.avatar1,
  },
];


/*
 * A server component: only the hero needs the client (HomeHero gates its
 * intro on the preloader / route curtain), and every interactive section is
 * its own client component. Fixed UI — header, preloader, curtain — lives in
 * the root layout, outside the smooth wrapper: ScrollSmoother transforms
 * #smooth-content, which would break `position: fixed`.
 */
export default function Home() {
  return (
    <>
      <SmoothScroll>
      <main className="flex-1">
        {/* ── Hero ───────────────────────────────────────────────── */}
        <HomeHero />

        {/* ── About ──────────────────────────────────────────────── */}
        <section
          id="about"
          className="shell pb-20 md:pb-28"
          // Reference: space--5 above, section-space--large below.
          style={{ paddingTop: "var(--space-5)" }}
        >
          <div className="grid-12 gap-y-10">
            {/* The About page's portrait block, verbatim: the same 4:5 frame,
                slow drift, column and caption, so the two pages introduce
                Amar the same way. */}
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

            <div className="col-span-12 md:col-start-6 md:col-span-6 flex flex-col gap-6">
              {/* All three set alike: statement size, 600 weight, 120%
                  leading, -3% tracking. The column sets the measure. */}
              <HighlightText className="text-statement font-semibold">
                Meaningful work deserves a story as powerful as the work itself.
              </HighlightText>
              <HighlightText className="text-statement font-semibold">
                The organizations I work with have built something worth talking about. A culture
                worth preserving. An idea worth sharing. A community worth understanding.
              </HighlightText>
              <HighlightText className="text-statement font-semibold">
                My work is to find that story — and give it a form people can see, feel and remember.
              </HighlightText>

              {/* Byline, matching `gap_home_testimonial`: 2.5rem round
                  headshot, 0.6em beside it, name and role stacked at 0.5em.
                  Hidden for now — swap `hidden` back to `flex` to restore it. */}
              <div className="hidden items-center gap-[0.6em]">
                {/* A profile-picture crop of the full-length portrait: the
                    image is drawn at ~2x the circle and offset so the face
                    (around 50% / 28% of the 750×1125 source) lands at centre,
                    head filling about three-quarters of the circle. The
                    offsets are tied to that photo — re-tune them if it is
                    replaced. */}
                <span className="relative size-10 shrink-0 overflow-hidden rounded-full bg-chip">
                  <img
                    src={assetUrl("/assets/amar-ramesh.jpg")}
                    alt=""
                    className="absolute max-w-none"
                    style={{ width: "216%", left: "-57%", top: "-39.5%" }}
                  />
                </span>
                <div className="flex flex-col gap-[0.5em] text-[15px] leading-[1.3]">
                  <p className="font-medium text-muted">Amar Ramesh</p>
                  <p className="text-muted">Founder, Photographer, Author &amp; Mentor</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Showreel — the Studio A team panorama. Inset to the page
             gutter at both sizes.

             The frame is the photo's own 2048×804 widened by the drift: the
             drifting layer is 110% of the frame's height, and at 2253/804
             (= 2048×1.1 / 804) that layer is exactly the photo's ratio — so
             object-cover never trims the sides and every person in the row
             stays in shot at every width. The 10% drift travels over the
             backdrop above the heads and the floor below the feet. A
             portrait phone crop would keep only the middle four people, so
             the panorama holds its ratio on mobile too.

             Hidden for now — drop `hidden` to restore it. */}
        <section className="shell hidden">
          <Reveal>
            <MediaFrame
              ratio="2253 / 804"
              src="/assets/DSC9228-2.jpg"
              parallax={10}
              label="Showreel"
            />
          </Reveal>
        </section>

        {/* ── Featured in + Awards — shared with the About page. Bottom
             padding only: the About section supplies the gap above. ─── */}
        <Recognition className="pb-20 md:pb-28" />

        {/* ── Trusted by — no top padding of its own: the section above's
             bottom padding supplies the gap. ──────────────────────── */}
        <section className="shell pb-20 md:pb-28">
          {/* The label, flush with the table's left edge. */}
          <Reveal className="mb-4 md:mb-6">
            <SectionLabel>Notable brands I&rsquo;ve helped</SectionLabel>
          </Reveal>

          {/* The Featured-in grammar at section width: a ruled table of
              cells sharing single hairlines — the container draws the top
              and left edge, each cell its right and bottom. The brands sit
              six across (two on a phone), empty ruled cells squaring off
              the last row so the table always closes clean. Each
              logo is centred in its cell, its width from brandLogoWidth so
              all ten read at one visual weight, capped to the cell; the
              name lives in the alt text. On the dark and coloured stops of
              the theme slider the logos turn to light single-colour marks
              (`.brand-wall__logo`). */}
          <ul className="grid grid-cols-2 border-l border-t border-rule sm:grid-cols-6">
            {BRANDS.map((brand) => (
              <li
                key={brand.name}
                className="flex aspect-video items-center justify-center border-b border-r border-rule px-5"
              >
                <img
                  src={brand.logo}
                  alt={`${brand.name} logo`}
                  loading="lazy"
                  decoding="async"
                  width={brandLogoWidth(brand.ratio, brand.weight)}
                  height={Math.round(brandLogoWidth(brand.ratio, brand.weight) / brand.ratio)}
                  className="brand-wall__logo h-auto max-h-[55%] w-auto max-w-[78%]"
                />
              </li>
            ))}
            {/* Fillers to the row's end — one set sized for the phone's two
                columns, one for the six on sm+, each shown only at its own
                breakpoint so both layouts close. */}
            {Array.from({ length: (2 - (BRANDS.length % 2)) % 2 }, (_, i) => (
              <li key={`f2-${i}`} aria-hidden className="border-b border-r border-rule sm:hidden" />
            ))}
            {Array.from({ length: (6 - (BRANDS.length % 6)) % 6 }, (_, i) => (
              <li key={`f6-${i}`} aria-hidden className="hidden border-b border-r border-rule sm:block" />
            ))}
          </ul>
        </section>

        {/* ── The work — photography, documentary and books, each a
             preview leading to its own page. Bottom padding only on each:
             the section above supplies the gap. ─────────────────── */}
        <BooksSection className="pb-20 md:pb-28" />
        <PhotographySection />
        <DocumentarySection />

        {/* ── I close that gap — hidden for now; restore by rendering
             <GapSection /> here again (the import is kept for that). ── */}

        {/* ── Works / Success stories — hidden for now; drop `hidden` to
             restore it. ─────────────────────────────────────────── */}
        <section id="works" className="shell hidden py-20 md:py-28">
          <div className="grid-12 gap-y-10">
            <Reveal className="col-span-12 md:col-span-3">
              <SectionLabel>Success Stories</SectionLabel>
            </Reveal>

            <div className="col-span-12 flex flex-col gap-10 md:gap-6">
              {WORKS.map((work, i) => (
                <Reveal key={work.title} delay={i * 80}>
                  <div className="grid-12 gap-y-6 items-start">
                    <div className="col-span-12 md:col-start-4 md:col-span-6">
                      <MediaFrame ratio="726 / 415" src={work.image} parallax={48} />
                    </div>

                    <div className="col-span-12 md:col-start-10 md:col-span-3 flex flex-col gap-4">
                      <span className="text-[13px] font-medium text-muted">{work.index}</span>
                      <h3 className="text-[22px] font-semibold tracking-[-0.03em]">
                        {work.title}
                      </h3>
                      <p className="text-[15px] leading-[1.55] text-muted">
                        {work.blurb}
                      </p>
                      <div className="pt-2">
                        <span className="inline-block bg-chip px-3 py-1.5 text-[22px] font-semibold tracking-[-0.03em]">
                          {work.stat}
                        </span>
                        <p className="pt-3 text-[15px] font-medium">{work.statLabel}</p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal className="mt-4">
            {/* The anchor is the row itself, so the fill wipes across the whole
                line rather than one cell of it. Same row interaction as the
                footer and FAQ: label slides +10px, marker counters -10px. */}
            <a
              href="#works"
              className="footer_hover_row grid-12 items-center py-3"
            >
              <span className="footer_hover_label col-span-3 text-statement font-semibold md:col-span-3">
                [10]
              </span>
              <span className="footer_hover_label col-span-6 text-statement font-semibold md:col-start-4 md:col-span-6">
                View All Works
              </span>
              <span className="footer_hover_marker col-span-3 flex items-center text-statement md:col-start-10 md:col-span-3">
                <CornerArrow className="w-[0.85em]" />
              </span>
            </a>
          </Reveal>
        </section>

        {/* ── In numbers — shared with the About page; even padding both
             sides. ────────────────────────────────────────────────── */}
        <InNumbers />

        {/* ── Services + testimonial ─────────────────────────────── */}
        <section className="shell py-20 md:py-28">
          <div className="grid-12 gap-y-12">
            <div className="col-span-12 md:col-span-3">
              <Testimonials items={TESTIMONIALS} />
            </div>

            {/* Sits to the right of the testimonial. Hover a row to reveal
                its image. */}
            <div className="col-span-12 md:col-start-6 md:col-span-7">
              <Reveal className="mb-8">
                <SectionLabel>Explore all</SectionLabel>
              </Reveal>
              <Services items={SERVICES} />
            </div>
          </div>
        </section>

        {/* ── Notable ventures ───────────────────────────────────── */}
        <section id="ventures" className="shell pb-20 md:pb-28">
          <Reveal>
            <SectionLabel>Notable Ventures</SectionLabel>
          </Reveal>

          <Reveal className="mt-6 md:mt-8">
            <VenturesAccordion ventures={VENTURES} />
          </Reveal>
        </section>

        {/* ── FAQ ────────────────────────────────────────────────── */}
        <section className="shell pb-20 md:pb-28">
          <div className="grid-12 gap-y-12">
            <div className="col-span-12 md:col-span-3 flex flex-col gap-8">
              <Reveal>
                <SectionLabel>FAQ&apos;s</SectionLabel>
              </Reveal>
              {/* mt-auto pins this group to the bottom of the section, level
                  with the end of the accordion beside it. */}
              <Reveal delay={80} className="mt-auto flex flex-col gap-6">
                {/* Two columns of the 12-col page grid. The portrait is
                    750x1125, so the frame takes its 4:5 rather than a square:
                    a 1:1 crop of it centres on the torso and cuts the face. */}
                <div className="w-full md:w-[var(--column-width-2)]">
                  <MediaFrame ratio="4 / 5" src={MEDIA.faq} parallax={0} />
                </div>
                <p className="text-[17px] font-semibold leading-[1.3] tracking-[-0.03em]">
                  Got more questions?
                  <br />
                  Chat with Amar.
                </p>
                <CtaPill label="Book a Call" className="self-start" />
              </Reveal>
            </div>

            <div className="col-span-12 md:col-start-6 md:col-span-7 flex flex-col gap-10">
              <Reveal>
                <h2 className="text-[clamp(2rem,3.4vw,3.25rem)] font-semibold leading-[1.15] tracking-[-0.03em]">
                  Here is what you need to consider before partnering with me.
                </h2>
              </Reveal>
              <Reveal delay={100}>
                <Faq items={FAQS} />
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── Closing CTA ────────────────────────────────────────── */}
        {/* ── Closing CTA — hidden for now; restore by uncommenting. ──
        <ClosingCta>
          <h2 className="sr-only">Let&apos;s create something worth being remembered.</h2>
          <Reveal className="flex w-full flex-col items-center gap-10 px-[var(--grid-margin)]">
            <HighlightText className="text-lede font-semibold text-center max-w-[600px]">
              I uncover the people, purpose and stories behind the work — and turn them into
              photography, films, documentaries and experiences that make your impact understood,
              felt and remembered.
            </HighlightText>
          </Reveal>

          <Reveal className="mt-10 flex justify-center md:mt-16" delay={120}>
            <CtaPill label="Book a call" href="mailto:hello@amarramesh.com" />
          </Reveal>
        </ClosingCta>
        */}
      </main>

      {/* ── Footer ───────────────────────────────────────────────────
           Sizing ported from the reference `footer_*` blocks: padded by
           --site-margin rather than the page shell, top row split 6 / 5 of
           12 columns at a 1rem gutter, nav rows full-width on a dotted
           rule. See the footer section in globals.css. */}
      <SiteFooter />
      </SmoothScroll>
    </>
  );
}
