import type { Metadata } from "next";
import { DocumentaryIndex } from "@/components/DocumentaryIndex";
import { ALL_FILMS } from "@/lib/documentary";

export const metadata: Metadata = {
  title: "Documentary — Amar Ramesh",
  description:
    "Culture of India: a growing documentary archive of the crafts, rituals, festivals and art forms of India's living culture — Kalamkari, Jamakkalam, Madurai Sungudi, Bidri, the mridangam makers and more — directed and filmed by Amar Ramesh, alongside the Big Short Films archive of real, inspiring stories.",
};

/*
 * A faithful copy of seyityilmaz.com: list left, sticky identity right, each
 * row floating its film over the page. Minimal like the reference — no
 * SiteFooter, and no SmoothScroll either: the sticky intro cannot engage
 * inside ScrollSmoother's transformed content, so the page scrolls natively,
 * exactly as the reference does.
 */
export default function Page() {
  return <DocumentaryIndex films={ALL_FILMS} />;
}
