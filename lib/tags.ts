/**
 * lib/tags.ts
 * GUIDE Tag Engine — aggregates and ranks tags by engagement for a given deviceType.
 * Engagement score = sum of (viewCount + downloadCount) across all images carrying the tag.
 */

import { db } from "@/lib/db";
import { DeviceType } from "@/lib/schemas";

export interface RankedTag {
  tag: string;
  score: number;   // sum of viewCount + downloadCount for images with this tag
  count: number;   // number of images carrying this tag
}

/**
 * Returns tags ranked by total engagement for the given device type.
 * Results are cached-friendly — call from a React Server Component or API route.
 */
export async function getRankedTags(deviceType: DeviceType): Promise<RankedTag[]> {
  const images = await db.image.findMany({
    where: {
      collectionId: null,
      deviceType,
      tags: { isEmpty: false },
    },
    select: {
      tags: true,
      viewCount: true,
      _count: { select: { downloads: true } },
    },
  });

  const tagMap = new Map<string, { score: number; count: number }>();

  for (const img of images) {
    const engagement = img.viewCount + img._count.downloads;
    for (const tag of img.tags) {
      const existing = tagMap.get(tag) ?? { score: 0, count: 0 };
      tagMap.set(tag, {
        score: existing.score + engagement,
        count: existing.count + 1,
      });
    }
  }

  return Array.from(tagMap.entries())
    .map(([tag, { score, count }]) => ({ tag, score, count }))
    .sort((a, b) => b.score - a.score);
}