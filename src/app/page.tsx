import { HomeHero } from "@/components/HomeHero";
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- the work sections are hidden for now, not removed.
import { DocumentarySection, PhotographySection, BooksSection } from "@/components/HomeWork";
import { VentureCards } from "@/components/VentureCards";
import { StickyPortrait } from "@/components/StickyPortrait";
import { InNumbers, NUMBERS, Recognition, logoWidth } from "@/components/Highlights";
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
import { ContactSection } from "@/components/ContactSection";
import { BLACK_PALETTE, ClosingCta } from "@/components/ClosingCta";
import { CtaPill } from "@/components/CtaPill";
import { SiteFooter } from "@/components/SiteFooter";
import { MEDIA } from "@/lib/media";
import { assetUrl } from "@/lib/assetUrl";
import { BSF_CHANNEL, thumbUrl } from "@/lib/documentary";
import { galleryBySlug } from "@/lib/photography";

/** A landscape frame other than the cover, to suit the 3:2 hover card. */
const revealFrame = (slug: string) => {
  const gallery = galleryBySlug(slug);
  return (
    gallery?.frames.find((f) => f.width > f.height && f.src !== gallery.cover)?.src ??
    gallery?.cover
  );
};

/** One named frame of a gallery (e.g. "22.jpg"), resolved through its data. */
const galleryFrame = (slug: string, file: string) =>
  galleryBySlug(slug)?.frames.find((f) => f.src.endsWith(`/${file}`))?.src;

/*
 * The copy document's "Selected work" — the four subjects it singles out,
 * in its order, with its blurbs. Each leads to where that work actually
 * lives on the site: the galleries for the photographic subjects, the
 * documentary index for the films. `reveal` is the second frame the cover
 * lifts out on hover.
 */
const WORKS = [
  {
    index: "01",
    title: "Culture of India",
    blurb:
      "The more I travel across India, the more fascinated I become by the sheer variety of art, craft and traditions we have. I've met musicians, dancers, artisans and craftspeople who have spent years mastering what they do.",
    cta: "Explore Culture of India",
    href: "/photography/folk-art",
    // From the Folk Art gallery: a painted performer's face in close-up,
    // and a Theyyam performer leaping between fishing boats.
    image: galleryFrame("folk-art", "26.jpg"),
    reveal: galleryFrame("folk-art", "16.jpg"),
  },
  {
    index: "02",
    title: "Inspiring Women",
    blurb:
      "I've met some remarkable women through my photography projects. Women from different backgrounds, each with their own experiences, achievements and stories. It's always fascinating to learn about the different paths people take in life.",
    cta: "Explore Inspiring Women",
    href: "/books",
    // Amar's own portraits of women, from the Classical Dancers gallery: a
    // studio portrait with grain against a red disc, and a dancer seated in
    // a carved Chettinad doorway.
    image: galleryFrame("classical-dancers", "22.jpg"),
    reveal: galleryFrame("classical-dancers", "28.jpg"),
  },
  {
    index: "03",
    title: "Chettinad",
    blurb:
      "I have a special fascination for Chettinad. The magnificent homes, beautifully carved doorways, architecture, craftsmanship and the stories associated with them. Every time I return, I find something new to appreciate.",
    cta: "Explore Chettinad",
    href: "/photography/chettinad",
    image: galleryBySlug("chettinad")?.cover,
    reveal: revealFrame("chettinad"),
  },
  {
    index: "04",
    title: "Temples of India",
    blurb:
      "I've spent a great deal of time travelling to temples and photographing their architecture and sculptures. The carvings, the proportions, the craftsmanship and the stories behind these structures have always fascinated me.",
    cta: "Explore Temples of India",
    href: "/photography/temples",
    image: galleryBySlug("temples")?.cover,
    reveal: revealFrame("temples"),
  },
];

/**
 * In list order. Each logo is the venture's own, trimmed to the artwork and
 * kept under public/assets/ventures/logos/:
 *  - Studio A, Mara Labs and MIZU: the marks from their own sites' headers.
 *  - Big Short Films: its YouTube channel's avatar (it has no site of its
 *    own), its white ground knocked out.
 *  - Kanavu has no mark of its own; it carries the Chennai Photo Biennale
 *    Foundation's, which runs the fellowship.
 * `ratio` is each file's width ÷ height; `weight` an optical nudge (see
 * logoWidth); `white` sets a dark mark (MIZU's grey) in white on the band.
 *
 * Links: every venture leads off-site. Big Short Films is Studio A's
 * documentary vertical with no site of its own, so it leads to its YouTube
 * channel, where the films are published. Kanavu leads to
 * its page on the Chennai Photo Biennale Foundation site, which runs it.
 */
const VENTURES = [
  {
    title: "Studio A",
    blurb:
      "Studio A is where my professional photography journey began. We started with weddings and gradually expanded into other forms of photography and creative work. What I value most is the team we’ve built and the people we’ve met along the way.",
    logo: { src: "/assets/ventures/logos/studio-a.png", ratio: 1.009 },
    href: "https://studioa.amarramesh.com/",
    linkLabel: "Visit Studio A",
  },
  {
    title: "Big Short Films",
    blurb:
      "Big Short Films grew from our interest in telling real, inspiring stories through film. We work on social and corporate documentaries, exploring subjects ranging from crafts and cultural traditions to businesses and individuals doing interesting work. It’s given us the opportunity to meet some extraordinary people.",
    logo: { src: "/assets/ventures/logos/big-short-films.png", ratio: 0.933 },
    href: BSF_CHANNEL.url,
    linkLabel: "Visit Big Short Films",
  },
  {
    title: "Mara Labs",
    blurb:
      "Mara Labs grew out of my fascination for books and South Indian heritage. We create books that bring together photography, research and thoughtful design. I enjoy experimenting with how a book looks, feels and presents its subject. For me, the experience of holding and exploring a book is just as important as the photographs inside it.",
    logo: { src: "/assets/ventures/logos/mara-labs.png", ratio: 5.237, weight: 1.1 },
    href: "https://maralabs.in/",
    linkLabel: "Visit Mara Labs",
  },
  {
    title: "Kanavu",
    blurb:
      "Kanavu is an initiative that’s very close to my heart. Through photography training and learning opportunities, we’re working to make the field more accessible to aspiring women photographers, including women from smaller towns in Tamil Nadu. I’ve always believed that access to the right opportunities can make an enormous difference. And I’m excited about what we can continue building through Kanavu.",
    logo: { src: "/assets/ventures/logos/chennai-photo-biennale.png", ratio: 1 },
    href: "https://chennaiphotobiennale.foundation/cpbx/projects/kanavu-fellowship",
    linkLabel: "Explore Kanavu",
  },
  {
    title: "MIZU Backdrops",
    blurb:
      "MIZU began with a problem we faced as photographers. We wanted beautiful, hand-painted canvas backdrops for our shoots and found it difficult to get exactly what we needed. So we decided to create them. Today, MIZU brings together artists and photographers to create handcrafted backdrops for photography and filmmaking.",
    logo: { src: "/assets/ventures/logos/mizu.png", ratio: 2.384, white: true },
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
  { name: "Ramraj Cotton", logo: "/assets/brands/ramraj-cotton.svg", ratio: 5.75, weight: 0.92, href: "https://ramrajcotton.in/" },
  { name: "Annapoorna Hotels", logo: "/assets/brands/annapoorna-hotels.svg", ratio: 3.876, weight: 1, href: "https://www.sreeannapoorna.com/" },
  { name: "Hilton Chennai", logo: "/assets/brands/hilton.svg", ratio: 1.311, weight: 1.05, href: "https://www.hilton.com/en/hotels/maahihi-hilton-chennai/" },
  { name: "Paramount Textiles", logo: "/assets/brands/paramount-textiles.png", ratio: 0.931, weight: 1, href: "https://www.paramountmadurai.com/" },
  { name: "Tamil Nadu Tourism", logo: "/assets/brands/tamil-nadu-tourism.png", ratio: 2.466, weight: 1.05, href: "https://www.tamilnadutourism.tn.gov.in/" },
  { name: "DakshinaChitra", logo: "/assets/brands/dakshinachitra.png", ratio: 1, weight: 0.9, href: "https://www.dakshinachitra.net/" },
  { name: "Kumaraguru Institutions", logo: "/assets/brands/kumaraguru.png", ratio: 4.324, weight: 1, href: "https://kumaraguru.in/" },
  { name: "Chennai Photo Biennale", logo: "/assets/brands/chennai-photo-biennale.png", ratio: 1, weight: 0.88, href: "https://chennaiphotobiennale.foundation/" },
  { name: "KLRF", logo: "/assets/brands/klrf.png", ratio: 2.964, weight: 0.95, href: "https://www.klrf.in/" },
  { name: "Thriveni Earthmovers", logo: "/assets/brands/thriveni.svg", ratio: 5.188, weight: 0.92, href: "https://thriveni.com/" },
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

        {/* ── About — a full-bleed black band, pinned to the same
             white-on-black palette as the closing CTA so the caption, the
             frame's placeholder and the portrait's hover read against it.
             `data-theme-section="dark"` turns the bar beige while it is
             over the band. ──────────────────────────────────────── */}
        <section
          id="about"
          data-theme-section="dark"
          style={BLACK_PALETTE}
          className="bg-black text-white py-28 md:py-44"
        >
          <div className="shell grid-12 gap-y-10">
            {/* The About page's portrait block, verbatim: the same 4:5 frame,
                slow drift, column and caption, so the two pages introduce
                Amar the same way. */}
            {/* StickyPortrait holds it in view, from md, while the copy and
                awards beside it scroll past. */}
            <div className="col-span-8 sm:col-span-6 md:col-span-3">
              <StickyPortrait>
                <Reveal>
                  <MediaFrame
                    ratio="4 / 5"
                    src={assetUrl("/assets/amar-ramesh.jpg")}
                    parallax={14}
                  />
                  <p className="mt-4 text-[13px] font-medium text-muted">
                    Photographer · Filmmaker · Author · Entrepreneur · Mentor
                  </p>
                </Reveal>
              </StickyPortrait>
            </div>

            <div className="col-span-12 md:col-start-5 md:col-span-6 flex flex-col">
              {/* All three set as the reference's `problems_home_heading`
                  (see `.about_statement` in globals.css), spaced as its
                  blank-line breaks between paragraphs. */}
              <HighlightText className="about_statement">
                I&rsquo;m Amar Ramesh. I started my career as an engineer in the US. Somewhere along
                the way, I realised photography was what I really wanted to pursue. So I made the
                switch.
              </HighlightText>
              <HighlightText className="about_statement">
                I&rsquo;ve always been curious about our temples, architecture, art and the people
                who dedicate their lives to keeping our traditions alive. One project led to
                another.
              </HighlightText>
              {/* Each discipline leads to its work: the photography, films
                  and books pages, Selected work's cultural subjects, and
                  Ventures for Kanavu. Underlined on hover by .link-wipe. */}
              <HighlightText className="about_statement">
                Today, my work takes me across{" "}
                {/* Plain anchors, for the route curtain's click handler. */}
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                <a href="/photography" className="link-wipe">
                  photography
                </a>
                ,{" "}
                <a href="/documentary" className="link-wipe">
                  films
                </a>
                ,{" "}
                <a href="/books" className="link-wipe">
                  publishing
                </a>
                ,{" "}
                {/* Kept to one line so the split leaves it one anchor with
                    one underline. */}
                <a href="#works" className="link-wipe whitespace-nowrap">
                  cultural documentation
                </a>{" "}
                and{" "}
                <a href="#ventures" className="link-wipe">
                  mentorship
                </a>
                . I enjoy the variety. Every experience teaches me something.
              </HighlightText>

              {/* In numbers — the same figures as <InNumbers />, set as a
                  2×2 grid under a hairline: the numeral at display scale,
                  its measure in small muted type beneath. */}
              <ul className="mt-16 grid grid-cols-2 gap-x-6 gap-y-10 border-t border-rule pt-8 md:mt-24 md:pt-10">
                {NUMBERS.map((item, i) => (
                  <Reveal as="li" key={item.label} delay={i * 60} className="flex flex-col gap-2">
                    <span className="about_type text-[clamp(2rem,1.5rem+2vw,3.5rem)] leading-none">
                      {item.stat}
                    </span>
                    <span className="text-[15px] font-medium text-muted">{item.label}</span>
                  </Reveal>
                ))}
              </ul>

              {/* Byline, matching `gap_home_testimonial`: 2.5rem round
                  headshot, 0.6em beside it, name and role stacked at 0.5em.
                  Hidden for now — swap `hidden` back to `flex` to restore it. */}
              <div className="mt-6 hidden items-center gap-[0.6em]">
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

          {/* Featured in + Awards — shared with the About page, set inside
              the band on its black. Its separator sits as far below the
              numbers as their hairline sits above them (pt-8 / md:pt-10),
              so the figures centre between the two rules. */}
          <Recognition className="mt-8 md:mt-10" />
        </section>

        {/* ── Collaborations — the client marks as a slow marquee rather
             than a boxed grid: one continuous strip drifting across the
             full viewport, feathered out at both edges, each mark
             monochrome at rest. The header keeps the shell; the strip
             bleeds past it. Its eyebrow is Selected work's, so the wrapper
             takes `works` for the marker colour. Padding both sides: the
             About band above is filled, so its own padding sits inside the
             black. The bottom is deeper, to part the strip from Selected
             work below. ────────────────────────────────────────────── */}
        <section className="pt-20 pb-36 md:pt-28 md:pb-56">
          <div className="works shell">
            <Reveal>
              <h2 className="works_eyebrow">
                <span aria-hidden className="works_eyebrow_marker" />
                <span className="works_eyebrow_text">Selected Collaborations</span>
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
                        {/* Each mark opens its brand's site in a new tab; the
                            decorative copy's links stay out of the tab order. */}
                        <a
                          href={brand.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          tabIndex={copy === 0 ? undefined : -1}
                          className="flex cursor-pointer items-center"
                        >
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
                        </a>
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            </div>
          </Reveal>
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

        {/* ── Selected work — the copy document's four subjects, laid out
             as the reference's "Success Stories" (`works_home_*`): the
             eyebrow, heading and intro hold the left two columns, the list
             the other ten. Each row is a 3:2 cover over seven of the list's
             twelve tracks and its copy over the other five, rows parted by
             a dotted rule. Hovering a cover dims it and lifts a second frame
             out of it. A full-measure "view all" bar closes the section.
             Type is the reference's, set by the `works_*` classes in
             globals.css. Bottom padding only: Collaborations above
             supplies the gap. ──────────────────────────────────────── */}
        <section id="works" className="works shell pb-20 md:pb-28">
          <div className="grid-12 gap-y-8 pb-[var(--space-4)]">
            <div className="col-span-12 flex flex-col gap-6 min-[62rem]:col-span-2">
              <Reveal>
                <p className="works_eyebrow">
                  <span aria-hidden className="works_eyebrow_marker" />
                  <span className="works_eyebrow_text">Selected work</span>
                </p>
              </Reveal>
              <Reveal>
                <h2 className="text-[clamp(1.5rem,2.6vw,2.25rem)] font-semibold leading-[1.15] tracking-[-0.03em]">
                  A few projects that have been particularly special
                </h2>
              </Reveal>
              <Reveal>
                <p className="works_p">
                  I&rsquo;ve had the opportunity to work on some fascinating subjects over the
                  years. Here are a few that I&rsquo;ve really enjoyed exploring.
                </p>
              </Reveal>
            </div>

            <div className="col-span-12 min-[62rem]:col-span-10">
              <ol className="works_list">
                {WORKS.map((work) => (
                  <Reveal as="li" key={work.title} className="works_item">
                    {/* The whole row is the link, so the cover and its copy
                        lead to the same place. */}
                    <a href={work.href} className="grid-12 items-start gap-y-4">
                      <div className="works_cover relative col-span-12 overflow-clip rounded-[0.15rem] min-[30rem]:col-span-7">
                        <MediaFrame ratio="3 / 2" ratioMobile="1 / 1" src={work.image} parallax={15} />
                        <span aria-hidden className="works_overlay" />
                        <span aria-hidden className="works_reel">
                          <span className="works_reel_card">
                            <img src={work.reveal} alt="" loading="lazy" decoding="async" />
                          </span>
                        </span>
                      </div>

                      <div className="works_content col-span-12 min-[30rem]:col-span-5">
                        <div className="flex flex-col gap-[var(--space-4)]">
                          {/* The reference's micrographic: initials, then a
                              dot and a dash leading into the boxed row
                              number. */}
                          <span className="works_micrographic">
                            <span className="works_micro pt-[0.015rem]">SW</span>
                            <span className="flex items-center">
                              <span aria-hidden className="size-[3px] shrink-0 rounded-full bg-foreground" />
                              <span aria-hidden className="h-px w-2.5 shrink-0 bg-foreground" />
                              <span className="works_micro_box">
                                <span className="works_micro">
                                  {work.index}/{String(WORKS.length).padStart(2, "0")}
                                </span>
                              </span>
                            </span>
                          </span>
                          <h3 className="works_title">{work.title}</h3>
                          <p className="works_p">{work.blurb}</p>
                        </div>
                        <span className="works_cta mt-[var(--section-space-small)]">
                          <span className="inline-flex items-center gap-2">
                            {work.cta}
                            <CornerArrow tight className="w-3 shrink-0" />
                          </span>
                        </span>
                      </div>
                    </a>
                  </Reveal>
                ))}
              </ol>
            </div>
          </div>

          {/* The reference's closing bar: the count, the label and the
              arrow across the full measure on a solid rule. */}
          <Reveal>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- plain anchor so the route curtain handles the transition, as everywhere on the site. */}
            <a href="/photography" className="works_all grid-12 items-center">
              <span className="works_all_text col-span-2">
                {String(WORKS.length).padStart(2, "0")}
              </span>
              <span className="works_all_text col-span-8">View all work</span>
              <span className="works_all_text works_all_arrow col-span-2">(→)</span>
            </a>
          </Reveal>
        </section>

        {/* ── Services + testimonial — the reference's `services_home_*`
             band ("What we can help with"): black-400 ground, the slider in
             the first three columns, the service list from the fifth. Below
             62rem the list leads and the slider follows at half width (full
             under 30rem). Styles are the `svc_*` classes in globals.css.
             `data-theme-section="dark"` turns the bar beige over it. ── */}
        <section id="services" data-theme-section="dark" className="svc_wrap">
          <div className="svc_contain shell grid-12">
            <div className="svc_stats order-last col-span-12 min-[30rem]:col-span-6 min-[62rem]:order-none min-[62rem]:col-span-3">
              <Testimonials items={TESTIMONIALS} descriptor="(Real client stories)" />
            </div>

            <div className="col-span-12 min-[62rem]:col-start-5 min-[62rem]:col-span-8">
              <div className="svc_eyebrow">
                <p className="works_eyebrow">
                  <span aria-hidden className="works_eyebrow_marker" />
                  <span className="works_eyebrow_text">Here&rsquo;s what I enjoy working on</span>
                </p>
              </div>
              <Services items={SERVICES} />
            </div>
          </div>
        </section>

        {/* ── Notable ventures — the header set as Selected work's (its
             eyebrow, heading and intro), so the wrapper takes `works` for
             the marker colour. The three sit in one row from 62rem —
             eyebrow over the first three columns, heading 5–7, intro 9–12,
             bottom-aligned — and stack below it. A black band continuing
             the services band above, on its `svc_wrap` ground and palette;
             `data-theme-section="dark"` turns the bar beige and the cards to
             their dark ramp. ──────────────────────────────────────────── */}
        <section
          id="ventures"
          data-theme-section="dark"
          // -mt-px tucks it under the services band by a pixel: mid-scroll the
          // smoother lands the two on fractional pixels, and the light page
          // showed through the seam as a hairline.
          className="svc_wrap -mt-px py-20 md:py-28"
        >
          <div className="shell">
            <div className="works grid-12 items-end gap-y-6">
              <Reveal className="col-span-12 min-[62rem]:col-span-3">
                <p className="works_eyebrow">
                  <span aria-hidden className="works_eyebrow_marker" />
                  <span className="works_eyebrow_text">Ventures</span>
                </p>
              </Reveal>
              <Reveal className="col-span-12 min-[62rem]:col-start-5 min-[62rem]:col-span-3">
                <h2 className="max-w-[26ch] text-[clamp(1.5rem,2.6vw,2.25rem)] font-semibold leading-[1.15] tracking-[-0.03em]">
                  Some ideas I couldn&rsquo;t stop thinking about
                </h2>
              </Reveal>
              <Reveal className="col-span-12 flex max-w-[56ch] flex-col gap-3 min-[62rem]:col-start-9 min-[62rem]:col-span-4">
                <p className="works_p">
                  Over the years, I&rsquo;ve been fortunate to work with people who have helped turn
                  different ideas into actual projects and businesses.
                </p>
                <p className="works_p">
                  Each of these ventures grew out of an interest, an experience or something I wanted
                  to explore further.
                </p>
              </Reveal>
            </div>

            <Reveal className="mt-10 md:mt-14">
              <VentureCards ventures={VENTURES} />
            </Reveal>
          </div>
        </section>

        {/* ── The work — photography, documentary and books, each a
             preview leading to its own page. Removed from the home page
             for now; restore by rendering
             <BooksSection className="pb-20 md:pb-28" />, <PhotographySection />
             and <DocumentarySection /> here again (the import is kept for
             that). ─────────────────────────────────────────────────── */}

        {/* ── I close that gap — hidden for now; restore by rendering
             <GapSection /> here again (the import is kept for that). ── */}

        {/* ── In numbers — moved into the About band above; restore the
             standalone section by rendering <InNumbers /> here again (the
             import is kept for that). ─────────────────────────────── */}

        {/* ── FAQ — the reference's `faq_home_*` section: a card-bg band
             on the 12-column grid, eyebrow top-left, the headshot, line
             and CTA pinned to the foot of those four columns, the heading
             and accordion over the other eight. Stacks below 62rem.
             Styles are the `faq_*` rules in globals.css. ────────────── */}
        <section id="faqs" data-theme-section="dark" className="faq_wrap">
          <Reveal className="works faq_left">
            <p className="works_eyebrow">
              <span aria-hidden className="works_eyebrow_marker" />
              <span className="works_eyebrow_text">FAQ&apos;s</span>
            </p>
          </Reveal>

          <div className="faq_main">
            <Reveal>
              <h2 className="faq_heading">A few things you might want to know.</h2>
            </Reveal>
            <Reveal delay={100}>
              <Faq items={FAQS} />
            </Reveal>
          </div>

          {/* The reference's headshot is a square cropped high (50% 20%),
              which keeps the portrait's face in frame. */}
          <Reveal delay={80} className="faq_content">
            <img
              src={MEDIA.faq}
              alt="Amar Ramesh"
              loading="lazy"
              decoding="async"
              className="faq_headshot"
            />
            <p className="faq_p">Have an interesting idea? I&rsquo;d love to hear about it.</p>
            <CtaPill label="Start a Conversation" className="self-start" />
          </Reveal>
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
