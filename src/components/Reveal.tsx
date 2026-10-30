import type { ElementType, ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
};

/**
 * Layout wrapper. This used to lift its children in on scroll; that reveal was
 * dropped, so it now renders them immediately and only carries `className`.
 */
export function Reveal({ children, className = "", as: Tag = "div" }: RevealProps) {
  return <Tag className={className}>{children}</Tag>;
}
