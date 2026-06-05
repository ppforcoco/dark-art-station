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

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (!href) return;
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
        @keyframes hw-fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Red progress bar along the very top */
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

        /* Bottom-right pill — always sits on dark UI chrome, never on images */
        .hw-spinner-pill {
          position: fixed;
          bottom: 28px;
          right: 24px;
          z-index: 9998;
          pointer-events: none;
          display: flex;
          align-items: center;
          gap: 10px;
          background: #0c0b14;
          border: 1px solid rgba(192, 0, 26, 0.4);
          border-radius: 999px;
          padding: 8px 16px 8px 10px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.7), 0 0 0 1px rgba(192,0,26,0.1);
          animation: hw-fade-in 0.18s ease forwards;
        }
        .hw-spinner-ring {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(192, 0, 26, 0.2);
          border-top-color: #c0001a;
          border-radius: 50%;
          flex-shrink: 0;
          animation: hw-spin 0.65s linear infinite;
        }
        .hw-spinner-label {
          font-family: var(--font-space, monospace);
          font-size: 0.6rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
          white-space: nowrap;
        }
      `}</style>

      {/* Top progress bar */}
      <div className="hw-top-bar" aria-hidden="true">
        <div className="hw-top-bar-fill" />
      </div>

      {/* Bottom-right pill */}
      <div className="hw-spinner-pill" role="status" aria-label="Loading">
        <div className="hw-spinner-ring" />
        <span className="hw-spinner-label">Loading</span>
      </div>
    </>
  );
}