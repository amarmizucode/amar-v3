import { CornerArrow } from "@/components/CornerArrow";

/**
 * Filled CTA pill — the reference's `button_wrap`. The label slides up on
 * hover while a text-shadow duplicate rises into its place, and the arrow
 * pair travels diagonally; see the `.btn-pill*` rules in globals.css.
 *
 * Colour and type are the nav's everywhere: the `--button-*` pairs keyed on
 * `data-theme-nav` / `data-theme-section` in globals.css, and
 * `text-style-small` metrics. Nothing is sized per call site.
 */
export function CtaPill({
  label,
  href = "#contact",
  className = "",
  onClick,
}: {
  label: string;
  href?: string;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <a href={href} onClick={onClick} className={`btn-pill ${className}`}>
      <span className="btn-pill_text_contain">
        <span className="btn-pill_text">{label}</span>
      </span>
      <span className="btn-pill_aside" aria-hidden>
        <span className="btn-pill_aside_bg" />
        <CornerArrow className="btn-pill_icon" />
        <CornerArrow className="btn-pill_icon is-absolute" />
      </span>
    </a>
  );
}
