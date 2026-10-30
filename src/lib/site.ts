/**
 * The site's public origin, e.g. `https://amarramesh.com` — no trailing slash.
 *
 * Canonical URLs, the sitemap, robots.txt and social-share previews all need
 * absolute URLs, and nothing else in the build knows the domain. Set
 * `NEXT_PUBLIC_SITE_URL` in `.env.production` once the domain is final; it is
 * inlined at build time, so changing it needs a rebuild.
 *
 * Unset, everything that needs it degrades quietly: no metadataBase, no
 * canonical links, an empty sitemap and a robots.txt without a sitemap line.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/+$/, "");

export const SITE_NAME = "Amar Ramesh";
