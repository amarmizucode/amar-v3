import type { MetadataRoute } from "next";
import { GALLERIES } from "@/lib/photography";
import { SITE_URL } from "@/lib/site";

/** Every prerendered route. A sitemap needs absolute URLs, so it is empty
 *  until NEXT_PUBLIC_SITE_URL is set (see lib/site). */
export default function sitemap(): MetadataRoute.Sitemap {
  if (!SITE_URL) return [];
  const paths = [
    "/",
    "/photography",
    "/books",
    "/documentary",
    ...GALLERIES.map((gallery) => `/photography/${gallery.slug}`),
  ];
  return paths.map((path) => ({ url: `${SITE_URL}${path}` }));
}
