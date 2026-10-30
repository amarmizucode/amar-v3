import { CornerArrow } from "@/components/Arrows";

/**
 * Filled CTA pill — the reference's `button_wrap`. The label slides up on
 * hover while a text-shadow duplicate rises into its place, and the arrow
 * pair travels diagonally; see the `.btn-pill*` rules in globals.css.
 *
 * Colour and type are the nav's everywhere: the `--button-*` pairs keyed on
 * `data-theme-nav` / `data-theme-section` in globals.css, and
 * `text-style-small` metrics. Nothing is sized per call site.
 *
 * Renders a link by default; pass `type` to get a real form button instead.
 */
export function CtaPill({
  label,
  href = "#contact",
  className = "",
  onClick,
  type,
}: {
  label: string;
  href?: string;
  className?: string;
  onClick?: () => void;
  type?: "submit" | "button";
}) {
  const content = (
    <>
      <span className="btn-pill_text_contain">
        <span className="btn-pill_text">{label}</span>
      </span>
      <span className="btn-pill_aside" aria-hidden>
        <span className="btn-pill_aside_bg" />
        <CornerArrow className="btn-pill_icon" />
        <CornerArrow className="btn-pill_icon is-absolute" />
      </span>
    </>
  );
  return type ? (
    <button type={type} onClick={onClick} className={`btn-pill cursor-pointer ${className}`}>
      {content}
    </button>
  ) : (
    <a href={href} onClick={onClick} className={`btn-pill ${className}`}>
      {content}
    </a>
  );
}
