/**
 * Books published through Mara Labs (maralabs.in), all photographed and
 * written by Amar Ramesh.
 *
 * The catalogue is mirrored from the Mara Labs store: one folder per book
 * under `public/assets/books/<slug>/` holding `cover.jpg` plus `plate-N.jpg`
 * product shots, downloaded at 1200px from the store's CDN. Unlike the
 * photography, these few dozen images are small enough to live in the repo
 * and serve from `public/` directly — no R2, no manifest. The copy here is
 * the site's own; prices and availability follow the store.
 */
export type Book = {
  slug: string;
  index: string;
  title: string;
  /** Short subject label, as the photography galleries carry. */
  category: string;
  /** One line under the title on the shelf. */
  blurb: string;
  /** Longer standfirst, detail view only. */
  description: string;
  /** Store price in INR. */
  price: number;
  /** False once the store lists the run as sold out. */
  available: boolean;
  /** The book's page on the Mara Labs store. */
  buyUrl: string;
  cover: string;
  /** Additional product shots, in store order. */
  plates: string[];
  /**
   * The shelf's book art: a flat spine strip (`spine.webp`) and flat
   * front-cover artwork (`cover-art.jpg`), supplied per book. The ratios are
   * each image's width/height; `heightRatio` is this book's height relative
   * to the tallest of the set (the spine strips are height-matched), so the
   * shelf keeps the books' real formats and relative sizes.
   */
  art: {
    spine: string;
    cover: string;
    spineRatio: number;
    coverRatio: number;
    heightRatio: number;
  };
};

/** Book copy, in shelf order — the store's own, newest first. */
const COPY: Array<{
  slug: string;
  title: string;
  category: string;
  blurb: string;
  description: string;
  price: number;
  available: boolean;
  plateCount: number;
  art: { spineRatio: number; coverRatio: number; heightRatio: number };
}> = [
  {
    slug: "perura-pateesa",
    title: "Perura Pateesa",
    category: "Temples",
    blurb: "The Perur Pateeswarar temple, recorded in stone, light and living ritual.",
    description:
      "A photographic and scholarly record of the Perur Pateeswarar temple near the Noyyal river - its mythology, its dynastic layers, and the Kanaka Sabha, one of only five dance halls of Nataraja. Bilingual in English and Tamil, and made to be returned to rather than displayed.",
    price: 3800,
    available: true,
    plateCount: 2,
    art: { spineRatio: 0.0854, coverRatio: 0.8287, heightRatio: 0.9314 },
  },
  {
    slug: "bhavani-jamakkalam",
    title: "Bhavani Jamakkalam",
    category: "Textiles",
    blurb: "The handwoven carpet of Bhavani, and the community that sustains it.",
    description:
      "Made with the craftsmen of Bhavani, alongside Kumaraguru Institutions and the Shakti initiative, this book follows the Jamakkalam - the bold striped cotton of the Kongu region - from dye vat to loom. A study of a working tradition: skill, cooperation and inherited knowledge, and what it takes to keep them.",
    price: 2499,
    available: true,
    plateCount: 4,
    art: { spineRatio: 0.0868, coverRatio: 0.7182, heightRatio: 0.9005 },
  },
  {
    slug: "madras-margazhi",
    title: "Madras Margazhi",
    category: "Music",
    blurb: "Fifty Carnatic legends, framed in the city that keeps their music.",
    description:
      "Fifty legendary Carnatic musicians, each photographed in black and white inside a landmark of the city their music belongs to. An ode to Chennai in the sacred month of Margazhi, where devotion and melody intertwine and every shadow tells a tale.",
    price: 1000,
    available: false,
    plateCount: 5,
    art: { spineRatio: 0.0955, coverRatio: 1.0,    heightRatio: 0.8471 },
  },
  {
    slug: "stones-and-stories",
    title: "Stones & Stories",
    category: "Temples",
    blurb: "Thirteen hundred years of the Kanchi Kailasanathar temple.",
    description:
      "The Kanchi Kailasanathar temple has stood for thirteen hundred years, greeting kings and queens with the same magnificence. These photographs walk its sculptures, paintings and sacred pathways - chaos and calm coexisting in a space where every stone holds a story waiting to be discovered.",
    price: 1000,
    available: false,
    plateCount: 3,
    art: { spineRatio: 0.0979, coverRatio: 1.0,    heightRatio: 0.8333 },
  },
  {
    slug: "aranga",
    title: "Aranga",
    category: "Dance",
    blurb: "Fifty Bharatanatyam dancers, photographed beyond the stage.",
    description:
      "The Madras Margazhi project continued, from musicians to dancers: fifty eminent Bharatanatyam artists photographed in the everyday spaces where the work actually happens. Practice, discipline and repetition - the routines that sustain an artistic life, recorded as a lived process.",
    price: 1199,
    available: true,
    plateCount: 2,
    art: { spineRatio: 0.0831, coverRatio: 0.8092, heightRatio: 0.9657 },
  },
  {
    slug: "pudhu-mandapam",
    title: "Pudhu Mandapam",
    category: "Architecture",
    blurb: "Madurai's seventeenth-century hall of 124 carved granite pillars.",
    description:
      "A journey through Madurai's Pudhu Mandapam, the seventeenth-century masterpiece whose 124 intricately carved granite pillars narrate legendary stories - Thiruvilayadal among them. Architectural brilliance and cultural memory, photographed pillar by pillar, where every stone has a story to tell.",
    price: 4800,
    available: true,
    plateCount: 6,
    art: { spineRatio: 0.0913, coverRatio: 0.768,  heightRatio: 0.9012 },
  },
  {
    slug: "mogappu",
    title: "Mogappu",
    category: "Chettinad",
    blurb: "The grand portals of Chettinad mansions, facade by facade.",
    description:
      "Mogappu - 'the arrangement of the face' - is more than an entrance to a Chettinad mansion; it is a statement of wealth, devotion and artistic mastery. This book collects the grandest of those street-facing facades, the Therukadhavu, doorway by doorway, before they fade.",
    price: 2800,
    available: true,
    plateCount: 4,
    art: { spineRatio: 0.0816, coverRatio: 1.0,    heightRatio: 1.0 },
  },
  {
    slug: "kolli-kannu",
    title: "Kolli Kannu",
    category: "Folk Art",
    blurb: "Drishti figures - the painted guardians that watch over Tamil homes.",
    description:
      "A journey into Drishti painting: the striking guardian figures placed on walls to ward off evil. Origins, meanings and a living tradition, in photographs and reflective writing - a preservation of the memory, belief and imagination that still watch over the homes, streets and temples of Tamil Nadu.",
    price: 2400,
    available: true,
    plateCount: 5,
    art: { spineRatio: 0.088,  coverRatio: 1.0242, heightRatio: 0.8656 },
  },
];

export const BOOKS: Book[] = COPY.map((copy, i) => ({
  slug: copy.slug,
  index: String(i + 1).padStart(2, "0"),
  title: copy.title,
  category: copy.category,
  blurb: copy.blurb,
  description: copy.description,
  price: copy.price,
  available: copy.available,
  buyUrl: `https://maralabs.in/products/${copy.slug}`,
  cover: `/assets/books/${copy.slug}/cover.jpg`,
  art: {
    spine: `/assets/books/${copy.slug}/spine.webp`,
    cover: `/assets/books/${copy.slug}/cover-art.jpg`,
    ...copy.art,
  },
  plates: Array.from(
    { length: copy.plateCount },
    (_, n) => `/assets/books/${copy.slug}/plate-${n + 1}.jpg`,
  ),
}));
