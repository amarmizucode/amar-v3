"use client";

import { useLayoutEffect, useRef } from "react";

/**
 * One word set to fill the measure — the band along the bottom of the
 * photography and books index pages. The text is measured at a known size and
 * scaled to the container width, capped by viewport height so it reads as a
 * band along the bottom rather than swallowing the page on wide screens.
 */
export function Wordmark({ children }: { children: string }) {
  const box = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const fit = () => {
      const el = text.current;
      const wrap = box.current;
      if (!el || !wrap) return;
      // `width: max-content`, so the paragraph's box is the text's width.
      el.style.fontSize = "100px";
      const ratio = el.getBoundingClientRect().width / 100;
      el.style.fontSize = `${Math.min(wrap.clientWidth / ratio, window.innerHeight * 0.26)}px`;
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  return (
    <div ref={box}>
      <p
        ref={text}
        aria-hidden
        className="w-max select-none whitespace-nowrap font-semibold uppercase leading-[0.8] tracking-[-0.04em]"
      >
        {children}
      </p>
    </div>
  );
}
