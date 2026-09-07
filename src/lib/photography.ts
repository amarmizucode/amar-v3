/**
 * Photography galleries.
 *
 * The photographs come from `public/assets/photography/<Folder>/…`, one folder
 * per gallery. `scripts/gen-photography.py` turns those originals into web
 * copies under `photography-web/` and writes `photography.manifest.json` with
 * each frame's real dimensions; this file adds the copy — order, titles,
 * blurbs, intros — on top of that manifest. Re-run the script after adding or
 * removing photos; edit the copy here.
 */
import manifest from "./photography.manifest.json";

export type Frame = {
  /** 480px long edge: the gallery canvas tiles. */
  thumb: string;
  /** 1200px long edge: the carousel cover and the viewer card. */
  src: string;
  /** 2400px long edge: the lightbox. */
  full: string;
  width: number;
  height: number;
  /** Aspect ratio of the slot, as a CSS `aspect-ratio` value. */
  ratio: string;
  caption?: string;
};

export type Gallery = {
  slug: string;
  index: string;
  title: string;
  /** Short genre label. */
  category: string;
  /** One line under the title. */
  blurb: string;
  /** Longer standfirst, gallery page only. */
  intro: string;
  cover: string;
  frames: Frame[];
};

type ManifestGallery = (typeof manifest)[number];

/** Gallery copy, keyed by the source folder's slug. Order here is the site order. */
const COPY: Array<{
  folder: string;
  slug: string;
  title: string;
  category: string;
  blurb: string;
  intro: string;
}> = [
  {
    folder: "studio-a",
    slug: "weddings",
    title: "Weddings",
    category: "Studio A",
    blurb: "Seven hundred weddings across twenty-two countries, through Studio A.",
    intro:
      "A wedding is the one day a family agrees to be photographed exactly as it is. The work is to stay close enough to catch that, and far enough back that nobody performs for the lens.",
  },
  {
    folder: "classical-dancers",
    slug: "classical-dancers",
    title: "Classical Dancers",
    category: "Dance",
    blurb: "Bharatanatyam, Kuchipudi and the discipline behind a single frame.",
    intro:
      "A dancer holds a position for a fraction of a second and it carries two thousand years of grammar. Photographing it means knowing the form well enough to anticipate where the line will resolve.",
  },
  {
    folder: "folk-art-set-2",
    slug: "folk-art",
    title: "Folk Art",
    category: "Folk",
    blurb: "Therukoothu, Karagattam, Poikkal Kudhirai — the forms that never left the street.",
    intro:
      "Folk performance happens at night, in a village square, lit by whatever is available. No stage, no rehearsal, no second take. These are the forms that survived without institutions.",
  },
  {
    folder: "musicians",
    slug: "musicians",
    title: "Musicians",
    category: "Music",
    blurb: "Ilaiyaraaja, Carnatic vocalists, and the hands that keep the rhythm.",
    intro:
      "Musicians are photographed badly more often than anyone. The frame usually catches the instrument and misses the listening — the half second before an artist knows where the phrase is going.",
  },
  {
    folder: "temples",
    slug: "temples",
    title: "Temples",
    category: "Architecture",
    blurb: "Gopurams, corridors, and the people who keep the buildings alive.",
    intro:
      "A temple is not architecture standing still. It is a working building with a morning and an evening, and photographing it properly means being there for both.",
  },
  {
    folder: "chettinad-collections",
    slug: "chettinad",
    title: "Chettinad",
    category: "Heritage",
    blurb: "Mansions, Athangudi tile, and a merchant culture held in ninety-six villages.",
    intro:
      "The Chettinad Project is the longest-running body of work here. Burma teak, Belgian glass, Italian marble and local lime — houses built by a trading community that brought the world home, now largely empty.",
  },
  {
    folder: "art-form",
    slug: "art-form",
    title: "Art Form",
    category: "Craft",
    blurb: "Makers and their work — the crafts still practised by hand.",
    intro:
      "Every craft here is older than the person practising it. The photographs are of the hands as much as the object, because the object outlives the hands and rarely records them.",
  },
  {
    folder: "nature",
    slug: "nature",
    title: "Nature",
    category: "Landscape",
    blurb: "Landscapes and weather, from the Western Ghats to the coast.",
    intro:
      "Landscape is the slowest subject. Nothing here was made in a hurry; most of it was made by waiting for the light to do what it was always going to do.",
  },
  {
    folder: "travel",
    slug: "travel",
    title: "Travel",
    category: "Travel",
    blurb: "Places, passed through with a camera.",
    intro:
      "Travel work is the least planned of all of it — a day in a place with nothing to deliver. These are the frames that stayed.",
  },
  {
    folder: "wild-life",
    slug: "wildlife",
    title: "Wildlife",
    category: "Wildlife",
    blurb: "Animals on their own terms, in their own places.",
    intro:
      "With wildlife the subject decides everything: distance, timing, whether there is a photograph at all. The work is patience and a long lens.",
  },
];

const byFolder = new Map<string, ManifestGallery>(manifest.map((g) => [g.slug, g]));

const toFrame = (f: ManifestGallery["frames"][number]): Frame => ({
  thumb: f.thumb,
  src: f.src,
  full: f.full,
  width: f.width,
  height: f.height,
  ratio: `${f.width} / ${f.height}`,
});

/** Portrait frames suit the carousel's 4:5 slot; fall back to the first frame. */
const pickCover = (frames: Frame[]) =>
  (frames.find((f) => f.height > f.width) ?? frames[0]).src;

export const GALLERIES: Gallery[] = COPY.flatMap((copy, i) => {
  const source = byFolder.get(copy.folder);
  if (!source || !source.frames.length) return [];
  const frames = source.frames.map(toFrame);
  return [
    {
      slug: copy.slug,
      index: String(i + 1).padStart(2, "0"),
      title: copy.title,
      category: copy.category,
      blurb: copy.blurb,
      intro: copy.intro,
      cover: pickCover(frames),
      frames,
    },
  ];
});

/** Lookup by slug, for the `[slug]` route. */
export const galleryBySlug = (slug: string) =>
  GALLERIES.find((gallery) => gallery.slug === slug);
