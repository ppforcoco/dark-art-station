"use client";

// components/ShopCategoryFilter.tsx
//
// Renders "All / Wallpaper Pack / Single Wallpaper / Bundle ..." pills
// above the shop grid and filters which category sections are shown. Pure
// client-side state — no URL params, no refetch — since the full product
// list is already fetched server-side in app/shop/page.tsx and just handed
// to us. Category names are whatever's set in the admin panel, so this
// stays generic rather than hardcoding a fixed list.

import { useState } from "react";
import ShopProductCard from "./ShopProductCard";

interface ShopProduct {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  compareAtPrice: number | null;
  badge: string | null;
  thumbnail: string | null;
}

interface ShopCategoryFilterProps {
  groups: { category: string; items: ShopProduct[] }[];
}

export default function ShopCategoryFilter({ groups }: ShopCategoryFilterProps) {
  const [active, setActive] = useState<string>("All");

  const categories = groups.map(g => g.category);
  const visibleGroups = active === "All" ? groups : groups.filter(g => g.category === active);

  return (
    <div>
      {/* ── Category pills ── */}
      <div
        style={{
          display: "flex", gap: "10px", flexWrap: "wrap",
          marginBottom: "36px", paddingBottom: "20px", borderBottom: "1px solid #341a63",
        }}
      >
        {["All", ...categories].map(cat => {
          const isActive = cat === active;
          return (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              style={{
                fontFamily: "var(--font-space,monospace)",
                fontSize: "0.7rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "9px 18px",
                border: `1px solid ${isActive ? "#ff2e9e" : "#341a63"}`,
                background: isActive ? "#ff2e9e" : "transparent",
                color: isActive ? "#ffffff" : "#c9a8e8",
                cursor: "pointer",
                transition: "all 0.15s ease",
                borderRadius: "2px",
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* ── Filtered product groups ── */}
      {visibleGroups.map(({ category, items }) => (
        <div key={category} style={{ marginBottom: "48px" }}>
          {active === "All" && (
            <p style={{
              fontFamily: "var(--font-space,monospace)", fontSize: "0.58rem",
              letterSpacing: "0.3em", textTransform: "uppercase", color: "#5c4a8a",
              marginBottom: "14px", paddingBottom: "8px", borderBottom: "1px solid #341a63",
            }}>
              — {category}
            </p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {items.map((p, i) => (
              <ShopProductCard
                key={p.id}
                slug={p.slug}
                name={p.name}
                category={p.category}
                price={p.price}
                compareAtPrice={p.compareAtPrice}
                badge={p.badge}
                thumbnail={p.thumbnail}
                priority={i < 5}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}