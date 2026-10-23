"use client";

import { GalleryCarousel } from "@/components/GalleryCarousel";
import { Wordmark } from "@/components/Wordmark";
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
