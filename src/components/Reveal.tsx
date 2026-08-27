import type { ElementType, ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Retained for call-site compatibility; no longer used. */
  delay?: number;
  as?: ElementType;
};

/**
 * Layout wrapper. This used to lift its children in on scroll; that reveal was
 * dropped, so it now renders them immediately and only carries `className`.
 *
 * The `delay` prop is kept so the existing call sites still typecheck — it has
 * no effect.
 */
export function Reveal({ children, className = "", as: Tag = "div" }: RevealProps) {
  return <Tag className={className}>{children}</Tag>;
}
