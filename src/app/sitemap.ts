import type { MetadataRoute } from "next";
import { site } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url.replace(/\/$/, "");
  return [
    {
      url: `${base}/`,
      lastModified: new Date().toISOString(),
    },
  ];
}
