import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GalleryCanvas } from "@/components/GalleryCanvas";
import { GALLERIES, galleryBySlug } from "@/lib/photography";

/** The set is fixed and known at build time, so every gallery prerenders. */
export function generateStaticParams() {
  return GALLERIES.map((gallery) => ({ slug: gallery.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/photography/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const gallery = galleryBySlug(slug);
  if (!gallery) return {};

  return {
    title: `${gallery.title} — Photography — Amar Ramesh`,
    description: gallery.blurb,
  };
}

/*
 * One non-scrolling viewport: the gallery's frames tiled on an endless canvas
 * that is dragged around, and a viewer that a click opens. The site header
 * comes from the root layout; the page has no footer, as the reference has none.
 */
export default async function GalleryPage({ params }: PageProps<"/photography/[slug]">) {
  const { slug } = await params;
  const gallery = galleryBySlug(slug);
  if (!gallery) notFound();

  // Wraps, so the last gallery leads back to the first.
  const position = GALLERIES.indexOf(gallery);
  const next = GALLERIES[(position + 1) % GALLERIES.length];
  const prev = GALLERIES[(position - 1 + GALLERIES.length) % GALLERIES.length];

  return (
    <>
      <main className="relative h-svh overflow-hidden">
        <GalleryCanvas gallery={gallery} next={next} prev={prev} />
      </main>
    </>
  );
}
