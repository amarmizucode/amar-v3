import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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
