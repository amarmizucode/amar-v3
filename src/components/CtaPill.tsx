import { CornerArrow } from "@/components/CornerArrow";

/**
 * Filled CTA pill — the reference's `button_wrap`. The label slides up on
 * hover while a text-shadow duplicate rises into its place, and the arrow
 * pair travels diagonally; see the `.btn-pill*` rules in globals.css.
 *
 * Colour comes from `--button-surface` / `--button-ink` / `--button-aside` /
 * `--button-arrow` on any ancestor, as on the reference; unset, the pill is
 * the page's inversion.
 */
export function CtaPill({
  label,
  href = "#contact",
  /** Tailwind size class; the pill's padding and arrow are em-based so they scale with it. */
  size = "text-[15px]",
  className = "",
  onClick,
}: {
  label: string;
  href?: string;
  size?: string;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={`btn-pill font-medium tracking-[-0.03em] ${size} ${className}`}
    >
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
