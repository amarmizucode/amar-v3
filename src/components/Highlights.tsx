import { Reveal } from "@/components/Reveal";
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

/*
 * Sourced as on the home page's closing section: Fearless Photographers
 * lists five Lifetime Fearless Awards on his profile; WPPI honours and the
 * 2016 YES Bank Changemaker of the Year are from his media kit; the TEDx
 * talk is "Life Through the Lens".
 */
const AWARDS = [
  { title: "Fearless Photographers", detail: "Award" },
  { title: "WPPI", detail: "Award" },
  { title: "One Eyeland", detail: "Award" },
  { title: "YES I AM THE CHANGE", detail: "For Birdman" },
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
      <Reveal>
        <SectionLabel>Recognition</SectionLabel>
      </Reveal>
      <Reveal className="mt-3 md:mt-4">
        <h2 className="max-w-[26ch] text-[clamp(1.5rem,2.6vw,2.25rem)] font-semibold leading-[1.15] tracking-[-0.03em]">
          It&rsquo;s always lovely when the work gets appreciated
        </h2>
      </Reveal>

      <ul className="mt-8 md:mt-12">
        {AWARDS.map((item, i) => (
          <Reveal
            as="li"
            key={item.title}
            delay={i * 60}
            className="grid-12 items-baseline gap-y-1 border-b border-rule py-4 first:border-t md:py-5"
          >
            <span className="col-span-2 text-[13px] font-medium tabular-nums text-muted md:col-span-1">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="col-span-10 text-[clamp(1.35rem,2.4vw,2rem)] font-semibold leading-[1.2] tracking-[-0.03em] md:col-span-8">
              {item.title}
            </h3>
            {/* Under the title on a phone, right-aligned on the rule's far
                end from md. */}
            <span className="col-start-3 col-span-10 text-[15px] font-medium text-muted md:col-start-10 md:col-span-3 md:text-right">
              {item.detail}
            </span>
          </Reveal>
        ))}
      </ul>

      {/* Featured in — the mastheads in one quiet run across the measure,
          monochrome via .brand-wall__logo; no rules, no cells. */}
      <Reveal className="mt-14 md:mt-20">
        <SectionLabel>Featured in</SectionLabel>
      </Reveal>
      <Reveal className="mt-6 md:mt-8">
        <ul className="flex flex-wrap items-center gap-x-12 gap-y-8 md:justify-between md:gap-x-16">
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
    </section>
  );
}
