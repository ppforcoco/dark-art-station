"use client";

interface SummonRandomTagProps {
  tags: string[];
  device: "android" | "iphone" | "pc";
}

export default function SummonRandomTag({ tags, device }: SummonRandomTagProps) {
  return (
    <button
      type="button"
      title="Summon a random tag"
      style={{
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: "2px",
        fontFamily: "var(--font-space, monospace)",
        fontSize: "0.65rem",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "#ff4757",
        border: "1px solid rgba(255,71,87,0.4)",
        background: "rgba(255,71,87,0.08)",
        cursor: "pointer",
      }}
      onClick={() => {
        const pool = tags.filter((t) => t.length > 0);
        if (!pool.length) return;
        const picked = pool[Math.floor(Math.random() * pool.length)];
        window.location.href = `/${device}?tag=${encodeURIComponent(picked)}`;
      }}
    >
      #Summon-Random
    </button>
  );
}