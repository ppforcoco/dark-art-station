"use client";
// components/PageTracker.tsx
// Records wallpaper visits to localStorage for the RecentlyViewed strip.

import { useEffect } from "react";
import { recordView, type RecentItem } from "@/components/RecentlyViewed";

export default function PageTracker({ item }: { item: RecentItem }) {
  useEffect(() => {
    recordView(item);
  }, [item]);

  return null;
}