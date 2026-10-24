import type { ReactNode } from "react";

/** Section eyebrow: a filled dot beside a short label. The dot takes the
 * text colour, so the label works on the inverted bands too. */
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-3 text-[17px] font-semibold tracking-[-0.03em]">
      <span aria-hidden className="size-2 shrink-0 rounded-full bg-current" />
      {children}
    </p>
  );
}
