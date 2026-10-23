import type { Metadata } from "next";
import { BooksIndex } from "./BooksIndex";
import { BOOKS } from "@/lib/books";

export const metadata: Metadata = {
  title: "Books — Amar Ramesh",
  description:
    "Eight pictorial monographs published through Mara Labs: the temples, textiles, dancers, musicians and folk guardians of Tamil Nadu, photographed and written by Amar Ramesh.",
};

/*
 * Like the photography index, this page renders no SiteFooter: it is a single
 * non-scrolling viewport — the shelf across the middle and a wordmark along
 * the bottom that the open volume hangs over. The fixed site header comes
 * from the root layout.
 */
export default function Page() {
  return <BooksIndex books={BOOKS} />;
}
