import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// A static export only prerenders route handlers that opt in.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    ...(SITE_URL && { sitemap: `${SITE_URL}/sitemap.xml` }),
  };
}
