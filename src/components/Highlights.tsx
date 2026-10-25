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

/* The press, set as quiet type rather than logos. */
const PRESS = ["The Hindu", "Reader's Digest", "DestinAsian", "Wedding Vows"];

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
 * Featured in and Awards as one section, side by side: the press as a
 * quiet run of names in the label column, and from column 6 the three
 * honours, each set in its laurel wreath — drawn in currentColor, so it
 * follows the theme. Each column runs under its own eyebrow; a phone
 * stacks the four blocks in that order.
 */
export function Recognition({ className = "pb-24 md:pb-36" }: { className?: string }) {
  return (
    <section id="recognition" className={`shell ${className}`}>
      <div className="grid-12 gap-y-6">
        <Reveal className="col-span-12 md:row-start-1 md:col-span-4">
          <SectionLabel>Featured in</SectionLabel>
        </Reveal>

        {/* The publications as a plain run of quiet lines — no rules, no
            logos, just the names in the small muted size. */}
        <Reveal className="col-span-12 md:row-start-2 md:col-span-4">
          <ul className="flex flex-col gap-2.5">
            {PRESS.map((name, i) => (
              <li
                key={name}
                className="flex items-baseline gap-4 text-[13px] font-medium leading-[1.4] text-muted"
              >
                <span className="tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                {name}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal className="col-span-12 mt-8 md:mt-0 md:row-start-1 md:col-start-6 md:col-span-7">
          <SectionLabel>It&rsquo;s always lovely when the work gets appreciated</SectionLabel>
        </Reveal>

        {/* Centred against the press table's height, so the wreaths sit on
            the row's middle rather than hanging from its top. */}
        <Reveal className="col-span-12 md:row-start-2 md:col-start-6 md:col-span-7 md:flex md:items-center">
          {/* All four in one horizontal run from sm, each wreath at a set
              modest width rather than splitting the whole column. A phone
              pairs them two and two. */}
          {/* w-full: the wreaths are @containers, so they report no
              intrinsic width — without an explicit width the ul would
              shrink-wrap to nothing inside its flex parent. */}
          <ul className="flex w-full flex-wrap items-start gap-x-6 gap-y-10 md:gap-x-8">
            {AWARDS.map((item) => (
              <li key={item.title} className="min-w-0 basis-[calc(50%-0.75rem)] sm:basis-[160px] sm:flex-none md:basis-[175px]">
                <AwardLaurel title={item.title} detail={item.detail} />
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
