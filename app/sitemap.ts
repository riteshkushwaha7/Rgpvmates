import type { MetadataRoute } from "next";
import { appConfig } from "@/lib/config";

const publicRoutes = ["", "/pricing", "/privacy", "/terms", "/refund-policy", "/safety", "/contact", "/signin"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return publicRoutes.map((route) => ({
    url: `${appConfig.siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.75,
  }));
}
