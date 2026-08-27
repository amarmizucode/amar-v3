import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Stand-in photography is served from Unsplash until real work lands.
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
};

export default nextConfig;
