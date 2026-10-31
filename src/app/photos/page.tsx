import type { Metadata } from "next";
import { PhotosIndex } from "./PhotosIndex";
import { SiteFooter } from "@/components/SiteFooter";
import { GALLERIES } from "@/lib/photography";

export const metadata: Metadata = {
  title: "Photos",
  description:
    "Ten bodies of work: weddings, classical dancers, folk art, musicians, temples, Chettinad, art forms, nature, travel and wildlife.",
};

/*
 * The films page's layout (WorkIndex) over the photography galleries. No
 * SmoothScroll, for the same reason: the filter column is `position: sticky`,
 * which cannot engage inside ScrollSmoother's transformed content.
 */
export default function Page() {
  return (
    <>
      <PhotosIndex galleries={GALLERIES} />
      <SiteFooter />
    </>
  );
}
