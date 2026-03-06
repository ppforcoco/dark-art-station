"use client";

/**
 * components/TagCloud.tsx
 * Renders a ranked tag cloud. Clicking a tag updates the URL ?tag= param
 * and the parent device page re-renders with filtered results.
 */

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { RankedTag } from "@/lib/tags";

interface TagCloudProps {
  tags: RankedTag[];
}

export default function TagCloud({ tags }: TagCloudProps) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const activeTag    = searchParams.get("tag") ?? "";

  function handleTag(tag: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (activeTag === tag) {
      // Toggle off — clear filter
      params.delete("tag");
    } else {
      params.set("tag", tag);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  if (!tags.length) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {tags.map(({ tag, count }) => {
        const isActive = activeTag === tag;
        return (
          <button
            key={tag}
            onClick={() => handleTag(tag)}
            className={`font-mono text-[0.6rem] tracking-[0.18em] uppercase px-3 py-[6px] border transition-colors duration-200 ${
              isActive
                ? "bg-[#c0001a] border-[#c0001a] text-[#f0ecff]"
                : "bg-transparent border-[#2a2535] text-[#8a8099] hover:border-[#c0001a] hover:text-[#f0ecff]"
            }`}
          >
            #{tag}
            <span className="ml-1 opacity-50">{count}</span>
          </button>
        );
      })}
    </div>
  );
}