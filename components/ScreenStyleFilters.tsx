// components/ScreenStyleFilters.tsx
"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  "skeletons", "minimal", "dark-humor", "gaming", "cyberpunk", "lofi", "anime", "dark-fantasy", "gothic",
];

interface ScreenStyleFiltersProps {
  rootPath: string;      // "/iphone" or "/android" — where the screen pills point
  currentPath: string;   // the actual page currently rendering this: rootPath, `${rootPath}/lock-screen-wallpapers`, or `${rootPath}/home-screen-wallpapers`
  currentTag?: string;   // active style tag (?tag=...), works on any of the 3 pages
  activeScreen?: "lock-screen" | "home-screen"; // omit on the root device page
}

function withTag(path: string, tag?: string) {
  return tag ? `${path}?tag=${encodeURIComponent(tag)}` : path;
}

export default function ScreenStyleFilters({ rootPath, currentPath, currentTag, activeScreen }: ScreenStyleFiltersProps) {
  const router = useRouter();

  const handleStyleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    router.push(withTag(currentPath, value === "all" ? undefined : value));
  };

  return (
    <div className="hw-filters-wrap">
      <div className="hw-filter-group">
        <div className="hw-tag-pills">
          <Link
            href={withTag(rootPath, currentTag)}
            className={`hw-tag-pill ${!activeScreen ? "hw-tag-pill--active" : ""}`}
          >
            All
          </Link>
          <Link
            href={withTag(`${rootPath}/lock-screen-wallpapers`, currentTag)}
            className={`hw-tag-pill ${activeScreen === "lock-screen" ? "hw-tag-pill--active" : ""}`}
          >
            🔒 Lock Screen
          </Link>
          <Link
            href={withTag(`${rootPath}/home-screen-wallpapers`, currentTag)}
            className={`hw-tag-pill ${activeScreen === "home-screen" ? "hw-tag-pill--active" : ""}`}
          >
            🏠 Home Screen
          </Link>
        </div>
      </div>

      <div className="hw-filter-group">
        <span className="hw-filter-label">Style</span>
        <select
          className="hw-style-select"
          value={currentTag ?? "all"}
          onChange={handleStyleChange}
          aria-label="Filter by style"
        >
          <option value="all">All Styles</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c.charAt(0).toUpperCase() + c.slice(1).replace(/-/g, " ")}
            </option>
          ))}
        </select>
      </div>

      <style>{`
        .hw-filters-wrap {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .hw-filter-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .hw-filter-label {
          font-family: var(--font-space, monospace);
          font-size: 0.56rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(224,224,248,0.4);
        }
        .hw-style-select {
          font-family: var(--font-space, monospace);
          font-size: 0.68rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #e8e4f8;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 2px;
          padding: 12px 14px;
          width: 100%;
          max-width: 320px;
          appearance: none;
          -webkit-appearance: none;
          background-image: linear-gradient(45deg, transparent 50%, rgba(224,224,248,0.5) 50%),
            linear-gradient(135deg, rgba(224,224,248,0.5) 50%, transparent 50%);
          background-position: calc(100% - 20px) center, calc(100% - 15px) center;
          background-size: 5px 5px, 5px 5px;
          background-repeat: no-repeat;
          transition: border-color 0.2s ease;
        }
        .hw-style-select:hover,
        .hw-style-select:focus {
          border-color: rgba(192,0,26,0.6);
          outline: none;
        }
        .hw-style-select option {
          background: #0c0b14;
          color: #e8e4f8;
        }
        @media (min-width: 640px) {
          .hw-filters-wrap {
            flex-direction: row;
            align-items: flex-end;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 24px;
          }
          .hw-style-select {
            width: auto;
            min-width: 200px;
          }
        }
      `}</style>
    </div>
  );
}