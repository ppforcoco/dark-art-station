"use client";

interface SummonRandomTagProps {
  tags: string[];
  device: "android" | "iphone" | "pc";
}

export default function SummonRandomTag({ tags, device }: SummonRandomTagProps) {
  return (
    <button
      className="hw-tag-pill hw-tag-pill--random"
      title="Summon a random tag"
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