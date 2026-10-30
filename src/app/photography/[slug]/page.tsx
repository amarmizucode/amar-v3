import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GalleryCanvas } from "@/components/GalleryCanvas";
import { GALLERIES, galleryBySlug } from "@/lib/photography";

/** The set is fixed and known at build time, so every gallery prerenders,
 *  and any other slug is a 404 — in dev too, matching the static export. */
export const dynamicParams = false;

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
    title: `${gallery.title} - Photography`,
    description: gallery.blurb,
    // The cover is already an absolute bucket URL, so it needs no domain.
    openGraph: { title: gallery.title, description: gallery.blurb, images: [gallery.cover] },
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

  return (
    <>
      <main id="main" className="relative h-svh overflow-hidden">
        <GalleryCanvas gallery={gallery} />
      </main>
    </>
  );
}
