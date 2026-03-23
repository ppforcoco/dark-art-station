'use client';
import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Scrolls to top on every page navigation.
// Next.js App Router doesn't reset scroll automatically for same-layout routes.
export default function ScrollReset() {
  const pathname = usePathname();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}