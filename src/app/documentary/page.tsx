import type { Metadata } from "next";
import { DocumentaryCinema } from "@/components/DocumentaryCinema";
import { FILMS } from "@/lib/documentary";

export const metadata: Metadata = {
  title: "Documentary — Amar Ramesh",
  description:
    "Culture of India: a growing documentary archive of the crafts, rituals, festivals and art forms of India's living culture — Kalamkari, Jamakkalam, Madurai Sungudi, Bidri, the mridangam makers and more — all directed and filmed by Amar Ramesh.",
};

/*
 * Like the photography index, this page is a single non-scrolling viewport —
 * no SiteFooter, no SmoothScroll. The fixed site header from the root layout
 * sits on top; the cinema's top band leaves room for it.
 */
export default function Page() {
  return <DocumentaryCinema films={FILMS} />;
}
