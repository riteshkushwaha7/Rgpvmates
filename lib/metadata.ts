import type { Metadata } from "next";
import { appConfig } from "@/lib/config";

export function buildMetadata({
  title,
  description,
  path = "/",
}: {
  title: string;
  description: string;
  path?: string;
}): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: `${title} | ${appConfig.name}`,
      description,
      url: `${appConfig.siteUrl}${path}`,
      siteName: appConfig.name,
      type: "website",
      images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "Flirmo" }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${appConfig.name}`,
      description,
      images: ["/og-image.svg"],
    },
  };
}
