'use client';

// ScrollReset — scrolls to the top of the page whenever the route changes.
// Next.js App Router doesn't do this automatically for same-layout navigations.
// Placed in layout.tsx so it runs on every page transition.

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollReset() {
  const pathname = usePathname();

  useEffect(() => {
    // Instant scroll (no animation) so user immediately sees the top of the new page
    window.scrollTo(0, 0);
  }, [pathname]);

  return null; // renders nothing — side-effect only
}