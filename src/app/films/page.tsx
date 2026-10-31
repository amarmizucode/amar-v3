import type { Metadata } from "next";
import { FilmsIndex } from "./FilmsIndex";
import { SiteFooter } from "@/components/SiteFooter";
import { ALL_FILMS } from "@/lib/documentary";

export const metadata: Metadata = {
  title: "Films",
  description:
    "Culture of India: a growing documentary archive of the crafts, rituals, festivals and art forms of India's living culture - Kalamkari, Jamakkalam, Madurai Sungudi, Bidri, the mridangam makers and more - directed and filmed by Amar Ramesh, alongside the Big Short Films archive of real, inspiring stories.",
};

/*
 * bymonolog.com/work's layout: a counted heading over a rule, a sticky
 * filter column, and a grid of cover cards. No SmoothScroll — the filter
 * column is `position: sticky`, which cannot engage inside ScrollSmoother's
 * transformed content — so the page scrolls natively, footer and all.
 */
export default function Page() {
  return (
    <>
      <FilmsIndex films={ALL_FILMS} />
      <SiteFooter />
    </>
  );
}
