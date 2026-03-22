import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Flirmo",
    short_name: "Flirmo",
    description: "Mobile-first dating for adults 18+ in India.",
    start_url: "/",
    display: "standalone",
    background_color: "#fffaf6",
    theme_color: "#fffaf6",
    icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
