/**
 * The documentary filmography — every long-form film on the Culture of India
 * channel (youtube.com/@cultureofindiaofficial), all of it directed and
 * filmed by Amar.
 *
 * Kept as a static module rather than fetched from the YouTube API: the
 * channel adds a film every few weeks at most, and a hand-curated list keeps
 * the titles, blurbs and ordering editorial rather than whatever the API
 * returns. Add new films to the top of `FILMS`.
 *
 * Thumbnails come straight off YouTube's image CDN. Every id below serves the
 * 1280×720 `maxresdefault` variant; a newly added film that does not can fall
 * back to `hqdefault`.
 */

export const CHANNEL = {
  name: "Culture of India",
  handle: "@cultureofindiaofficial",
  url: "https://www.youtube.com/@cultureofindiaofficial",
};

export type Film = {
  /** YouTube video id. */
  id: string;
  title: string;
  /** Shorter cut of the title for the display band, where the full one overflows. */
  short?: string;
  blurb: string;
  /** Running time as shown on the player, m:ss. */
  duration: string;
  year: number;
};

export const thumbUrl = (id: string) => `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
export const watchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;

/** Newest first, matching the channel's own ordering. */
export const FILMS: Film[] = [
  {
    id: "WkmSubDKuO4",
    title: "The Art of Leather Puppetry",
    blurb:
      "Behind a lit screen, leather comes alive — the carving, perforating and performance that keep a shadow-puppet tradition moving.",
    duration: "8:25",
    year: 2026,
  },
  {
    id: "jRWeOPEcuJA",
    title: "Sankalpa Golu",
    blurb:
      "A larger-than-life Navaratri golu where traditional craftsmanship and contemporary design invoke the many forms of Shakti.",
    duration: "6:41",
    year: 2026,
  },
  {
    id: "VneovR3g3Us",
    title: "Sengal Soolai",
    blurb:
      "Earth, fire and human hands — a glimpse into the kilns and the quiet labour held inside the making of a brick.",
    duration: "0:39",
    year: 2026,
  },
  {
    id: "JesDPmDEueo",
    title: "Vaidyagrama Ayurveda",
    blurb:
      "At Vaidyagrama, Ayurveda is not a system of medicine so much as a knowledge of life — a way of paying attention to how we live.",
    duration: "4:44",
    year: 2026,
  },
  {
    id: "NMlUpYL-UUE",
    title: "Krishna McKenzie",
    blurb:
      "He arrived in Auroville at nineteen. At Annapurna Farm he found stillness, joy and a sense of bhakti — and a place to belong.",
    duration: "7:07",
    year: 2026,
  },
  {
    id: "rKaBb2PU0wI",
    title: "Balaramapuram Handlooms",
    blurb:
      "In Balaramapuram, weaving is knowledge passed hand to hand — the fine cottons woven into Kerala's cultural fabric.",
    duration: "7:07",
    year: 2026,
  },
  {
    id: "KRqO8ND9uCs",
    title: "Mridangam",
    blurb:
      "We hear the mridangam in every Carnatic concert. This film is about the people who make it — from wood to skin to pitch.",
    duration: "7:46",
    year: 2026,
  },
  {
    id: "9k23OTRYy9M",
    title: "Silambam",
    blurb:
      "A stick, a rhythm, a discipline — the Tamil martial art that is movement and memory passed from hand to hand.",
    duration: "0:45",
    year: 2026,
  },
  {
    id: "wpQd13kvkZo",
    title: "Beneath Our Feet",
    blurb:
      "A documentary on biochar — soil carbon, depleted land, and the living system beneath our feet that farming depends on.",
    duration: "8:57",
    year: 2026,
  },
  {
    id: "NToJUa_4ZfY",
    title: "Panchaa — Honest Hand Dhotis",
    blurb:
      "In the tribal village of Chuliaposi, Mayurbhanj, women artisans revive the nearly forgotten Santali weave of Odisha.",
    duration: "12:51",
    year: 2026,
  },
  {
    id: "fYR_CjzvKXo",
    title: "Panchaa — Where Revival Begins",
    blurb:
      "Sometimes preserving a craft begins with a single decision: an inaugural order of five thousand handwoven dhotis.",
    duration: "1:13",
    year: 2026,
  },
  {
    id: "AuArgQnZM2U",
    title: "The Last Thread",
    blurb:
      "Ponduru Khadi is one of India's finest hand-spun, handwoven textiles — every thread patience, precision and generations of craft.",
    duration: "8:23",
    year: 2026,
  },
  {
    id: "RjmAuww92w4",
    title: "Chetti Thaipoosam",
    blurb:
      "The rituals, voices and spirit behind one of the most enduring festivals — a tradition carried in every step.",
    duration: "6:26",
    year: 2026,
  },
  {
    id: "ik3tc5eeTU8",
    title: "An Allegory",
    blurb:
      "The artist as witness, as vessel, as the ground where culture takes root — from epic to everyday, the truth persists.",
    duration: "4:38",
    year: 2026,
  },
  {
    id: "ks-MPN3ZdAw",
    title: "Bidri Craft",
    blurb:
      "In the historic town of Bidar, metal meets soil and contrast becomes identity — a craft shaped over centuries.",
    duration: "6:59",
    year: 2026,
  },
  {
    id: "6c_i4EoUaq4",
    title: "Kalamkari — The Language of Ink & Cloth",
    short: "Kalamkari",
    blurb:
      "Bamboo pens trace epics onto river-washed cloth, and natural dyes bring gods, myths and memory to life.",
    duration: "12:02",
    year: 2026,
  },
  {
    id: "_E54IpWrrrg",
    title: "The Revival of Jamakkalam",
    blurb:
      "The handwoven mat that carried colour, comfort and community across Tamil floors — and the looms bringing it back.",
    duration: "9:03",
    year: 2026,
  },
  {
    id: "0Mi9fc4BF2A",
    title: "Sabarimala Dolly",
    blurb:
      "On a pilgrimage that tests endurance, some journeys are carried on the shoulders of others — an act of faith, compassion and quiet strength.",
    duration: "8:45",
    year: 2026,
  },
  {
    id: "mNtzbuAC4cA",
    title: "Madurai Sungudi",
    blurb:
      "In the old dye streets of Madurai, women dot dreams onto fabric — thousands of tiny knots, each one almost sacred.",
    duration: "15:45",
    year: 2025,
  },
  {
    id: "2jlCq2MwZ0U",
    title: "Pattamadai Pai",
    blurb:
      "From the banks of the Tamirabarani, a mat born not from machines but from memory — handwoven from korai grass.",
    duration: "6:21",
    year: 2025,
  },
  {
    id: "SX_zVy3KV0A",
    title: "Poo Chakra Kodai",
    blurb:
      "A temple umbrella handwoven in devotion — silk, bamboo and thread carrying colours that never fade.",
    duration: "4:36",
    year: 2025,
  },
  {
    id: "QyugQe32OzQ",
    title: "Thenneera",
    blurb:
      "Coconut sap drawn at dawn by skilled hands — not just a drink, but a tradition of patience and trust in the tree.",
    duration: "10:45",
    year: 2025,
  },
  {
    id: "1m9TwPGugvU",
    title: "Dear Ratnam",
    blurb:
      "A tribute to K. V. Ratnam of Rajahmundry, the visionary behind India's first Swadeshi fountain pen.",
    duration: "6:45",
    year: 2025,
  },
];
