/**
 * Optical left alignment per initial.
 *
 * A glyph's outline starts inset from its box by its left side bearing, so a
 * word set flush to a grid line still looks indented. Measured from the Inter
 * 600 `glyf` table (unitsPerEm 2048) by reading each glyph's xMin:
 *
 *   A V W (diagonals)                    50  -> 0.0244em
 *   C G O Q (round)                     103  -> 0.0503em
 *   T                                    83  -> 0.0405em
 *   S                                    95  -> 0.0464em
 *   B D E F H I L M N P R (flat-sided)  150  -> 0.0732em
 *
 * The correction has to follow the initial rather than being one constant: a
 * round cap needs ~31% less pull than a flat-sided one, so a single value
 * leaves some glyphs overhanging and others still indented.
 */

const NARROW = new Set(["A", "V", "W"]);
const ROUND = new Set(["C", "G", "O", "Q"]);
const T_LIKE = new Set(["T"]);
const S_LIKE = new Set(["S"]);

/** Returns the optical-* class that sets `text` flush to its grid line. */
export function opticalClass(text: string) {
  const initial = text.trim().charAt(0).toUpperCase();
  if (NARROW.has(initial)) return "optical-A";
  if (ROUND.has(initial)) return "optical-round";
  if (T_LIKE.has(initial)) return "optical-T";
  if (S_LIKE.has(initial)) return "optical-S";
  return "optical-flat";
}
