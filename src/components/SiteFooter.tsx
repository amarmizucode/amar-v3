import { CornerArrow, RightArrow } from "@/components/Arrows";
import { SectionLabel } from "@/components/SectionLabel";
import { AI_SERVICES, AiIcon, aiHref } from "@/components/AiIcons";

/* The copy document's footer navigation, in its order. Work and Ventures are
   home-page sections; the rest are pages. */
const NAV_FOOTER = [
  "Work",
  "Photography",
  "Films",
  "Books",
  "Ventures",
  "Contact",
];

/** Where each footer nav item points. Most are home-page anchors. */
const NAV_HREF: Record<string, string> = {
  Work: "/#works",
  Photography: "/photography",
  Films: "/documentary",
  Books: "/books",
  Ventures: "/#ventures",
  Contact: "/#contact",
};

/*
 * Footer socials. Facebook and Linkedin are confirmed; the Instagram handle is
 * still a placeholder awaiting the real profile URL.
 */
export const SOCIALS = [
  { label: "Instagram", href: "https://www.instagram.com/amarramesh/" },
  { label: "Linkedin", href: "https://in.linkedin.com/in/amarramesh" },
  { label: "Facebook", href: "https://www.facebook.com/amarramesh.me/" },
];

/**
 * Site footer. Sizing ported from the reference `footer_*` blocks: padded by
 * --site-margin rather than the page shell, top row split 6 / 5 of 12 columns
 * at a 1rem gutter, nav rows full-width on a dotted rule. See the footer
 * section in globals.css.
 */
export function SiteFooter() {
  return (
  <footer className="footer_wrap_main relative">
    <div className="footer_wrap">
      <div className="footer_top">
        {/* 6 columns: eyebrow above the nav list. */}
        <div className="footer_eyebrow">
          <SectionLabel>Navigation</SectionLabel>

          <nav>
            <ul className="footer_nav_ul">
              {NAV_FOOTER.map((item) => (
                <li key={item} className="footer_nav_li">
                  <a
                    href={NAV_HREF[item]}
                    className="footer_nav_text footer_hover_row"
                  >
                    <span className="footer_hover_label">{item}</span>
                    <span aria-hidden className="footer_nav_arrow">
                      <RightArrow className="inline-arrow" />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* 5 columns, offset by one. Holds three flex:1 sibling
            blocks that wrap: details and socials share the first line,
            the AI chips wrap onto a second beneath the details. */}
        <div className="footer_aside_contain">
          <div className="footer_aside_details">
            <p className="footer_top_text">(Personal details)</p>

            <div className="footer_middle_wrap">
              <a
                href="mailto:hello@amarramesh.com"
                className="footer_email footer_hover_row is-inline-row flex w-fit items-center gap-[0.3em] self-start"
              >
                <span className="footer_hover_label">hello@amarramesh.com</span>
                <span className="footer_hover_marker flex items-center">
                  <CornerArrow className="inline-arrow" />
                </span>
              </a>
              <p className="footer_address text-muted">
                Based in Chennai, India and Working Worldwide.
              </p>
            </div>
          </div>

          <div className="footer_aside_details">
            <p className="footer_top_text">(Socials)</p>
            <ul className="footer_socials_ul">
              {SOCIALS.map((social) => (
                <li
                  key={social.label}
                  className="footer_socials_li footer_hover_row is-inline-row"
                >
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer_lead flex items-center gap-[0.3em]"
                  >
                    <span className="footer_hover_label">{social.label}</span>
                    <span className="footer_hover_marker flex items-center">
                      <CornerArrow className="inline-arrow" />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer_aside_details">
            <p className="footer_top_text">(Ask AI About Me)</p>
{/* 2.5em squares on their own font size, laid out at space--1. The
                glyph fills the chip edge-to-edge, as the reference sets it. */}
            <div className="footer_middle_wrap is-ai text-[16px]">
              {AI_SERVICES.map((service) => (
                <a
                  key={service.name}
                  href={aiHref(service.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`Ask ${service.label} about Amar Ramesh`}
                  className="footer_ai_link"
                >
                  <span className="sr-only">
                    Ask {service.label} about Amar Ramesh
                  </span>
                  <AiIcon name={service.name} instance="footer" className="h-full w-full" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar, section-space--main below the top row. */}
      <div className="footer_bottom">
        <div className="grid-12 pb-2 pt-6 text-[15px]">
          <span className="col-span-6 md:col-span-4">© 2026, AMAR RAMESH</span>
          <a
            href="#top"
            className="link-wipe col-span-6 justify-self-end md:col-start-6 md:col-span-3 md:justify-self-start"
          >
            Back to top ↑
          </a>
        </div>

        <div className="grid-12">
          <span className="display optical-A col-span-12 md:col-span-4">Amar</span>
          <span className="display optical-R col-span-12 md:col-span-8">
            Ramesh
          </span>
        </div>
      </div>
    </div>
  </footer>
  );
}
