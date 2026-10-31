import type { Metadata } from "next";
import { CtaPill } from "@/components/CtaPill";
import { Eyebrow } from "@/components/Eyebrow";
import { ImageTrail } from "@/components/ImageTrail";
import { TRAIL_IMAGES } from "@/lib/photography";

export const metadata: Metadata = {
  title: "Page not found",
};

/*
 * The exported 404.html, which Workers serves for any unknown path (see
 * `not_found_handling` in wrangler.toml). Set in the home page's section
 * type: the eyebrow, a section heading and the CTA pill back home, on the
 * About band's content columns (5–10), with Work with me's image trail
 * following the cursor across the page.
 */
export default function NotFound() {
  return (
    <main id="main" className="relative isolate flex min-h-svh flex-col justify-center overflow-clip py-32">
      {/* Positioned (z-0), so it paints over the copy's non-positioned grid;
          the pill lifts above it (z-10) and stays unobscured. */}
      <ImageTrail images={TRAIL_IMAGES} />
      <div className="works shell grid-12 w-full">
        <div className="col-span-12 flex flex-col items-start gap-6 md:col-start-5 md:col-span-6">
          <Eyebrow>404</Eyebrow>
          <h1 className="section_heading max-w-[18ch]">This page could not be found.</h1>
          <p className="works_p max-w-[40ch]">
            The link may be old, or the page may have moved. Everything is still a click away from
            the home page.
          </p>
          <CtaPill label="Back to Home" href="/" className="relative z-10" />
        </div>
      </div>
    </main>
  );
}
