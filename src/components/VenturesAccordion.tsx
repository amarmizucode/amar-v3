"use client";

import { useState } from "react";
import { CornerArrow } from "@/components/Arrows";

export type Venture = {
  area: string;
  title: string;
  blurb: string;
  image: string;
  /** Where the venture leads: its own site, or a page on this one. */
  href: string;
  /** The link's label on the open card, e.g. "maralabs.in". */
  linkLabel: string;
};

const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";

const isExternal = (href: string) => /^https?:\/\//i.test(href);

/**
 * The ventures as an expanding accordion: one band of photo strips, the open
 * venture wide with its name and line, the rest narrow with their names set
 * vertically. The last one opened stays open, so the band never collapses.
 *
 * Every strip is a link to the venture. Opening and following are kept
 * apart so a tap meant to open a strip never navigates away: a mouse opens a
 * strip on hover and follows it on click; on touch, which has no hover, the
 * first tap opens it and the second follows. Only a mouse pointer and
 * keyboard focus (`:focus-visible`) open on approach — a tap also fires
 * pointer-enter and focus just before its click, and letting those open the
 * strip would make that same tap navigate.
 *
 * From md the strips sit side by side and the open one takes five shares of
 * the width to the others' one. Below md they stack: the open card tall, the
 * rest as short labelled bars.
 *
 * External sites open in a new tab; an internal path, should one be given,
 * stays a plain same-tab anchor so the route curtain picks it up.
 */
export function VenturesAccordion({ ventures }: { ventures: Venture[] }) {
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col gap-2 md:h-[26rem] md:flex-row">
      {ventures.map((v, i) => {
        const on = i === active;
        const num = String(i + 1).padStart(2, "0");
        const external = isExternal(v.href);
        return (
          <a
            key={v.title}
            href={v.href}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            aria-expanded={on}
            aria-label={`${v.title} — ${v.area}. ${external ? `Opens ${v.linkLabel} in a new tab` : `Go to ${v.linkLabel}`}`}
            onClick={(e) => {
              // A closed strip opens first; only the open one is followed.
              if (!on) {
                e.preventDefault();
                setActive(i);
              }
            }}
            onPointerEnter={(e) => {
              if (e.pointerType === "mouse") setActive(i);
            }}
            onFocus={(e) => {
              if (e.currentTarget.matches(":focus-visible")) setActive(i);
            }}
            className={`group relative block min-w-0 cursor-pointer overflow-hidden bg-chip text-left text-white transition-[flex-grow,height] duration-700 motion-reduce:transition-none md:h-auto ${EASE} ${
              on ? "h-[18rem] md:flex-[5]" : "h-[4.5rem] md:flex-[1]"
            }`}
          >
            <img
              src={v.image}
              alt=""
              loading="lazy"
              decoding="async"
              className={`absolute inset-0 h-full w-full object-cover transition-transform duration-700 motion-reduce:transition-none ${EASE} ${
                on ? "scale-100" : "scale-110"
              }`}
            />
            {/* Closed strips are evenly dimmed so their names read; the open
                one darkens only toward the foot, behind its copy. */}
            <span
              aria-hidden
              className={`absolute inset-0 transition-colors duration-500 ${
                on ? "bg-linear-to-t from-black/85 via-black/25 to-transparent" : "bg-black/55"
              }`}
            />
            {/* And a light band at the head of the open card, behind its
                number and area — a bright sky would otherwise swallow them. */}
            <span
              aria-hidden
              className={`absolute inset-x-0 top-0 h-24 bg-linear-to-b from-black/45 to-transparent transition-opacity duration-500 ${
                on ? "opacity-100" : "opacity-0"
              }`}
            />

            {/* Number and area, top left — on the open card everywhere, and on
                the closed strips from md, where they have the height for it. */}
            <span
              className={`absolute left-4 top-4 text-[12px] font-medium tabular-nums text-white/80 transition-opacity duration-300 md:left-5 md:top-5 ${
                on ? "opacity-100" : "opacity-0 md:opacity-100"
              }`}
            >
              {num} &middot; {v.area}
            </span>

            {/* Phone, closed: a one-line bar — name left, number right. */}
            <span
              aria-hidden
              className={`absolute inset-0 flex items-center justify-between gap-4 px-4 transition-opacity duration-300 md:hidden ${
                on ? "opacity-0" : "opacity-100"
              }`}
            >
              <span className="text-[17px] font-semibold tracking-[-0.03em]">{v.title}</span>
              <span className="text-[12px] font-medium tabular-nums text-white/70">{num}</span>
            </span>

            {/* md+, closed: the name set vertically up the strip. */}
            <span
              aria-hidden
              className={`absolute bottom-5 left-4 hidden rotate-180 whitespace-nowrap text-[20px] font-semibold tracking-[-0.03em] transition-opacity duration-300 [writing-mode:vertical-rl] md:block ${
                on ? "opacity-0" : "opacity-100"
              }`}
            >
              {v.title}
            </span>

            {/* Open: name, line and where it leads, at the foot. A fixed
                minimum width on md, so the copy does not reflow while the
                strip widens under it — the strip's own overflow clips it until
                there is room, and it fades in after the widening is under way. */}
            <span
              className={`absolute inset-x-0 bottom-0 flex flex-col gap-2 p-4 transition-[opacity,transform] duration-500 md:min-w-[26rem] md:p-6 ${
                on ? "translate-y-0 opacity-100 delay-200" : "pointer-events-none translate-y-2 opacity-0"
              }`}
            >
              <span className="text-[clamp(1.5rem,2.2vw,2.25rem)] font-semibold leading-[1.1] tracking-[-0.03em]">
                {v.title}
              </span>
              <span className="max-w-[44ch] text-[14px] leading-[1.5] text-white/80 md:text-[15px]">
                {v.blurb}
              </span>
              <span className="mt-1 flex w-fit items-center gap-[0.4em] border-b border-white/40 pb-0.5 text-[13px] font-medium transition-colors duration-300 group-hover:border-white">
                {v.linkLabel}
                <CornerArrow className="w-[0.75em] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </span>
          </a>
        );
      })}
    </div>
  );
}
