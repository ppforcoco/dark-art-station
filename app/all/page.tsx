// app/all/page.tsx — THE ENDLESS — All wallpapers, infinite scroll

import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import AllPageClient from "./AllPageClient";

export const revalidate = 300;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

export const metadata: Metadata = {
  title: "The Endless — All Dark Wallpapers | HAUNTED WALLPAPERS",
  description:
    "Every wallpaper we have ever made. iPhone, Android, and PC. Dark fantasy, gothic horror, minimal dread. Free HD downloads. Updated daily. No sign-up.",
  openGraph: {
    title: "The Endless — All Dark Wallpapers | HAUNTED WALLPAPERS",
    description:
      "Every wallpaper we have ever made. Dark fantasy, gothic horror, minimal dread. Updated daily.",
    url: `${SITE_URL}/all`,
    siteName: "Haunted Wallpapers",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Endless — All Dark Wallpapers | HAUNTED WALLPAPERS",
    description: "Every wallpaper we have ever made. Updated daily.",
  },
  alternates: { canonical: `${SITE_URL}/all` },
};

export interface WallpaperItem {
  id: string;
  slug: string;
  title: string;
  src: string;
  deviceType: "IPHONE" | "ANDROID" | "PC";
  tags: string[];
  aspectRatio: "9/16" | "16/9";
}

const INITIAL_TAKE = 48;

export default async function AllPage() {
  // ── Fetch first batch server-side for fast paint + SEO ──
  const [mobileRaw, desktopRaw, totalMobile, totalDesktop] = await Promise.all([
    db.image.findMany({
      where: { isAdult: false, deviceType: { in: ["IPHONE", "ANDROID"] }, NOT: { tags: { has: "badge-premium" } } },
      orderBy: { createdAt: "desc" },
      take: INITIAL_TAKE,
      select: { id: true, slug: true, title: true, r2Key: true, deviceType: true, tags: true },
    }),
    db.image.findMany({
      where: { isAdult: false, deviceType: "PC", NOT: { tags: { has: "badge-premium" } } },
      orderBy: { createdAt: "desc" },
      take: INITIAL_TAKE,
      select: { id: true, slug: true, title: true, r2Key: true, deviceType: true, tags: true },
    }),
    db.image.count({ where: { isAdult: false, deviceType: { in: ["IPHONE", "ANDROID"] }, NOT: { tags: { has: "badge-premium" } } } }),
    db.image.count({ where: { isAdult: false, deviceType: "PC", NOT: { tags: { has: "badge-premium" } } } }),
  ]);

  const toItem = (img: { id: string; slug: string; title: string; r2Key: string; deviceType: string | null; tags: string[] }): WallpaperItem => ({
    id: img.id,
    slug: img.slug,
    title: img.title,
    src: getPublicUrl(img.r2Key),
    deviceType: (img.deviceType ?? "IPHONE") as WallpaperItem["deviceType"],
    tags: img.tags,
    aspectRatio: img.deviceType === "PC" ? "16/9" : "9/16",
  });

  return (
    <AllPageClient
      initialMobile={mobileRaw.map(toItem)}
      initialDesktop={desktopRaw.map(toItem)}
      totalMobile={totalMobile}
      totalDesktop={totalDesktop}
    />
  );
}