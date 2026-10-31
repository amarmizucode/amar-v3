"use client";

import { useState } from "react";
import { FilmModal, type ModalFilm } from "@/components/FilmModal";
import { WorkIndex, type WorkItem } from "@/components/WorkIndex";
import { BSF_CHANNEL, CHANNEL, thumbUrl, type ChannelFilm } from "@/lib/documentary";

/** The reference filters by service; a film's natural facet is its channel. */
const FILTERS = [
  { key: "all", label: "All films" },
  { key: CHANNEL.handle, label: CHANNEL.name },
  { key: BSF_CHANNEL.handle, label: BSF_CHANNEL.name },
];

/**
 * Films index — WorkIndex over both channels, on 16:9 covers (YouTube's
 * thumbnail frame). A card plays its film in place in FilmModal rather than
 * leaving for YouTube.
 */
export function FilmsIndex({ films }: { films: ChannelFilm[] }) {
  const [playing, setPlaying] = useState<ModalFilm | null>(null);

  const items: WorkItem[] = films.map((film) => ({
    key: film.id,
    title: film.title,
    summary: film.blurb,
    tags: [film.channel.name, String(film.year), film.duration],
    cover: thumbUrl(film.id),
    hover: [String(film.year), "Watch film →"],
    facets: [film.channel.handle],
    onOpen: () =>
      setPlaying({
        id: film.id,
        title: film.title,
        aspect: film.aspect,
        channel: film.channel.name,
      }),
  }));

  return (
    <WorkIndex
      heading="All films"
      filterLabel="Filter by channel"
      filters={FILTERS}
      items={items}
      cover="landscape"
    >
      <FilmModal film={playing} onClose={() => setPlaying(null)} />
    </WorkIndex>
  );
}
