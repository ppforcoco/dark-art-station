// app/tools/layout.tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mr4kwalls.com";

export const metadata: Metadata = {
  title: "wallpapers Tools — Resize, Darken & Customise | HAUNTED WALLPAPERS",
  description:
    "Browser-based wallpaper tools. Resize any image to exact phone or desktop dimensions, add dark overlays, blur backgrounds, overlay text, and more. No upload required — runs in your browser.",
  keywords: ["wallpaper resizer", "resize image for phone", "dark filter tool", "wallpaper maker"],
  alternates: { canonical: `${SITE_URL}/tools` },
  openGraph: {
    title: "wallpapers Tools | HAUNTED WALLPAPERS",
    description: "Resize, darken, and customise any wallpaper right in your browser. No upload required.",
    url: `${SITE_URL}/tools`,
    siteName: "HAUNTED WALLPAPERS",
    type: "website",
  },
};

export default function ToolsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}