/**
 * Where the photography files are served from.
 *
 * The manifest stores root-relative paths (`/assets/photography-web/…`), which
 * is what `public/` serves in development. In production those same files live
 * in a Cloudflare R2 bucket, so `NEXT_PUBLIC_IMAGE_BASE_URL` is prefixed onto
 * each path at render time.
 *
 * Keeping the prefix out of the manifest means switching between local files
 * and R2 — or moving to a different bucket or custom domain later — is an
 * env-var change and a redeploy, with no regeneration and nothing to roll back
 * in version control.
 *
 * Unset (the default) leaves paths untouched and the site serves from
 * `public/`, so a clone with no env file still runs.
 */
const BASE = (process.env.NEXT_PUBLIC_IMAGE_BASE_URL ?? "").replace(/\/+$/, "");

export function assetUrl(path: string): string {
  if (!BASE) return path;
  // Already absolute (the Unsplash stand-ins in `media.ts`): leave it alone.
  if (/^https?:\/\//i.test(path)) return path;
  return `${BASE}${path.startsWith("/") ? "" : "/"}${path}`;
}
