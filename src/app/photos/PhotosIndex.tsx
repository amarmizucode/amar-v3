"use client";

import { useState } from "react";
import { PhotoLightbox } from "@/components/PhotoLightbox";
import { usePrintRequest } from "@/components/PrintRequest";
import { WorkIndex, type WorkItem } from "@/components/WorkIndex";
import type { Gallery } from "@/lib/photography";

/** The add-to-prints mark: a plus, turning to a tick once saved. */
function AddIcon({ saved }: { saved: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 32 32"
      fill="currentColor"
      aria-hidden
    >
      {saved ? (
        <path d="m13 24-9-9 1.41-1.41L13 21.17 26.59 7.59 28 9z" />
      ) : (
        <path d="M17 15V8h-2v7H8v2h7v7h2v-7h7v-2z" />
      )}
    </svg>
  );
}

/**
 * Photos index — WorkIndex over every photograph, filtered by gallery. Each
 * image keeps its own ratio in masonry columns (`natural` covers), and a
 * click opens it in the lightbox, which steps through that gallery. The
 * corner button saves the frame to the print requests, under the same
 * `slug#index` id the gallery viewer uses, so a pick made in either place
 * shows in both.
 */
export function PhotosIndex({ galleries }: { galleries: Gallery[] }) {
  const [open, setOpen] = useState<{ gallery: number; frame: number } | null>(null);
  const prints = usePrintRequest();

  const filters = [
    { key: "all", label: "All photos" },
    ...galleries.map((g) => ({ key: g.slug, label: g.title })),
  ];

  const items: WorkItem[] = galleries.flatMap((gallery, g) =>
    gallery.frames.map((frame, f) => {
      const id = `${gallery.slug}#${f}`;
      const saved = prints.has(id);
      return {
        key: frame.src,
        label: `${gallery.title}, photograph ${f + 1} - open`,
        cover: frame.src,
        ratio: frame.ratio,
        facets: [gallery.slug],
        onOpen: () => setOpen({ gallery: g, frame: f }),
        action: (
          <button
            type="button"
            aria-pressed={saved}
            aria-label={`${saved ? "Remove from" : "Add to"} print requests: ${gallery.title}, photograph ${f + 1}`}
            title={saved ? "Saved for print" : "Request a print"}
            onClick={() =>
              prints.toggle({
                id,
                gallery: gallery.title,
                index: gallery.index,
                slug: gallery.slug,
                frame: f + 1,
                file: frame.file,
                thumb: frame.thumb,
                ref: frame.src,
              })
            }
            className="wi-action"
          >
            <AddIcon saved={saved} />
          </button>
        ),
      };
    }),
  );

  const current = open ? galleries[open.gallery] : null;

  return (
    <WorkIndex
      heading="All photos"
      filterLabel="Filter by category"
      filters={filters}
      items={items}
      cover="natural"
    >
      <PhotoLightbox
        frames={current?.frames ?? []}
        index={open?.frame ?? null}
        caption={current?.title ?? ""}
        onStep={(frame) => setOpen((o) => (o ? { ...o, frame } : o))}
        onClose={() => setOpen(null)}
      />
    </WorkIndex>
  );
}
