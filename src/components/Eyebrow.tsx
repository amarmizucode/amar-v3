import type { ElementType, ReactNode } from "react";

/**
 * Section eyebrow — the reference's `works_eyebrow`: a square marker beside a
 * short label. The marker takes its colour from the nearest `.works` wrapper;
 * see the `works_eyebrow*` rules in globals.css.
 */
export function Eyebrow({
  children,
  as: Tag = "p",
  className = "",
}: {
  children: ReactNode;
  /** `h2` where the eyebrow is the section's only heading. */
  as?: ElementType;
  className?: string;
}) {
  return (
    <Tag className={`works_eyebrow ${className}`.trim()}>
      <span aria-hidden className="works_eyebrow_marker" />
      <span className="works_eyebrow_text">{children}</span>
    </Tag>
  );
}
