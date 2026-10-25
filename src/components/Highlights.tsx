import { Reveal } from "@/components/Reveal";
import { RightArrow } from "@/components/Arrows";
import { SectionLabel } from "@/components/SectionLabel";

/**
 * "In numbers" and "Recognition", shared by the About and home pages so the
 * figures and honours are written once. Each takes its vertical spacing as
 * `className`, since the two pages space their sections differently.
 *
 * Both speak the site's section grammar: hairline rules, muted small
 * labels, tabular indices — and Recognition sits in the standard section
 * layout (label and context in the first columns, content from column 6)
 * with rule-separated rows like the books list and the footer.
 */

const NUMBERS = [
  { stat: "750+", label: "weddings photographed" },
  { stat: "22", label: "countries worked in" },
  { stat: "1,000+", label: "temples documented" },
  { stat: "8", label: "books authored" },
];

/* The copy document's award list, verbatim; the Birdman line is a
   sentence in the doc, not a fourth item, and renders below the rows. */
const AWARDS = [
  "Fearless Photographers Award",
  "WPPI Award",
  "One Eyeland Award",
];

/**
 * One visual weight for every logo table on the site. Filling a fixed box
 * makes wide wordmarks read small and square marks loom, so each mark gets
 * the same area instead — `side` px square — scaled by an optical `weight`
 * for density. Shared with the brand wall on the home page, so the press
 * and brand tables read at one size.
 */
export const LOGO_SIDE = 44;
export const logoWidth = (ratio: number, weight: number, side: number = LOGO_SIDE) =>
  Math.round(side * weight * Math.sqrt(ratio));

/* Mastheads are wide and thin, so the equal-area rule starves them of
   height at the brand side; they get a larger one. */
const PRESS_LOGO_SIDE = 54;

/*
 * The press, as the mastheads themselves — the files under
 * public/assets/press/, which the site carried but no longer drew.
 * `ratio` is each file's own width ÷ height.
 */
const PRESS = [
  { name: "The Hindu", logo: "/assets/press/the-hindu.svg", ratio: 8.29, weight: 1 },
  { name: "Reader's Digest", logo: "/assets/press/readers-digest.svg", ratio: 7.16, weight: 0.95 },
  { name: "DestinAsian", logo: "/assets/press/destinasian.png", ratio: 7.25, weight: 1.05 },
  { name: "Wedding Vows", logo: "/assets/press/wedding-vows.png", ratio: 1.82, weight: 0.9 },
];

/**
 * The figures as an unlabelled display list — no section heading, no rules,
 * no small print: each stat is one statement-scale line, the numeral in the
 * foreground and its measure running on in the muted colour, so the block
 * reads like the About statements above it with the numbers doing the
 * talking. Set on the section grid from column 6, aligned with the content
 * of the sections around it.
 */
export function InNumbers({ className = "py-20 md:py-28" }: { className?: string }) {
  return (
    <section className={`shell ${className}`}>
      <div className="grid-12">
        <ul className="col-span-12 flex flex-col gap-3 md:col-start-6 md:col-span-7 md:gap-4">
          {NUMBERS.map((item, i) => (
            <Reveal
              as="li"
              key={item.label}
              delay={i * 60}
              className="text-statement font-semibold"
            >
              <span className="tabular-nums">{item.stat}</span>{" "}
              <span className="text-muted">{item.label}</span>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/**
 * Recognition — the honours as statement rows on hairlines, the press as
 * one open run of mastheads. No badges and no boxed cells: the honours
 * speak the footer's and FAQ's list grammar — an index, the award, what it
 * was for, one rule-separated line each — and the mastheads sit bare on
 * the measure, monochrome, so the section stays type-first like the page
 * around it.
 */
export function Recognition({ className = "pb-24 md:pb-36" }: { className?: string }) {
  return (
    <section id="recognition" className={`shell ${className}`}>
      {/* The standard section layout — label, headline and the doc's two
          intro paragraphs in the first columns, content from column 6 so
          the award rows and mastheads start on the same line as the About
          statements above. All copy verbatim from the document's
          AWARDS & RECOGNITION section. */}
      <div className="grid-12 gap-y-8">
        <div className="col-span-12 flex flex-col gap-3 md:col-span-4 md:gap-4">
          <Reveal>
            <SectionLabel>Recognition</SectionLabel>
          </Reveal>
          <Reveal>
            <h2 className="max-w-[18ch] text-[clamp(1.5rem,2.6vw,2.25rem)] font-semibold leading-[1.15] tracking-[-0.03em]">
              It&rsquo;s always lovely when the work gets appreciated
            </h2>
          </Reveal>
          <Reveal className="flex flex-col gap-4 text-[17px] leading-[1.5] text-muted">
            <p>
              I&rsquo;ve been fortunate to receive recognition for my photography and filmmaking
              over the years.
            </p>
            <p>
              It&rsquo;s encouraging, especially when the recognition comes for projects that my
              team and I have spent so much time working on.
            </p>
          </Reveal>
        </div>

        <div className="col-span-12 md:col-start-6 md:col-span-7">
          {/* The footer navigation's rows, structure for structure: the
              dotted-rule li (.footer_nav_li), the .footer_nav_text row
              inside it carrying the nav's own type (--f-h3, weight 500) and
              padding, and the .footer_hover_row interaction — fill inverts,
              label slides right, the arrow eases in from its blur. Only the
              element differs: a div, not an anchor, since an award is not a
              destination. */}
          <ul>
            {AWARDS.map((title, i) => (
              <Reveal as="li" key={title} delay={i * 60} className="footer_nav_li">
                <div className="footer_nav_text footer_hover_row">
                  <span className="footer_hover_label">{title}</span>
                  <span aria-hidden className="footer_nav_arrow">
                    <RightArrow className="inline-arrow" />
                  </span>
                </div>
              </Reveal>
            ))}
          </ul>
          <Reveal className="mt-6 md:mt-8">
            <p className="max-w-[52ch] text-[17px] leading-[1.5] text-muted">
              Big Short Films&rsquo; <em className="not-italic font-medium text-foreground">Birdman</em>{" "}
              was also recognised at the YES I AM THE CHANGE social film contest.
            </p>
          </Reveal>

          {/* Featured in — the mastheads in one quiet run on the same
              measure, monochrome via .brand-wall__logo; no rules, no cells. */}
          <Reveal className="mt-12 md:mt-16">
            <SectionLabel>Featured in</SectionLabel>
          </Reveal>
          <Reveal className="mt-6 md:mt-8">
            <ul className="flex flex-wrap items-center gap-x-10 gap-y-8 md:justify-between md:gap-x-12">
              {PRESS.map((item) => (
                <li key={item.name} className="flex items-center">
                  <img
                    src={item.logo}
                    alt={`${item.name} logo`}
                    loading="lazy"
                    decoding="async"
                    width={logoWidth(item.ratio, item.weight, PRESS_LOGO_SIDE)}
                    height={Math.round(logoWidth(item.ratio, item.weight, PRESS_LOGO_SIDE) / item.ratio)}
                    /* An inline width, not `w-auto`: width:auto beats the width
                       attribute and rendered the mastheads at file size. */
                    style={{ width: logoWidth(item.ratio, item.weight, PRESS_LOGO_SIDE) }}
                    className="brand-wall__logo h-auto"
                  />
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
