// app/favorites/layout.tsx
// Prevents Google from indexing /favorites — it's localStorage-based,
// so Google's crawler always sees an empty page (no saves = thin content).
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
  title: "My Saved Wallpapers | HAUNTED WALLPAPERS",
};

export default function FavoritesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}