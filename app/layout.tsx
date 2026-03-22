import type { Metadata, Viewport } from "next";
import { DM_Sans, Sora } from "next/font/google";
import { appConfig } from "@/lib/config";
import "./globals.css";

const display = Sora({ subsets: ["latin"], variable: "--font-display" });
const body = DM_Sans({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  metadataBase: new URL(appConfig.siteUrl),
  title: {
    default: "Flirmo | Safer modern dating in India",
    template: "%s | Flirmo",
  },
  description:
    "Flirmo is a mobile-first dating and social platform for adults 18+ in India, built with strong safety, privacy, and transparent policies.",
  applicationName: appConfig.name,
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "Flirmo | Safer modern dating in India",
    description:
      "Discover adults across India with a mobile-first dating platform focused on safety, moderation, and premium UX.",
    type: "website",
    url: appConfig.siteUrl,
    siteName: appConfig.name,
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "Flirmo preview" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Flirmo | Safer modern dating in India",
    description:
      "Mobile-first dating with Google login, transparent policies, and adult-only access.",
    images: ["/og-image.svg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fffaf6",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="font-[var(--font-body)] antialiased">{children}</body>
    </html>
  );
}
