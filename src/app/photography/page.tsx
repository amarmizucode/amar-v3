import type { Metadata } from "next";
import { PhotographyIndex } from "./PhotographyIndex";
import { GALLERIES } from "@/lib/photography";

export const metadata: Metadata = {
  title: "Photography",
  description:
    "Ten bodies of work: weddings, classical dancers, folk art, musicians, temples, Chettinad, art forms, nature, travel and wildlife.",
};

/*
 * This page deliberately renders no SiteFooter: the reference layout is a
 * single non-scrolling viewport carrying the filmstrip and a wordmark. The
 * fixed site header comes from the root layout.
 */
export default function Page() {
  return <PhotographyIndex galleries={GALLERIES} />;
}
