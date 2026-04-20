// app/tools/layout.tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

export const metadata: Metadata = {
  title: "Free Wallpaper Tools — Resize, Darken & Customise | HAUNTED WALLPAPERS",
  description:
    "Free browser-based wallpaper tools. Resize any image to exact phone or desktop dimensions, add dark overlays, blur backgrounds, overlay text, and more. No upload required — runs in your browser.",
  keywords: ["wallpaper resizer", "image resizer online free", "resize image for phone", "dark filter tool", "wallpaper maker free"],
  alternates: { canonical: `${SITE_URL}/tools` },
  openGraph: {
    title: "Free Wallpaper Tools | HAUNTED WALLPAPERS",
    description: "Resize, darken, and customise any wallpaper free in your browser. No upload, no account.",
    url: `${SITE_URL}/tools`,
    siteName: "HAUNTED WALLPAPERS",
    type: "website",
  },
};

export default function ToolsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}