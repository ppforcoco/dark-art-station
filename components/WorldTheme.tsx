"use client";
// components/WorldTheme.tsx
// Sets data-world="purple" (etc.) on <html> while a world page is mounted.
// Removed on unmount so navigating away restores the site's normal theme.
// The CSS in globals.css reads [data-world="..."] to recolor bg, nav, scrollbar.

import { useEffect } from "react";

interface WorldThemeProps {
  color: string; // "purple" | "red" | "blue" | "green" | "black"
}

export default function WorldTheme({ color }: WorldThemeProps) {
  useEffect(() => {
    const root = document.documentElement;
    // Save whatever theme was active (fog / ghost / ember / etc.)
    const prev = root.getAttribute("data-world");
    root.setAttribute("data-world", color);

    return () => {
      // On unmount (navigate away) — remove world tint
      if (prev) {
        root.setAttribute("data-world", prev);
      } else {
        root.removeAttribute("data-world");
      }
    };
  }, [color]);

  return null;
}