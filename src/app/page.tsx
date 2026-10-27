import { HomeHero } from "@/components/HomeHero";
import { DocumentarySection, PhotographySection, BooksSection } from "@/components/HomeWork";
import { VenturesAccordion } from "@/components/VenturesAccordion";
import { InNumbers, Recognition, logoWidth } from "@/components/Highlights";
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
import { ContactSection } from "@/components/ContactSection";
import { CtaPill } from "@/components/CtaPill";
import { SectionLabel } from "@/components/SectionLabel";
import { SiteFooter } from "@/components/SiteFooter";
import { MEDIA } from "@/lib/media";
import { assetUrl } from "@/lib/assetUrl";
import { BSF_CHANNEL, thumbUrl } from "@/lib/documentary";
import { galleryBySlug } from "@/lib/photography";

/*
 * The copy document's "Selected work" — the four subjects it singles out,
 * in its order, with its blurbs. Each leads to where that work actually
 * lives on the site: the galleries for the photographic subjects, the
 * documentary index for the films.
 */
const WORKS = [
  {
    index: "01",
    title: "Culture of India",
    blurb:
      "The more I travel across India, the more fascinated I become by the sheer variety of art, craft and traditions we have. I've met musicians, dancers, artisans and craftspeople who have spent years mastering what they do.",
    cta: "Explore Culture of India",
    href: "/photography/folk-art",
    image: galleryBySlug("folk-art")?.cover,
  },
  {
    index: "02",
    title: "Inspiring Women",
    blurb:
      "I've met some remarkable women through my photography projects. Women from different backgrounds, each with their own experiences, achievements and stories. It's always fascinating to learn about the different paths people take in life.",
    cta: "Explore Inspiring Women",
    href: "/books",
    image: "/assets/books/bhavani-jamakkalam/plate-3.jpg",
  },
  {
    index: "03",
    title: "Chettinad",
    blurb:
      "I have a special fascination for Chettinad. The magnificent homes, beautifully carved doorways, architecture, craftsmanship and the stories associated with them. Every time I return, I find something new to appreciate.",
    cta: "Explore Chettinad",
    href: "/photography/chettinad",
    image: galleryBySlug("chettinad")?.cover,
  },
  {
    index: "04",
    title: "Temples of India",
    blurb:
      "I've spent a great deal of time travelling to temples and photographing their architecture and sculptures. The carvings, the proportions, the craftsmanship and the stories behind these structures have always fascinated me.",
    cta: "Explore Temples of India",
    href: "/photography/temples",
    image: galleryBySlug("temples")?.cover,
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
    blurb: "Where my professional photography journey began. We started with weddings and gradually expanded into other forms of photography and creative work.",
    image: assetUrl("/assets/photography-web/studio-a/11.jpg"),
    href: "https://studioa.amarramesh.com/",
    linkLabel: "Visit Studio A",
  },
  {
    area: "Film",
    title: "Big Short Films",
    blurb: "Social and corporate documentaries, exploring subjects ranging from crafts and cultural traditions to businesses and individuals doing interesting work.",
    image: "/assets/ventures/big-short-films.jpg",
    href: BSF_CHANNEL.url,
    linkLabel: "Visit Big Short Films",
  },
  {
    area: "Publishing",
    title: "Mara Labs",
    blurb: "Books that bring together photography, research and thoughtful design. Holding and exploring a book matters as much as the photographs inside it.",
    image: "/assets/books/aranga/plate-2.jpg",
    href: "https://maralabs.in/",
    linkLabel: "Visit Mara Labs",
  },
  {
    area: "Mentorship",
    title: "Kanavu",
    blurb: "Photography training and learning opportunities, making the field more accessible to aspiring women photographers, including women from smaller towns in Tamil Nadu.",
    image: "/assets/ventures/kanavu.jpg",
    href: "https://chennaiphotobiennale.foundation/cpbx/projects/kanavu-fellowship",
    linkLabel: "Explore Kanavu",
  },
  {
    area: "Product",
    title: "MIZU Backdrops",
    blurb: "Began with a problem we faced as photographers. Today it brings together artists and photographers to create handcrafted backdrops for photography and filmmaking.",
    image: "/assets/ventures/mizu.jpg",
    href: "https://www.mizubackdrops.com/",
    linkLabel: "Visit MIZU",
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
 * Logos sized to one visual weight rather than one box, by `logoWidth`
 * from Highlights — the same equal-area rule the Featured-in mastheads
 * use, so the two logo tables read at one size. `weight` is the optical
 * nudge: solid fields (Ramraj's green bar, Thriveni's heavy caps) read
 * heavier than their size, thin linework (Hilton, the Tamil Nadu script)
 * lighter. The cell's own max-width/height caps guard the widest marks.
 */



/*
 * Each row's hover image is Amar's own work: a Studio A wedding frame (the
 * ventures card's image), the Kalamkari film's YouTube still, and the open
 * Aranga spread that stands for Mara Labs.
 */
/*
 * The doc's "What I do" rows. Each photography row takes its gallery's own
 * cover rather than a hardcoded frame, so a re-run of gen-photography.py
 * cannot leave a dead path behind; galleryBySlug resolves it on the server.
 */
const SERVICES = [
  {
    label: "Wedding Photography",
    href: "/photography/weddings",
    image: galleryBySlug("weddings")?.cover,
  },
  {
    label: "Portrait Photography",
    href: "/photography/musicians",
    image: galleryBySlug("musicians")?.cover,
  },
  { label: "Films & Documentaries", href: "/documentary", image: thumbUrl("6c_i4EoUaq4") },
  {
    label: "Commercial Photography",
    href: "/photography/art-form",
    image: galleryBySlug("art-form")?.cover,
  },
  { label: "Books & Publishing", href: "/books", image: "/assets/books/aranga/plate-2.jpg" },
  { label: "Mentorship", image: "/assets/ventures/kanavu.jpg" },
];

const FAQS = [
  {
    q: "What kind of photography projects do you take up?",
    a: "I work across wedding photography, portraits, commercial assignments, architecture and cultural documentation. I also photograph musicians and dancers, which is something I particularly enjoy.",
  },
  {
    q: "Do you work with brands and organisations?",
    a: "Yes. My team and I work with brands and organisations on photography, films, documentaries and creative campaigns.",
  },
  {
    q: "Do you take up projects outside Chennai?",
    a: "Absolutely. I'm based in Chennai, but my work has taken me across India and several other countries.",
  },
  {
    q: "Can your team handle a project from start to finish?",
    a: "Yes. Depending on the project, we can help with research, creative development, photography, filming, production and delivery.",
  },
  {
    q: "Do you conduct photography workshops?",
    a: "Yes. I've been involved in workshops and mentorship programmes for photographers. Kanavu is one of the initiatives through which we're creating more learning opportunities.",
  },
  {
    q: "Can we collaborate on a book or cultural project?",
    a: "Of course. Books, architecture, art and cultural documentation are subjects I really enjoy exploring. I'd be happy to hear about your idea.",
  },
  {
    q: "How do I get in touch?",
    a: "You can use the contact form to share your project details, and my team and I can take it from there.",
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

            <div className="col-span-12 md:col-start-5 md:col-span-6 flex flex-col gap-6">
              {/* All three set alike: statement size, 600 weight, 120%
                  leading, -3% tracking. The column sets the measure. */}
              <HighlightText className="text-statement font-semibold">
                I&rsquo;m Amar Ramesh. I started my career as an engineer in the US. Somewhere along
                the way, I realised photography was what I really wanted to pursue. So I made the
                switch.
              </HighlightText>
              <HighlightText className="text-statement font-semibold">
                I&rsquo;ve always been curious about our temples, architecture, art and the people
                who dedicate their lives to keeping our traditions alive. One project led to
                another.
              </HighlightText>
              <HighlightText className="text-statement font-semibold">
                Today, my work takes me across photography, films, publishing, cultural
                documentation and mentorship. I enjoy the variety. Every experience teaches me
                something.
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

        {/* ── Collaborations — the client marks as a slow marquee rather
             than a boxed grid: one continuous strip drifting across the
             full viewport, feathered out at both edges, each mark
             monochrome at rest. The header keeps the shell; the strip
             bleeds past it. No top padding of its own: the section above's
             bottom padding supplies the gap. ──────────────────────── */}
        <section className="pb-20 md:pb-28">
          <div className="shell">
            <Reveal>
              <SectionLabel>Collaborations</SectionLabel>
            </Reveal>
            <Reveal className="mt-3 md:mt-4">
              <h2 className="max-w-[26ch] text-[clamp(1.5rem,2.6vw,2.25rem)] font-semibold leading-[1.15] tracking-[-0.03em]">
                Some wonderful people and organisations along the way
              </h2>
            </Reveal>
          </div>

          {/* Two copies of the list, the track translating -50% on loop so
              the seam never shows; the second copy is decoration, hidden
              from AT. CSS-only, so nothing fights ScrollSmoother, and
              prefers-reduced-motion swaps it for a static wrapped row (the
              duplicate display:none'd). Hovering a mark hands back its
              colour; hovering the strip rests it. */}
          <Reveal className="mt-8 md:mt-12">
            <div className="logo-marquee" role="list" aria-label="Brands and institutions Amar has worked with">
              <div className="logo-marquee__track">
                {[0, 1].map((copy) => (
                  <ul key={copy} aria-hidden={copy === 1} className="logo-marquee__list">
                    {BRANDS.map((brand) => (
                      <li key={brand.name} role={copy === 0 ? "listitem" : undefined} className="flex items-center">
                        <img
                          src={brand.logo}
                          alt={copy === 0 ? `${brand.name} logo` : ""}
                          loading="lazy"
                          decoding="async"
                          width={logoWidth(brand.ratio, brand.weight, 50)}
                          height={Math.round(logoWidth(brand.ratio, brand.weight, 50) / brand.ratio)}
                          /* An inline width, not `w-auto`: width:auto beats
                             the width attribute (a presentational hint) and
                             rendered every mark at its file's own size. */
                          style={{ width: logoWidth(brand.ratio, brand.weight, 50) }}
                          className="brand-wall__logo h-auto"
                        />
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        {/* ── The work — photography, documentary and books, each a
             preview leading to its own page. Bottom padding only on each:
             the section above supplies the gap. ─────────────────── */}
        <BooksSection className="pb-20 md:pb-28" />
        <PhotographySection />
        <DocumentarySection />

        {/* ── I close that gap — hidden for now; restore by rendering
             <GapSection /> here again (the import is kept for that). ── */}

        {/* ── Selected work — the copy document's four subjects. Each row
             is an image with its blurb beside it, leading to where that
             work lives on the site. ─────────────────────────────── */}
        <section id="works" className="shell py-20 md:py-28">
          <div className="grid-12 gap-y-10">
            <div className="col-span-12 md:col-span-4 flex flex-col gap-6">
              <Reveal>
                <SectionLabel>Selected work</SectionLabel>
              </Reveal>
              <Reveal>
                <h2 className="text-[clamp(1.5rem,2.6vw,2.25rem)] font-semibold leading-[1.15] tracking-[-0.03em]">
                  A few projects that have been particularly special
                </h2>
              </Reveal>
              <Reveal>
                <p className="text-[17px] leading-[1.5] text-muted">
                  I&rsquo;ve had the opportunity to work on some fascinating subjects over the
                  years. Here are a few that I&rsquo;ve really enjoyed exploring.
                </p>
              </Reveal>
            </div>

            <div className="col-span-12 flex flex-col gap-14 md:gap-16">
              {WORKS.map((work) => (
                <Reveal key={work.title}>
                  {/* The whole row is the link, so the image and its blurb
                      lead to the same place. */}
                  <a href={work.href} className="group/work grid-12 gap-y-4 items-start md:gap-y-6">
                    {/* The index holds the left three columns — the same
                        columns the section header sits in — so the row
                        spans the full measure instead of leaving them
                        blank. Small on a phone, where it sits above the
                        image; statement-size and faint from md. */}
                    <span className="col-span-12 text-[13px] font-medium tabular-nums text-muted md:col-span-3 md:text-[clamp(2rem,3.4vw,3.25rem)] md:font-semibold md:leading-none md:tracking-[-0.03em] md:text-foreground/25">
                      {work.index}
                    </span>

                    <div className="col-span-12 md:col-start-4 md:col-span-6">
                      <MediaFrame ratio="726 / 415" src={work.image} parallax={48} />
                    </div>

                    <div className="col-span-12 md:col-start-10 md:col-span-3 flex flex-col gap-4">
                      <h3 className="text-[22px] font-semibold tracking-[-0.03em] transition-opacity duration-300 group-hover/work:opacity-60">
                        {work.title}
                      </h3>
                      <p className="text-[15px] leading-[1.55] text-muted">{work.blurb}</p>
                      <span className="flex items-center gap-2 pt-1 text-[15px] font-medium">
                        {work.cta}
                        <CornerArrow
                          tight
                          className="w-3 shrink-0 transition-transform duration-300 group-hover/work:translate-x-0.5 group-hover/work:-translate-y-0.5"
                        />
                      </span>
                    </div>
                  </a>
                </Reveal>
              ))}
            </div>
          </div>
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
            <div className="col-span-12 md:col-span-8">
              <Reveal className="mb-8">
                <SectionLabel>Here&rsquo;s what I enjoy working on</SectionLabel>
              </Reveal>
              <Services items={SERVICES} />
            </div>
          </div>
        </section>

        {/* ── Notable ventures ───────────────────────────────────── */}
        <section id="ventures" className="shell pb-20 md:pb-28">
          <Reveal>
            <SectionLabel>Some ideas I couldn&rsquo;t stop thinking about</SectionLabel>
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
                    a 1:1 crop of it centres on the torso and cuts the face.

                    On a phone it is a headshot beside "Chat with Amar", not a
                    full-bleed portrait: at the full column width a 4:5 frame
                    stands taller than it needs to and pushes the CTA down the
                    page, so it is capped to 40% of the measure (floored at
                    140px for a narrow phone). From md: up the two-column
                    width takes over. */}
                <div className="w-[40%] min-w-[140px] md:w-[var(--column-width-2)] md:min-w-0">
                  <MediaFrame ratio="4 / 5" src={MEDIA.faq} parallax={0} />
                </div>
                <p className="text-[17px] font-semibold leading-[1.3] tracking-[-0.03em]">
                  Have an interesting idea?
                  <br />
                  I&rsquo;d love to hear about it.
                </p>
                <CtaPill label="Start a Conversation" className="self-start" />
              </Reveal>
            </div>

            <div className="col-span-12 md:col-span-8 flex flex-col gap-10">
              <Reveal>
                <h2 className="text-[clamp(2rem,3.4vw,3.25rem)] font-semibold leading-[1.15] tracking-[-0.03em]">
                  A few things you might want to know.
                </h2>
              </Reveal>
              <Reveal delay={100}>
                <Faq items={FAQS} />
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── Work with me — the copy document's invitation, on the black
             band. Restored from the commented-out version: it also carries
             #contact, which the header and footer link to. ───────── */}
        <ClosingCta>
          <h2 className="sr-only">Have an interesting idea? I&rsquo;d love to hear about it.</h2>
          <Reveal className="flex w-full flex-col items-center gap-10 px-[var(--grid-margin)]">
            <HighlightText className="text-lede font-semibold text-center max-w-[600px]">
              I enjoy working with people who are passionate about what they do. It could be a
              photography assignment, a documentary, a book, a campaign or a cultural project
              you&rsquo;ve been wanting to explore.
            </HighlightText>
          </Reveal>

          <Reveal className="mt-10 flex justify-center md:mt-16">
            <CtaPill label="Start a Conversation" href="#contact" />
          </Reveal>
        </ClosingCta>
        {/* ── Contact — the document's form. Sits after the band, so the
             band's invitation leads straight into it. ──────────── */}
        <ContactSection />
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
