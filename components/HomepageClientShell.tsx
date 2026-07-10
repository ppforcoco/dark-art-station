'use client';

import dynamic from "next/dynamic";

const TrailSection = dynamic(() => import("@/components/TrailSection"), { ssr: false });

export default function HomepageClientShell() {
  return (
    <>
      <TrailSection />
    </>
  );
}