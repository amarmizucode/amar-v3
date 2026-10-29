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

/*
 * A production build with no bucket is a silent failure, not a fallback: the
 * deploy prunes `assets/photography*` from `out/` (see the deploy script and
 * wrangler.toml), so every path this function would leave untouched points at
 * a file that was never uploaded. The site builds, ships, and shows broken
 * galleries. Fail the build instead — the variable is inlined at build time,
 * so this is the last moment anything can catch it.
 *
 * Only `next build` is guarded. `next dev` and `next start` keep serving from
 * `public/`, so a clone with no env file still runs.
 */
if (!BASE && process.env.NODE_ENV === "production" && process.env.NEXT_PHASE === "phase-production-build") {
  throw new Error(
    "NEXT_PUBLIC_IMAGE_BASE_URL is unset, so the photography would build as " +
      "paths into `public/` — which the deploy does not upload. Set it to the " +
      "R2 bucket's public URL (see .env.example) and rebuild.",
  );
}

export function assetUrl(path: string): string {
  if (!BASE) return path;
  // Already absolute (the Unsplash stand-ins in `media.ts`): leave it alone.
  if (/^https?:\/\//i.test(path)) return path;
  return `${BASE}${path.startsWith("/") ? "" : "/"}${path}`;
}
