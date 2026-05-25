// components/StoryTeaser.tsx
// Lore teaser box shown below the main image on individual wallpaper pages.
// Drives users to the blog (second page) → boosts GA4 engagement rate.

import Link from "next/link";

interface StoryTeaserProps {
  /** Optional: override the blog slug. Defaults to the Bone Street Files post. */
  blogSlug?: string;
}

export default function StoryTeaser({ blogSlug = "the-skeleton-collection-4k-visions-for-the-obsessed" }: StoryTeaserProps) {
  return (
    <Link
      href={`/blog/${blogSlug}`}
      style={{
        display: "block",
        textDecoration: "none",
        margin: "20px 0 4px",
        padding: "14px 18px",
        border: "1px solid rgba(139,0,0,0.45)",
        background: "rgba(139,0,0,0.07)",
        borderRadius: "3px",
        position: "relative",
        overflow: "hidden",
        transition: "border-color 0.25s, background 0.25s",
      }}
      className="story-teaser-box"
    >
      {/* red glow line top */}
      <span style={{
        position: "absolute", top: 0, left: 0, right: 0,
        height: "1px",
        background: "linear-gradient(90deg, transparent, rgba(192,0,26,0.6), transparent)",
      }} aria-hidden="true" />

      <p style={{
        fontFamily: "var(--font-space, monospace)",
        fontSize: "0.55rem",
        letterSpacing: "0.25em",
        textTransform: "uppercase",
        color: "rgba(192,0,26,0.8)",
        margin: "0 0 6px",
      }}>
        ▸ Classified — Bone Street Files
      </p>

      <p style={{
        fontFamily: "var(--font-cormorant, serif)",
        fontStyle: "italic",
        fontSize: "1rem",
        lineHeight: 1.4,
        color: "rgba(224,216,200,0.9)",
        margin: "0 0 10px",
      }}>
        The secret of this vision is hidden in the Bone Street Files...
      </p>

      <span style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        fontFamily: "var(--font-space, monospace)",
        fontSize: "0.62rem",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "#c0001a",
        borderBottom: "1px solid rgba(192,0,26,0.35)",
        paddingBottom: "1px",
      }}>
        Read the story →
      </span>

      <style>{`
        .story-teaser-box:hover {
          border-color: rgba(192,0,26,0.7) !important;
          background: rgba(139,0,0,0.13) !important;
        }
      `}</style>
    </Link>
  );
}