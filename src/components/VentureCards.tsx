import { CornerArrow } from "@/components/Arrows";
import { logoWidth } from "@/components/Highlights";

export type VentureCard = {
  title: string;
  blurb: string;
  /** Where the venture leads: its own site, or a page on this one. */
  href: string;
  linkLabel: string;
  /** `white` knocks a dark single-colour mark out to white for the black
      band. */
  logo: { src: string; ratio: number; weight?: number; white?: boolean };
};

/* Equal-area logos, as the brand wall and press table: the side of the
   square each mark's area matches. */
const LOGO_SIDE = 56;

const isExternal = (href: string) => /^https?:\/\//i.test(href);

/**
 * The ventures as a row of cards: each venture's own logo on top, then its
 * name and line set as the reference's principles list (`about_values_*`),
 * and the link to it at the foot. The whole card is the link.
 *
 * One column on a phone, two from 30rem, three from 62rem, all five in a row
 * from 80rem. External sites open in a new tab; an internal path stays a
 * plain same-tab anchor so the route curtain picks it up.
 */
export function VentureCards({ ventures }: { ventures: VentureCard[] }) {
  return (
    <ul className="venture_cards">
      {ventures.map((v) => {
        const external = isExternal(v.href);
        const width = logoWidth(v.logo.ratio, v.logo.weight ?? 1, LOGO_SIDE);
        return (
          <li key={v.title} className="flex">
            <a
              href={v.href}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="venture_card group/venture"
            >
              <span className="venture_logo">
                <img
                  src={v.logo.src}
                  alt={`${v.title} logo`}
                  width={width}
                  height={Math.round(width / v.logo.ratio)}
                  loading="lazy"
                  decoding="async"
                  className={v.logo.white ? "is-white" : undefined}
                  style={{ width }}
                />
              </span>

              <div className="venture_body">
                <h3 className="venture_title">{v.title}</h3>
                <p className="venture_p">{v.blurb}</p>
              </div>

              <span className="venture_link">
                {v.linkLabel}
                <CornerArrow
                  tight
                  className="w-2.5 shrink-0 transition-transform duration-300 group-hover/venture:translate-x-0.5 group-hover/venture:-translate-y-0.5"
                />
                {external && <span className="sr-only"> (opens in a new tab)</span>}
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
