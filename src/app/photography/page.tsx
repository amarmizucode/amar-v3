import type { Metadata } from "next";
import { PhotographyIndex } from "./PhotographyIndex";
import { GALLERIES } from "@/lib/photography";

export const metadata: Metadata = {
  title: "Photography — Amar Ramesh",
  description:
    "Nine bodies of work: weddings, classical dance, folk art, musicians, portraits, black and white street photography, temples, inspiring women's stories and Chettinad.",
};

/*
 * This page deliberately renders neither SiteHeader nor SiteFooter: the
 * reference layout is a single non-scrolling viewport that carries its own top
 * bar and wordmark, and a fixed site header would sit on top of the filmstrip.
 */
export default function Page() {
  return <PhotographyIndex galleries={GALLERIES} />;
}
