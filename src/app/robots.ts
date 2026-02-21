import type { MetadataRoute } from "next";
import { site } from "@/data/site";

// Keep this metadata route static.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const base = site.url.replace(/\/$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/admin"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
