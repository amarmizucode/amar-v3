import { Reveal } from "@/components/Reveal";
import { RightArrow } from "@/components/Arrows";
import { watchUrl } from "@/lib/documentary";

/* "The Birdman" in the Big Short Films catalogue (lib/documentary). */
const BIRDMAN_ID = "oykTD4Y9hl4";

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

export const NUMBERS = [
  { stat: "750+", label: "weddings photographed" },
  { stat: "22", label: "countries worked in" },
  { stat: "1,000+", label: "temples documented" },
  { stat: "8", label: "books authored" },
];

/* The copy document's award list, verbatim; the Birdman line is a
   sentence in the doc, not a fourth item, and renders below the rows. Each
   row leads to the award's own site. */
const AWARDS = [
  { title: "Fearless Photographers Award", href: "https://www.fearlessphotographers.com/" },
  { title: "WPPI Award", href: "https://www.wppionline.com/" },
  { title: "One Eyeland Award", href: "https://oneeyeland.com/" },
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

/* The same equal-area side as the Collaborations marquee's marks (50 in
   page.tsx), so the two logo runs read at one size. */
const PRESS_LOGO_SIDE = 50;

/* The "Featured in" mastheads under the awards — off for now. */
const SHOW_PRESS = false;

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
        <ul className="col-span-12 flex flex-col gap-3 md:col-span-8 md:gap-4">
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
    <section id="recognition" className={`works shell ${className}`}>
      {/* Both labels are Selected work's eyebrow, so the section takes
          `works` for the marker colour. Label, headline and the doc's two intro sentences (columns 5–7)
          stacked over the award rows and mastheads (5–10), all starting on
          the About statements' line above. All copy verbatim from the
          document's AWARDS & RECOGNITION section. */}
      <div className="grid-12 gap-y-10 md:gap-y-14">
        {/* The separator above the section: the same hairline the About
            numbers sit under, on the content measure so it stays clear of
            the pinned portrait. */}
        <div aria-hidden className="col-span-12 border-t border-rule md:col-start-5 md:col-span-6" />

        {/* mt tops the row gap up to the About copy's gap above its
            numbers (mt-16 / md:mt-24), so the rules sit symmetrically. */}
        <div className="col-span-12 mt-6 flex flex-col gap-3 md:col-start-5 md:col-span-3 md:mt-10 md:gap-4">
          <Reveal>
            <p className="works_eyebrow">
              <span aria-hidden className="works_eyebrow_marker" />
              <span className="works_eyebrow_text">Recognition</span>
            </p>
          </Reveal>
          <Reveal>
            <h2 className="max-w-[18ch] text-[clamp(1.5rem,2.6vw,2.25rem)] font-semibold leading-[1.15] tracking-[-0.03em]">
              It&rsquo;s always lovely when the work gets appreciated
            </h2>
          </Reveal>
          <Reveal>
            {/* The document's two sentences, set as one paragraph. */}
            <p className="text-[17px] leading-[1.5] text-muted">
              I&rsquo;ve been fortunate to receive recognition for my photography and filmmaking
              over the years. It&rsquo;s encouraging, especially when the recognition comes for
              projects that my team and I have spent so much time working on.
            </p>
          </Reveal>
        </div>

        <div className="col-span-12 md:col-start-5 md:col-span-6">
          {/* The footer navigation's rows — the dotted-rule li
              (.footer_nav_li), the .footer_nav_text row inside it, the
              .footer_hover_row interaction (fill inverts, label slides
              right, the arrow eases in from its blur) — but at the type of
              the section above: text-statement, the size and weight the
              About statements are set in, in place of the nav's --f-h3 at
              500. The arrow is the footer navigation's RightArrow, and the
              row takes its inline padding so the inverted fill insets from
              the label the same way. Each row is an anchor to the award's
              site, opening in a new tab. The list's dotted top rule closes
              the first row the way each row's own bottom rule does. */}
          <ul className="border-t border-dotted border-rule">
            {AWARDS.map((award, i) => (
              <Reveal as="li" key={award.title} delay={i * 60} className="footer_nav_li">
                <a
                  href={award.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer_nav_text footer_hover_row about_type cursor-pointer !py-4 !text-statement md:!py-5"
                >
                  <span className="footer_hover_label">{award.title}</span>
                  <span aria-hidden className="footer_nav_arrow">
                    <RightArrow className="inline-arrow" />
                  </span>
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </Reveal>
            ))}
          </ul>
          <Reveal className="mt-6 md:mt-8">
            {/* One line from 80rem: it runs past the awards' measure into
                the empty columns beside them rather than wrapping. Below
                that there is too little room beside them, so it wraps. */}
            <p className="text-[17px] leading-[1.5] text-muted min-[80rem]:whitespace-nowrap">
              {/* The film opens on Big Short Films' YouTube; the contest
                  on YES Foundation's site, which runs it. */}
              Big Short Films&rsquo;{" "}
              <a
                href={watchUrl(BIRDMAN_ID)}
                target="_blank"
                rel="noopener noreferrer"
                className="link-wipe font-medium text-foreground"
              >
                Birdman
                <span className="sr-only"> (opens in a new tab)</span>
              </a>{" "}
              was also recognised at the{" "}
              <a
                href="https://www.yesfoundation.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="link-wipe font-medium text-foreground"
              >
                YES I AM THE CHANGE
                <span className="sr-only"> (opens in a new tab)</span>
              </a>{" "}
              social film contest.
            </p>
          </Reveal>

          {/* Hidden for now — set SHOW_PRESS to true to restore it. */}
          {SHOW_PRESS && (
            <>
              {/* Featured in — the mastheads in one quiet run on the same
                  measure, monochrome via .brand-wall__logo; no rules, no cells. */}
              <Reveal className="mt-12 md:mt-16">
                <p className="works_eyebrow">
                  <span aria-hidden className="works_eyebrow_marker" />
                  <span className="works_eyebrow_text">Featured in</span>
                </p>
              </Reveal>
              <Reveal className="mt-6 md:mt-8">
                {/* Half the Collaborations marquee's gap, so the four marks sit
                    close as one run. One row from 62rem. */}
                <ul className="flex flex-wrap items-center gap-x-[clamp(1.75rem,3.5vw,3.5rem)] gap-y-8 min-[62rem]:flex-nowrap">
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
            </>
          )}
        </div>
      </div>
    </section>
  );
}
