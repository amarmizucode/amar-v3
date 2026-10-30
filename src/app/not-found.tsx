import type { Metadata } from "next";
import { CtaPill } from "@/components/CtaPill";
import { Eyebrow } from "@/components/Eyebrow";

export const metadata: Metadata = {
  title: "Page not found",
};

/*
 * The exported 404.html, which Workers serves for any unknown path (see
 * `not_found_handling` in wrangler.toml). Set in the home page's section
 * type: the eyebrow, a section heading and the CTA pill back home.
 */
export default function NotFound() {
  return (
    <main id="main" className="works shell flex min-h-svh flex-col justify-center gap-6 py-32">
      <Eyebrow>404</Eyebrow>
      <h1 className="section_heading max-w-[18ch]">This page could not be found.</h1>
      <p className="works_p max-w-[40ch]">
        The link may be old, or the page may have moved. Everything is still a click away from
        the home page.
      </p>
      <CtaPill label="Back to Home" href="/" className="self-start" />
    </main>
  );
}
