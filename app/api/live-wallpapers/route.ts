// app/api/live-wallpapers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";

export const revalidate = 60; // ISR — revalidate every 60 seconds

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor"); // last createdAt for pagination
  const limit = 10;

  const wallpapers = await db.liveWallpaper.findMany({
    where: {
      isPublished: true,
      ...(cursor ? { createdAt: { lt: new Date(cursor) } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  // Increment viewCount fire-and-forget — not awaited
  if (wallpapers.length > 0 && !cursor) {
    // Only count first page load, not pagination
    db.liveWallpaper
      .updateMany({
        where: { id: { in: wallpapers.map((w) => w.id) } },
        data: { viewCount: { increment: 1 } },
      })
      .catch(() => {});
  }

  const data = wallpapers.map((w) => ({
    id: w.id,
    slug: w.slug,
    title: w.title,
    description: w.description,
    videoUrl: getPublicUrl(w.r2Key),
    thumbnailUrl: w.thumbnailKey ? getPublicUrl(w.thumbnailKey) : null,
    hasSound: w.hasSound,
    tags: w.tags,
    viewCount: w.viewCount,
    createdAt: w.createdAt.toISOString(),
  }));

  const nextCursor =
    wallpapers.length === limit
      ? wallpapers[wallpapers.length - 1].createdAt.toISOString()
      : null;

  return NextResponse.json({ data, nextCursor });
}