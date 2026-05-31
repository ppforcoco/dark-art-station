'use client';

// HomepageClientShell.tsx
// Loaded via dynamic({ ssr: false }) from page.tsx
// This ensures StreakBar + TrailSection never block SSR or first paint.
// They hydrate AFTER the hero, new-this-week grid, and worlds are visible.

import dynamic from "next/dynamic";

const StreakBar    = dynamic(() => import("@/components/StreakBar"),    { ssr: false });
const TrailSection = dynamic(() => import("@/components/TrailSection"), { ssr: false });

export default function HomepageClientShell() {
  return (
    <>
      <StreakBar />
      <TrailSection />
    </>
  );
}