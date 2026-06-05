"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function LoadingSpinner() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setLoading(false);
  }, [pathname, searchParams]);

  // Listen for clicks on internal links to show spinner
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (!href) return;
      // Only show for internal navigation, not downloads or external
      if (
        href.startsWith("/") &&
        !href.startsWith("//") &&
        !target.hasAttribute("download") &&
        !target.getAttribute("target")
      ) {
        setLoading(true);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  if (!loading) return null;

  return (
    <>
      <style>{`
        @keyframes hw-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes hw-bar-fill {
          0%   { width: 0%; }
          40%  { width: 55%; }
          70%  { width: 78%; }
          90%  { width: 90%; }
          100% { width: 100%; }
        }
        .hw-top-bar {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 2px;
          z-index: 9999;
          pointer-events: none;
        }
        .hw-top-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #c0001a, #ff1a33, #c0001a);
          animation: hw-bar-fill 8s ease forwards;
        }
        .hw-spinner-dot {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 9998;
          pointer-events: none;
          width: 36px;
          height: 36px;
          border: 2px solid rgba(255,255,255,0.08);
          border-top-color: #c0001a;
          border-radius: 50%;
          animation: hw-spin 0.7s linear infinite;
        }
      `}</style>
      <div className="hw-top-bar" aria-hidden="true">
        <div className="hw-top-bar-fill" />
      </div>
      <div className="hw-spinner-dot" aria-hidden="true" />
    </>
  );
}