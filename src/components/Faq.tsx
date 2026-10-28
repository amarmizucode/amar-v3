"use client";

import { useId, useState } from "react";

export type FaqItem = { q: string; a: string };

/**
 * The reference's accordion (`g_faq_list` / `accordion_css_*`): dotted rows
 * over a solid foot, each a full-width button whose ground fills beige on
 * hover or when open, with the question nudged right and the square marker
 * nudged left. One row open at a time, as its close-siblings setting.
 * Styles are the `faq_*` rules in globals.css.
 */
export function Faq({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const baseId = useId();

  return (
    <div role="list" className="faq_list">
      {items.map((item, i) => {
        const isOpen = open === i;
        const panelId = `${baseId}-${i}`;
        return (
          <div
            key={`${item.q}-${i}`}
            role="listitem"
            data-open={isOpen || undefined}
            className="faq_item"
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              aria-controls={panelId}
              className="faq_top"
            >
              <span aria-hidden className="faq_bg" />
              <h3 className="faq_q">{item.q}</h3>
              <span aria-hidden className="faq_square" />
            </button>

            <div id={panelId} inert={!isOpen} className="faq_bottom">
              <div className="faq_bottom_wrap">
                <div className="faq_contain">
                  <p className="faq_a">{item.a}</p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
