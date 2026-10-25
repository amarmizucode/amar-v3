/**
 * Stand-in photography for slots that do not yet have real work in them.
 *
 * These are remote Unsplash URLs, chosen per section subject, replacing the
 * blurred gradient SVGs that were here before. `photo(id, w, h)` builds a
 * cropped, compressed URL; swap a value for a local `/assets/...` path as
 * each real image lands.
 */
import { assetUrl } from "./assetUrl";

const photo = (id: string, w: number, h: number) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

export const MEDIA = {
  // Works — documentary subjects.
  work1: photo("photo-1524492412937-b28074a5d7da", 1200, 1000), // culture / India
  work2: photo("photo-1573496359142-b8d87734a5a2", 1200, 1000), // portrait of a woman
  work3: photo("photo-1524230572899-a752b3835840", 1200, 1000), // heritage architecture
  work4: photo("photo-1548013146-72479768bada", 1200, 1000), // temple

  // Ventures.
  venture1: photo("photo-1554048612-b6a482bc67e5", 1000, 750), // photography studio
  venture2: photo("photo-1485846234645-a62644f84728", 1000, 750), // film
  venture3: photo("photo-1481627834876-b7833e8f5570", 1000, 750), // publishing
  venture4: photo("photo-1522202176988-66273c2fd55f", 1000, 750), // mentorship
  venture5: photo("photo-1523275335684-37898b6baf30", 1000, 750), // product

  // Single slots.
  // Sized for the desktop letterbox; object-cover crops it to 3/4 on mobile.
  showreel: photo("photo-1497366216548-37526070297c", 1600, 1200),
  // Light-toned, so the black heading reads over it (measured luminance ~153).
  gap: photo("photo-1520962880247-cfaf541c8724", 512, 640),
  // Amar himself, beside "Chat with Amar" — the same portrait the About
  // block and the closing CTA use. Its frame takes the photo's own 4:5.
  faq: assetUrl("/assets/amar-ramesh.jpg"),

  // Closing CTA backdrop — the reference's `cta_home_visual`. Uses the same
  // local portrait as the About section rather than a stock photo.
  ctaBg: assetUrl("/assets/amar-ramesh.jpg"),

  // People.

  avatar1: photo("photo-1507003211169-0a1dd7228f2d", 108, 108),
  avatar2: photo("photo-1494790108377-be9c29b29330", 108, 108),

  // Services carousel.
  services: [
    photo("photo-1452587925148-ce544e77e70d", 900, 1100),
    photo("photo-1512470876302-972faa2aa9a4", 900, 1100),
    photo("photo-1492691527719-9d1e07e534b4", 900, 1100),
    photo("photo-1503095396549-807759245b35", 900, 1100),
    photo("photo-1542038784456-1ea8e935640e", 900, 1100),
    photo("photo-1516035069371-29a1b244cc32", 900, 1100),
  ],
} as const;
