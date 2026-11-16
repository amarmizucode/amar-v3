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

/*
 * The one contact address: the mailto links, the enquiry form and the print
 * requests all send here. It lives in this plain module, not in a client
 * component: a server component importing a constant from a "use client"
 * file gets a client-reference stub instead of the string, and a mailto
 * built from it renders as the stub's source.
 */
export const CONTACT_EMAIL = "hello@amarramesh.com";
