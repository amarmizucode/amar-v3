/**
 * Optical left alignment per initial.
 *
 * A glyph's outline starts inset from its box by its left side bearing, so a
 * word set flush to a grid line still looks indented. Measured from the
 * KH Teka Medium OTF (unitsPerEm 1000) by reading each glyph's xMin:
 *
 *   A V W X Y (diagonals)                 6-10 -> 0.0080em
 *   J T                                     21 -> 0.0210em
 *   Z                                       30 -> 0.0300em
 *   C G O Q S (round)                       34 -> 0.0340em
 *   U                                       63 -> 0.0630em
 *   B D E F H I K L M N P R (flat-sided)    68 -> 0.0680em
 *
 * The correction has to follow the initial rather than being one constant: a
 * round cap needs half the pull of a flat-sided one, so a single value leaves
 * some glyphs overhanging and others still indented.
 */

const NARROW = new Set(["A", "V", "W", "X", "Y"]);
const ROUND = new Set(["C", "G", "O", "Q", "S"]);
const T_LIKE = new Set(["T", "J"]);
const U_LIKE = new Set(["U"]);
const Z_LIKE = new Set(["Z"]);

/** Returns the optical-* class that sets `text` flush to its grid line. */
export function opticalClass(text: string) {
  const initial = text.trim().charAt(0).toUpperCase();
  if (NARROW.has(initial)) return "optical-A";
  if (ROUND.has(initial)) return "optical-round";
  if (T_LIKE.has(initial)) return "optical-T";
  if (U_LIKE.has(initial)) return "optical-U";
  if (Z_LIKE.has(initial)) return "optical-Z";
  return "optical-flat";
}
