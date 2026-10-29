import { writeFileSync, mkdirSync } from "node:fs";

/**
 * Generates local placeholder images so every media slot has real content
 * until production photography lands. Deterministic, dependency-free, and
 * self-contained (no external host, so nothing breaks offline).
 */

const OUT = "public/assets/placeholders";
mkdirSync(OUT, { recursive: true });

// Muted, photographic palettes — warm earth tones suiting the subject matter.
const PALETTES = [
  ["#3b2a24", "#8c5a3c", "#c89b6a"],
  ["#22303a", "#3f6b7d", "#8fb3c0"],
  ["#3a2b33", "#7b4b5c", "#c48a9a"],
  ["#2c3327", "#5c6f45", "#a3b57e"],
  ["#3a3126", "#7a6440", "#c4a874"],
  ["#2a2733", "#544e75", "#9a92c0"],
  ["#33231f", "#7d4034", "#c47f68"],
  ["#1f2e2b", "#3d6b60", "#88b5a6"],
  ["#332c1f", "#6f6134", "#b8a76a"],
  ["#2b2530", "#5f4a6b", "#a98fb5"],
];

/** Deterministic pseudo-random so output is stable across runs. */
function rng(seed) {
  let s = seed * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function svg(w, h, seed, label) {
  const [dark, mid, light] = PALETTES[seed % PALETTES.length];
  const r = rng(seed + 1);
  const id = `g${seed}`;

  // A few soft blobs give each image its own "composition".
  const blobs = Array.from({ length: 5 }, (_, i) => {
    const cx = Math.round(r() * w);
    const cy = Math.round(r() * h);
    const rad = Math.round((0.18 + r() * 0.3) * Math.min(w, h));
    const fill = [light, mid, dark][i % 3];
    const op = (0.18 + r() * 0.3).toFixed(2);
    return `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${fill}" opacity="${op}"/>`;
  }).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${dark}"/>
      <stop offset="55%" stop-color="${mid}"/>
      <stop offset="100%" stop-color="${light}"/>
    </linearGradient>
    <filter id="b${seed}"><feGaussianBlur stdDeviation="${Math.round(Math.min(w, h) * 0.06)}"/></filter>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#${id})"/>
  <g filter="url(#b${seed})">${blobs}</g>
  <rect width="${w}" height="${h}" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="1"/>
  ${label ? `<text x="24" y="${h - 24}" font-family="KH Teka,system-ui,sans-serif" font-size="${Math.max(12, Math.round(h * 0.035))}" fill="rgba(255,255,255,.72)" font-weight="500">${label}</text>` : ""}
</svg>`;
}

const FILES = [
  // [name, width, height, seed, label]
  // Titles already sit beside these slots in the layout — no baked-in text.
  ["showreel", 1472, 631, 0, ""],
  ["work-1", 726, 415, 1, ""],
  ["work-2", 726, 415, 2, ""],
  ["work-3", 726, 415, 3, ""],
  ["work-4", 726, 415, 4, ""],
  ["venture-1", 722, 415, 5, ""],
  ["venture-2", 722, 415, 6, ""],
  ["venture-3", 722, 415, 7, ""],
  ["venture-4", 722, 415, 8, ""],
  ["venture-5", 722, 415, 9, ""],
  // Service panels carry their label as a DOM overlay, so no baked-in text.
  ["service-1", 472, 590, 1, ""],
  ["service-2", 472, 590, 3, ""],
  ["service-3", 472, 590, 5, ""],
  ["service-4", 472, 590, 7, ""],
  ["service-5", 472, 590, 9, ""],
  ["service-6", 472, 590, 2, ""],
  ["gap", 512, 640, 6, ""],
  ["faq", 313, 313, 4, ""],
  ["avatar-1", 108, 108, 3, ""],
  ["avatar-2", 108, 108, 8, ""],
];

for (const [name, w, h, seed, label] of FILES) {
  writeFileSync(`${OUT}/${name}.svg`, svg(w, h, seed, label));
}

console.log(`Wrote ${FILES.length} placeholders to ${OUT}`);
