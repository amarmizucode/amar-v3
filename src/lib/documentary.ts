/**
 * The documentary filmography, from two channels: every long-form film on
 * the Culture of India channel (youtube.com/@cultureofindiaofficial), all of
 * it directed and filmed by Amar, and the Big Short Films archive
 * (youtube.com/@BIGshortFILMS), produced by his Studio A.
 *
 * Kept as a static module rather than fetched from the YouTube API: the
 * channel adds a film every few weeks at most, and a hand-curated list keeps
 * the titles, blurbs and ordering editorial rather than whatever the API
 * returns. Add new films to the top of `FILMS`.
 *
 * Thumbnails come straight off YouTube's image CDN. Every id below serves the
 * 1280×720 `maxresdefault` variant; a newly added film that does not falls
 * back to `hqdefault` on its own (see FilmCarousel).
 */

export type Channel = { name: string; handle: string; url: string };

export const CHANNEL: Channel = {
  name: "Culture of India",
  handle: "@cultureofindiaofficial",
  url: "https://www.youtube.com/@cultureofindiaofficial",
};

export const BSF_CHANNEL: Channel = {
  name: "Big Short Films",
  handle: "@BIGshortFILMS",
  url: "https://www.youtube.com/@BIGshortFILMS",
};

export type Film = {
  /** YouTube video id. */
  id: string;
  title: string;
  /**
   * Display title for the index list, where the reference keeps every row to
   * a word or three so the list stays narrow. Omitted when the full title is
   * already that short; the player caption always shows the full title.
   */
  short?: string;
  blurb: string;
  /** Running time as shown on the player, m:ss. */
  duration: string;
  year: number;
  /**
   * The video's native frame, read off its highest upload format. Omitted
   * means 16:9, which most films are — the stage hugs whatever ratio a
   * film declares.
   */
  aspect?: [number, number];
};

export const thumbUrl = (id: string) => `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
export const watchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;

/**
 * Newest first, matching the channel's own ordering. Sengal Soolai
 * (VneovR3g3Us) and Silambam (9k23OTRYy9M) are left out while they are
 * private on YouTube: they can't embed, and serve no thumbnail.
 */
export const FILMS: Film[] = [
  {
    id: "WkmSubDKuO4",
    title: "The Art of Leather Puppetry",
    short: "Leather Puppetry",
    blurb:
      "Behind a lit screen, leather comes alive - the carving, perforating and performance that keep a shadow-puppet tradition moving.",
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
    id: "JesDPmDEueo",
    title: "Vaidyagrama Ayurveda",
    blurb:
      "At Vaidyagrama, Ayurveda is not a system of medicine so much as a knowledge of life - a way of paying attention to how we live.",
    duration: "4:44",
    year: 2026,
  },
  {
    id: "NMlUpYL-UUE",
    title: "Krishna McKenzie",
    blurb:
      "He arrived in Auroville at nineteen. At Annapurna Farm he found stillness, joy and a sense of bhakti - and a place to belong.",
    duration: "7:07",
    year: 2026,
  },
  {
    id: "rKaBb2PU0wI",
    title: "Balaramapuram Handlooms",
    short: "Balaramapuram",
    blurb:
      "In Balaramapuram, weaving is knowledge passed hand to hand - the fine cottons woven into Kerala's cultural fabric.",
    duration: "7:07",
    year: 2026,
  },
  {
    id: "KRqO8ND9uCs",
    title: "Mridangam",
    blurb:
      "We hear the mridangam in every Carnatic concert. This film is about the people who make it - from wood to skin to pitch.",
    duration: "7:46",
    year: 2026,
  },
  {
    id: "wpQd13kvkZo",
    title: "Beneath Our Feet",
    blurb:
      "A documentary on biochar - soil carbon, depleted land, and the living system beneath our feet that farming depends on.",
    duration: "8:57",
    year: 2026,
  },
  {
    id: "NToJUa_4ZfY",
    title: "Panchaa - Honest Hand Dhotis",
    short: "Panchaa Dhotis",
    blurb:
      "In the tribal village of Chuliaposi, Mayurbhanj, women artisans revive the nearly forgotten Santali weave of Odisha.",
    duration: "12:51",
    year: 2026,
  },
  {
    id: "fYR_CjzvKXo",
    title: "Panchaa - Where Revival Begins",
    short: "Panchaa Revival",
    aspect: [4, 3],
    blurb:
      "Sometimes preserving a craft begins with a single decision: an inaugural order of five thousand handwoven dhotis.",
    duration: "1:13",
    year: 2026,
  },
  {
    id: "AuArgQnZM2U",
    title: "The Last Thread",
    blurb:
      "Ponduru Khadi is one of India's finest hand-spun, handwoven textiles - every thread patience, precision and generations of craft.",
    duration: "8:23",
    year: 2026,
  },
  {
    id: "RjmAuww92w4",
    title: "Chetti Thaipoosam",
    blurb:
      "The rituals, voices and spirit behind one of the most enduring festivals - a tradition carried in every step.",
    duration: "6:26",
    year: 2026,
  },
  {
    id: "ik3tc5eeTU8",
    title: "An Allegory",
    blurb:
      "The artist as witness, as vessel, as the ground where culture takes root - from epic to everyday, the truth persists.",
    duration: "4:38",
    year: 2026,
  },
  {
    id: "ks-MPN3ZdAw",
    title: "Bidri Craft",
    blurb:
      "In the historic town of Bidar, metal meets soil and contrast becomes identity - a craft shaped over centuries.",
    duration: "6:59",
    year: 2026,
  },
  {
    id: "6c_i4EoUaq4",
    title: "Kalamkari - The Language of Ink & Cloth",
    short: "Kalamkari",
    blurb:
      "Bamboo pens trace epics onto river-washed cloth, and natural dyes bring gods, myths and memory to life.",
    duration: "12:02",
    year: 2026,
  },
  {
    id: "_E54IpWrrrg",
    title: "The Revival of Jamakkalam",
    short: "Jamakkalam",
    blurb:
      "The handwoven mat that carried colour, comfort and community across Tamil floors - and the looms bringing it back.",
    duration: "9:03",
    year: 2026,
  },
  {
    id: "0Mi9fc4BF2A",
    title: "Sabarimala Dolly",
    blurb:
      "On a pilgrimage that tests endurance, some journeys are carried on the shoulders of others - an act of faith, compassion and quiet strength.",
    duration: "8:45",
    year: 2026,
  },
  {
    id: "mNtzbuAC4cA",
    title: "Madurai Sungudi",
    blurb:
      "In the old dye streets of Madurai, women dot dreams onto fabric - thousands of tiny knots, each one almost sacred.",
    duration: "15:45",
    year: 2025,
  },
  {
    id: "2jlCq2MwZ0U",
    title: "Pattamadai Pai",
    blurb:
      "From the banks of the Tamirabarani, a mat born not from machines but from memory - handwoven from korai grass.",
    duration: "6:21",
    year: 2025,
  },
  {
    id: "SX_zVy3KV0A",
    title: "Poo Chakra Kodai",
    blurb:
      "A temple umbrella handwoven in devotion - silk, bamboo and thread carrying colours that never fade.",
    duration: "4:36",
    year: 2025,
  },
  {
    id: "QyugQe32OzQ",
    title: "Thenneera",
    blurb:
      "Coconut sap drawn at dawn by skilled hands - not just a drink, but a tradition of patience and trust in the tree.",
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

/**
 * Big Short Films — real, inspiring stories, one film at a time. Newest
 * first, like the channel. Left out on purpose: the trailer, behind-the-scenes
 * and channel-promo cuts, the alternate-language and alternate-edit
 * duplicates (Time Collector in Tamil, Time Traveler in Hindi, the second
 * Children of Paradise), and Kudil and School for Change, which YouTube only
 * plays signed in, so an embed can't.
 *
 * Several of the 2020–24 films are cut in scope (~2.39:1 or 2.35:1) and
 * Handmade Happiness is vertical; each declares its frame below.
 */
export const BSF_FILMS: Film[] = [
  {
    id: "7jyqXgRq9G4",
    title: "Vaidyagrama - Ayurveda Healing Village",
    short: "Vaidyagrama",
    blurb:
      "In India's village societies, to heal was to belong - the vaidya lived among the people they treated, and care grew out of shared life.",
    duration: "15:29",
    year: 2026,
  },
  {
    id: "KfjgwQKVF9k",
    title: "Thaipoosam - On the Trails of Aandi",
    short: "Trails of Aandi",
    blurb:
      "Pilgrims walk hundreds of kilometres across weeks, through sun and rain, to Murugan, the runaway god of Palani - a 400-year-old test of faith.",
    duration: "39:27",
    year: 2025,
  },
  {
    id: "aWGS-a4PwMA",
    title: "Paramount Textiles",
    aspect: [2.39, 1],
    blurb:
      "Forty-five years of a home-linen brand that began in Thirali, near Madurai - a story of commitment, persistence and empowerment.",
    duration: "19:42",
    year: 2024,
  },
  {
    id: "dzChFYgf9iw",
    title: "The Story of the Venkatagiri Sarees",
    short: "Venkatagiri Sarees",
    aspect: [2.35, 1],
    blurb:
      "The weavers of Venkatagiri - jamdani, jala and jacquard in cotton and silk - and a cluster's effort to overcome its challenges.",
    duration: "12:41",
    year: 2023,
  },
  {
    id: "TMurTndwVrw",
    title: "The Story behind Dakshina Chitra",
    short: "Dakshina Chitra",
    blurb:
      "How did our grandparents live, build and make? The heritage museum outside Chennai that keeps South India's homes and crafts standing.",
    duration: "16:00",
    year: 2023,
  },
  {
    id: "UfeqAjkTkHs",
    title: "Handmade Happiness",
    aspect: [9, 16],
    blurb: "Artistic hand blocks, and what makes Hastha's printing even more special.",
    duration: "2:52",
    year: 2022,
  },
  {
    id: "0VDKQqHh0Cs",
    title: "Way of the Child",
    blurb:
      "Vidiyal Montessori Kalvi, bringing Montessori education into Chennai's government and corporation schools.",
    duration: "6:37",
    year: 2022,
  },
  {
    id: "v0VELTX4YVI",
    title: "Kanchipuram Silk Motifs",
    short: "Kanchipuram Silk",
    aspect: [2.39, 1],
    blurb:
      "The weaver and motif designer Krishnamoorthy, and the origins of the patterns woven into Kanchipuram silk.",
    duration: "11:11",
    year: 2022,
  },
  {
    id: "YjpmnEdwAQM",
    title: "The Story of the Karlakattai",
    short: "Karlakattai",
    aspect: [2.39, 1],
    blurb:
      "The club swung by warriors, soldiers and wrestlers for centuries - what happened to it, and who swings it today.",
    duration: "9:11",
    year: 2022,
  },
  {
    id: "ujjHbXfsz-8",
    title: "Thirunel",
    blurb:
      "A Pongal film on the indigenous rice varieties of Tamil Nadu, and the farmers keeping them in the ground.",
    duration: "19:13",
    year: 2022,
  },
  {
    id: "GkJc2UyD3aI",
    title: "Pioneer",
    aspect: [2.35, 1],
    blurb:
      "CS Ananth and Team CSA, the vintage-car restorers of Chennai - and the man who took the first step.",
    duration: "19:44",
    year: 2022,
  },
  {
    id: "BmEoet1eX-A",
    title: "Kovilpatti Kadalai Mittai",
    short: "Kadalai Mittai",
    blurb:
      "Palm jaggery and groundnuts from village festivals to a GI tag - the peanut burfi that put Kovilpatti on the map.",
    duration: "4:33",
    year: 2022,
  },
  {
    id: "5aD5hGG2IwA",
    title: "SPB Vanam",
    aspect: [2.39, 1],
    blurb:
      "A year after SPB left us, Siruthuli and the people of Coimbatore planted a garden of 74 trees in his memory.",
    duration: "2:09",
    year: 2021,
  },
  {
    id: "OY9MAjmSG4M",
    title: "Thirupacheti Aruval",
    aspect: [2.39, 1],
    blurb:
      "The famous machete of the films, and the small town near Madurai that has made it, and only it, for generations.",
    duration: "7:34",
    year: 2021,
  },
  {
    id: "l8Yux0wZog0",
    title: "Drops of Life",
    blurb:
      "Chennai's rainwater harvesting - and what a city can do about the water it already has.",
    duration: "10:14",
    year: 2021,
  },
  {
    id: "tmGmN0V9VLI",
    title: "Wooden Tales from Thammampatti",
    short: "Wooden Tales",
    blurb:
      "At the foot of the Kolli hills, a community of carvers who made temple chariots and keep the craft alive.",
    duration: "5:13",
    year: 2021,
  },
  {
    id: "OUxcwtxXia0",
    title: "Bhavani Jammakkalam",
    aspect: [2.39, 1],
    blurb:
      "The people's carpet of South India - two hundred years on Bhavani's looms, and a craft whose weavers are growing old.",
    duration: "6:50",
    year: 2021,
  },
  {
    id: "7zz-YjzpUFQ",
    title: "B for Biology",
    aspect: [2.39, 1],
    blurb:
      "Four friends without resources who reinvented how biology is taught - the hands-on story of Biota.",
    duration: "4:06",
    year: 2020,
  },
  {
    id: "Db8_ORGffgY",
    title: "The Handmade Petti",
    short: "Handmade Petti",
    aspect: [2.39, 1],
    blurb:
      "The coconut-palm basket Tamil tree climbers carry their tools in - a craft that may not outlast the trade.",
    duration: "4:58",
    year: 2020,
  },
  {
    id: "ii_T94RNeOA",
    title: "The Time Collector",
    blurb:
      "Watch mechanic Robert Kennedy and his 2,200 rare antique clocks - a hobby, rooted in a personal story, turned phenomenon.",
    duration: "4:50",
    year: 2019,
  },
  {
    id: "EFvlzdyJq-U",
    title: "Uravugal",
    blurb:
      "A young team that rescues the abandoned from the streets, and gives the unclaimed dead their funeral rites.",
    duration: "3:16",
    year: 2019,
  },
  {
    id: "tQFWhwoAa8g",
    title: "Inspiring Ilango",
    blurb: "A visually challenged man who became a visionary for millions.",
    duration: "4:04",
    year: 2019,
  },
  {
    id: "eL_LFr_Dg3U",
    title: "Aim for Seva",
    blurb: "An NGO transforming a village through education.",
    duration: "4:05",
    year: 2019,
  },
  {
    id: "M7i_S2ZMSr4",
    title: "Chennai Children's Choir",
    short: "Children's Choir",
    blurb:
      "Chennai's children's choir on its way to sing at the Serenade! choral festival in Washington DC.",
    duration: "3:37",
    year: 2018,
  },
  {
    id: "8woJ0rtXuB4",
    title: "Children of Paradise",
    blurb:
      "Schools, a health centre and open playgrounds - no one would believe Heal Paradise is an orphanage.",
    duration: "4:46",
    year: 2018,
  },
  {
    id: "T9nMzc6NNY4",
    title: "Stitching Change",
    blurb:
      "Ashwini Rajkumar left the city on a rural fellowship and started a sanitary revolution in a Gujarat village.",
    duration: "2:58",
    year: 2017,
  },
  {
    id: "fLwGPs2HlsI",
    title: "Time Traveler",
    blurb: "Anand Kumar Bhowmick and his 1,50,000 rare photographs - history documented as it was.",
    duration: "4:02",
    year: 2017,
  },
  {
    id: "KF33FxDNJsU",
    title: "Seed Ball",
    blurb: "In every seed lies a forest - five minutes, a handful of seed balls, and a throw.",
    duration: "2:26",
    year: 2017,
  },
  {
    id: "oykTD4Y9hl4",
    title: "The Birdman",
    blurb: "A camera mechanic who feeds three thousand parrots every day.",
    duration: "2:58",
    year: 2017,
  },
  {
    id: "b_4AYcIsn5s",
    title: "Rubi Teacher",
    blurb:
      "A maths teacher at a Tiruchengode government school whose learn-by-doing methods went viral.",
    duration: "3:35",
    year: 2017,
  },
  {
    id: "zksDMZTM3X8",
    title: "One Man",
    blurb:
      "Surendhar didn't wait to retire to serve - and one man's journey changed thousands of lives.",
    duration: "4:02",
    year: 2017,
  },
  {
    id: "U1jtd3MrFQM",
    title: "Voice of Trees",
    blurb:
      "Padma Shri Jadav 'Molai' Payeng, the forest man of India, who planted 1,360 acres of forest in Assam single-handedly.",
    duration: "4:52",
    year: 2017,
  },
  {
    id: "-jb47eYjK64",
    title: "Little Things",
    blurb:
      "Rajesh quit a high-paying corporate career for cooking and cows - the little things that matter in the pursuit of happiness.",
    duration: "3:25",
    year: 2017,
  },
  {
    id: "_OTUGraSod8",
    title: "Life and Jallikattu",
    blurb: "What Jallikattu is, why Tamil Nadu stood up for it, and the livelihoods tied to it.",
    duration: "9:29",
    year: 2017,
  },
  {
    id: "2_y58dYA45k",
    title: "School of Equality",
    blurb: "Seeding change, one kid at a time.",
    duration: "3:28",
    year: 2016,
  },
  {
    id: "bNuDfyhuT9o",
    title: "Bridge of Souls",
    blurb:
      "Since 1999, Mohammed Rafi has rescued abandoned people from the streets and reunited them with their families.",
    duration: "2:54",
    year: 2016,
  },
  {
    id: "GFz7DPvZeCI",
    title: "Food for Thought",
    blurb: "Bharathi Mess and its wellness mission to bring back traditional food.",
    duration: "3:21",
    year: 2016,
  },
  {
    id: "TMyuSJk4HPQ",
    title: "Maa Ulaa",
    blurb: "Balaji and India's first bike taxi ridden by differently abled people.",
    duration: "4:04",
    year: 2016,
  },
  {
    id: "Djl6cAZpSv8",
    title: "Super Cop",
    blurb:
      "Mr. Kumar, the Chennai traffic policeman who dances, sings and rules the streets with love.",
    duration: "3:11",
    year: 2016,
  },
  {
    id: "whU496OC6-w",
    title: "Surfing Dreams",
    blurb:
      "Murthy, a fisherman from Kovalam, who became a professional surfer and started his own surf school.",
    duration: "3:38",
    year: 2016,
  },
  {
    id: "T_3nxquEzjY",
    title: "A Ride to Remember",
    blurb:
      "Auto Annadurai, who turned an auto ride into an experience - newspapers, TV, an iPad and a card machine.",
    duration: "3:37",
    year: 2016,
  },
  {
    id: "Tx5yJzXsO3k",
    title: "The Richest Man on Earth",
    short: "Richest Man on Earth",
    blurb:
      "Palam Kalyanasundaram, who has given a lifetime's earnings to others and owns nothing but love.",
    duration: "3:10",
    year: 2016,
  },
  {
    id: "DLpjWaytIzc",
    title: "I Am Sai",
    blurb: "Sai Bakery, a neighbourhood initiative for adults with autism and special needs.",
    duration: "4:05",
    year: 2016,
  },
];

export type ChannelFilm = Film & { channel: Channel };

/**
 * Both channels as the documentary page lists them: one run, newest year
 * first. The sort is stable, so within a year Culture of India leads and
 * each channel keeps its own order. Each film carries its channel for the
 * player caption.
 */
export const ALL_FILMS: ChannelFilm[] = [
  ...FILMS.map((f) => ({ ...f, channel: CHANNEL })),
  ...BSF_FILMS.map((f) => ({ ...f, channel: BSF_CHANNEL })),
].sort((a, b) => b.year - a.year);
