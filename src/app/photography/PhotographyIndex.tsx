"use client";

import { GalleryCarousel } from "@/components/GalleryCarousel";
import type { Gallery } from "@/lib/photography";

/**
 * Photography index, following the iamrossmason.com layout: one viewport that
 * does not scroll, with the filmstrip across the upper half. The reference's
 * wordmark along the bottom (which the active slide hung over) is removed.
 *
 * The site's own fixed header sits on top; the strip's top band leaves room
 * for it.
 */
export function PhotographyIndex({ galleries }: { galleries: Gallery[] }) {
  return (
    <>
      <main className="relative isolate h-svh overflow-hidden">
        <h1 className="sr-only">Photography — Amar Ramesh</h1>

        <div className="absolute inset-0 z-10">
          <GalleryCarousel items={galleries} />
        </div>
      </main>
    </>
  );
}
