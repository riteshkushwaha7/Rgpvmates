import type { MetadataRoute } from "next";
import { appConfig } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/pricing", "/privacy", "/terms", "/refund-policy", "/safety", "/contact", "/signin"],
      disallow: ["/discover", "/matches", "/chat", "/profile", "/settings", "/admin"],
    },
    sitemap: `${appConfig.siteUrl}/sitemap.xml`,
  };
}
