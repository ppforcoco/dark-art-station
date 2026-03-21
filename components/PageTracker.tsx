"use client";
// PageTracker — records a wallpaper visit to localStorage for RecentlyViewed.
// Must be a Client Component; called from Server Component detail pages.
import { useEffect } from "react";
import { recordView, type RecentItem } from "@/components/RecentlyViewed";

export default function PageTracker({ item }: { item: RecentItem }) {
  useEffect(() => {
    recordView(item);
  }, [item]);
  return null; // renders nothing — side-effect only
}