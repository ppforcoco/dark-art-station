"use client";
// components/WallpaperCardGridClient.tsx
// This wrapper exists so that ssr:false is inside a Client Component,
// which is required by Next.js 15 — you cannot use ssr:false in a Server Component.
import dynamic from "next/dynamic";

const WallpaperCardGrid = dynamic(
  () => import("@/components/WallpaperCardGrid"),
  { ssr: false },
);

export default WallpaperCardGrid;