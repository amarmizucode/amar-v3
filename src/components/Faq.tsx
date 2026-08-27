"use client";

import { useState } from "react";

import { opticalClass } from "@/lib/optical";

export type FaqItem = { q: string; a: string };

export function Faq({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="border-t border-rule">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={`${item.q}-${i}`} className="border-b border-rule">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className={`footer_hover_row group flex w-full items-center justify-between gap-4 py-4 text-left sm:gap-6${
                isOpen ? " is-active" : ""
              }`}
            >
              {/* Flush to the column edge, with the initial's left side
                  bearing corrected so it reads on the line optically too. */}
              <span
                className={`footer_hover_label flex-1 text-left text-[17px] font-semibold tracking-[-0.03em] md:text-[19px] ${opticalClass(
                  item.q,
                )}`}
              >
                {item.q}
              </span>
              <span
                aria-hidden
                className={`footer_hover_marker shrink-0 text-[18px] leading-none text-muted ${
                  isOpen ? "is-open" : ""
                }`}
              >
                +
              </span>
            </button>

            {/* Grid-rows trick animates to the content's natural height. */}
            <div
              className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <p className="p-4 max-w-[60ch] text-[15px] leading-[1.6] text-muted">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
