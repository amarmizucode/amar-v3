/**
 * Stand-in photography for slots that do not yet have real work in them.
 *
 * Only the parked "I close that gap" section (GapSection) still uses one.
 * `photo(id, w, h)` builds a cropped, compressed Unsplash URL; swap a value
 * for a local `/assets/...` path as each real image lands.
 */
const photo = (id: string, w: number, h: number) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

export const MEDIA = {
  // Light-toned, so the black heading reads over it (measured luminance ~153).
  gap: photo("photo-1520962880247-cfaf541c8724", 512, 640),
} as const;
