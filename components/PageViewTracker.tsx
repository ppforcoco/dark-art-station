// components/PageViewTracker.tsx
// Fires a view-count increment after hydration — keeps pages out of force-dynamic.
"use client";

import { useEffect } from "react";

export default function PageViewTracker({ imageId }: { imageId: number }) {
  useEffect(() => {
    fetch(`/api/view/${imageId}`, { method: "POST" }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}