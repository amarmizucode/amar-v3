import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * Static export. Every route prerenders — there are no route handlers, no
   * middleware and no server actions — so the build is a folder of HTML that
   * Cloudflare Workers serves straight from its asset store, with no Node
   * runtime to pay for. Adding a server feature later means dropping this
   * line and deploying through @opennextjs/cloudflare instead.
   */
  output: "export",
  images: {
    /*
     * The optimizer is a server route, which a static export has nowhere to
     * run. Nothing here uses `next/image` — the one component that did is
     * inline SVG now — so the remote patterns below only keep the config
     * honest about where images come from.
     */
    unoptimized: true,
    remotePatterns: [
      // Stand-in photography is served from Unsplash until real work lands.
      { protocol: "https", hostname: "images.unsplash.com" },
      // The R2 bucket the photography is served from. Both the default
      // r2.dev domain and any custom domain mapped to the bucket are allowed,
      // so switching between them needs no config change.
      { protocol: "https", hostname: "*.r2.dev" },
      ...(process.env.NEXT_PUBLIC_IMAGE_BASE_URL?.startsWith("https://")
        ? [
            {
              protocol: "https" as const,
              hostname: new URL(process.env.NEXT_PUBLIC_IMAGE_BASE_URL).hostname,
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
