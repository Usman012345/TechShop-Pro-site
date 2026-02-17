import type { MetadataRoute } from "next";
import { site } from "@/data/site";

// Required for `output: "export"` (static HTML export)
// so this metadata route is emitted as a build-time static asset.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const base = site.url.replace(/\/$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
