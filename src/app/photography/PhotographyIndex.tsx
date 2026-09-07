"use client";

import { useLayoutEffect, useRef } from "react";
import { GalleryCarousel } from "@/components/GalleryCarousel";
import type { Gallery } from "@/lib/photography";

/**
 * Photography index, following the iamrossmason.com layout: one viewport that
 * does not scroll, the filmstrip across the upper half and a wordmark along
 * the bottom that the strip's active slide hangs over.
 *
 * The site's own fixed header sits on top; the strip's top band leaves room
 * for it.
 */
export function PhotographyIndex({ galleries }: { galleries: Gallery[] }) {
  return (
    <>
      <main className="relative isolate h-svh overflow-hidden">
        <h1 className="sr-only">Photography — Amar Ramesh</h1>

        {/* Beneath the strip, so the active slide hangs over it. */}
        <div
          className="pcar-wordmark pointer-events-none absolute inset-x-0 bottom-0 z-0"
          style={{ padding: "0 var(--site-margin) var(--site-margin)" }}
        >
          <Wordmark>Photography</Wordmark>
        </div>

        <div className="absolute inset-0 z-10">
          <GalleryCarousel items={galleries} />
        </div>
      </main>
    </>
  );
}

/**
 * One word set to fill the measure. The text is measured at a known size and
 * scaled to the container width, capped by viewport height so it reads as a
 * band along the bottom rather than swallowing the page on wide screens.
 */
function Wordmark({ children }: { children: string }) {
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
