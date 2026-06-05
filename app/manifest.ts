// app/manifest.ts
//
// Next.js built-in Web App Manifest route (App Router).
// This file replaces public/manifest.json entirely.
//
// WHY THIS FILE EXISTS:
//   The browser console was showing two errors:
//     1. Failed to load resource: 404 — /icons/icon-180.png
//     2. "Download error or resource isn't a valid image" in the Manifest panel
//
//   Both originated from public/manifest.json listing an icon at
//   /icons/icon-180.png that was never uploaded to /public.
//
// THE FIX:
//   • Delete public/manifest.json (if it exists). Next.js serves this file from
//     app/manifest.ts at /manifest.webmanifest automatically — having both
//     causes a conflict and the static file wins (preserving the broken one).
//   • This manifest only references icons that actually exist:
//       /apple-touch-icon.png  (180×180, used by Apple)
//       /icon-192.png          (192×192, required by Chrome Android for install prompt)
//       /icon-512.png          (512×512, required for splash screen)
//   • If you add more icon sizes in future, generate them with:
//       node scripts/generate-pwa-icons.mjs
//     and add entries here.
//
// layout.tsx change:
//   The <link rel="manifest"> href changed from "/manifest.json" to
//   "/manifest.webmanifest" to match what Next.js serves this file at.

import type { MetadataRoute } from "next";

const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name:             "Haunted Wallpapers",
    short_name:       "Haunted WP",
    description:      "Free dark fantasy wallpapers for iPhone, Android and PC.",
    start_url:        "/",
    display:          "standalone",
    background_color: "#0c0b14",
    theme_color:      "#0c0b14",
    orientation:      "portrait-primary",
    scope:            "/",
    lang:             "en",
    categories:       ["entertainment", "lifestyle"],
    icons: [
      {
        src:     "/apple-touch-icon.png",
        sizes:   "180x180",
        type:    "image/png",
        purpose: "any",
      },
      {
        src:     "/icon-192.png",
        sizes:   "192x192",
        type:    "image/png",
        purpose: "maskable",
      },
      {
        src:     "/icon-512.png",
        sizes:   "512x512",
        type:    "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name:        "Browse Wallpapers",
        short_name:  "Browse",
        url:         "/all",
        description: "Browse all dark fantasy wallpapers",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
      {
        name:        "iPhone Wallpapers",
        short_name:  "iPhone",
        url:         "/iphone",
        description: "Wallpapers sized for iPhone",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
    ],
    screenshots: [
      {
        src:         `https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/og-image.webp`,
        sizes:       "1200x630",
        type:        "image/webp",
        form_factor: "wide",
        label:       "Haunted Wallpapers home screen",
      } as any,
    ],
  };
}