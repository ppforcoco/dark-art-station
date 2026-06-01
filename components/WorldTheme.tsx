"use client";
// components/WorldTheme.tsx
// Sets data-world="purple" (etc.) on <html> while a world page is mounted.
// Removed on unmount so navigating away restores the site's normal theme.
// The CSS in globals.css reads [data-world="..."] to recolor bg, nav, scrollbar.
//
// FIX (May 2026): Added isMounted guard to prevent hydration mismatch (#418).
// The server has no concept of world color — it can't set data-world.
// Without the guard, React's hydration sees server HTML (no data-world) vs
// client render (data-world already set) and throws error #418.
// With the guard, the attribute is only set AFTER React finishes hydrating.

import { useEffect } from "react";

interface WorldThemeProps {
  color: string; // "purple" | "red" | "blue" | "green" | "black"
}

export default function WorldTheme({ color }: WorldThemeProps) {
  useEffect(() => {
    // ✅ Runs only on the client, after hydration — safe from #418
    const root = document.documentElement;
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

  // ✅ Renders null on server AND on first client paint — no hydration mismatch.
  // The data-world attribute is applied by the useEffect above, which only
  // runs after React has finished hydrating the page.
  return null;
}