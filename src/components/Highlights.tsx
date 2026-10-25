import { AwardLaurel } from "@/components/AwardLaurel";
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
  { title: "YES I AM THE CHANGE", detail: "Birdman" },
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
 * Recognition — the honours and the press, in the section grammar the rest
 * of the page speaks: a short eyebrow, the copy doc's line as the headline
 * (it was set as a 17px eyebrow before — a sentence squeezed into a label),
 * then two ruled tables sharing single hairlines with the brand wall, so
 * all the site's logo-and-mark walls read as one system.
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

      {/* The four honours, a wreath centred in each ruled cell: four across,
          pairs on a phone. */}
      <Reveal className="mt-8 md:mt-10">
        <ul className="grid grid-cols-2 border-l border-t border-rule md:grid-cols-4">
          {AWARDS.map((item) => (
            <li
              key={item.title}
              className="flex items-center justify-center border-b border-r border-rule px-5 py-8 md:px-8 md:py-10"
            >
              <AwardLaurel title={item.title} detail={item.detail} />
            </li>
          ))}
        </ul>
      </Reveal>

      {/* Featured in — the mastheads rather than a text list, in the same
          cells but shallower: the marks are wide and thin. The grayscale
          rest state and hover colour come with .brand-wall__logo. */}
      <Reveal className="mt-12 md:mt-16">
        <SectionLabel>Featured in</SectionLabel>
      </Reveal>
      <Reveal className="mt-4 md:mt-6">
        <ul className="grid grid-cols-2 border-l border-t border-rule md:grid-cols-4">
          {PRESS.map((item) => (
            <li
              key={item.name}
              className="brand-wall__cell flex aspect-[16/7] items-center justify-center border-b border-r border-rule px-6 md:aspect-[16/6]"
            >
              <img
                src={item.logo}
                alt={`${item.name} logo`}
                loading="lazy"
                decoding="async"
                width={logoWidth(item.ratio, item.weight, PRESS_LOGO_SIDE)}
                height={Math.round(logoWidth(item.ratio, item.weight, PRESS_LOGO_SIDE) / item.ratio)}
                className="brand-wall__logo h-auto max-h-[55%] w-auto max-w-[78%]"
              />
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
