// app/api/live-wallpapers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";

export const revalidate = 60;

function mapWallpaper(w: {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  r2Key: string;
  thumbnailKey: string | null;
  hasSound: boolean;
  tags: string[];
  viewCount: number;
  createdAt: Date;
}) {
  return {
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
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const slug = searchParams.get("slug");
  const limit = 10;

  // ── Slug-start mode ────────────────────────────────────────────────────────
  // When a slug is provided we find that wallpaper, then return it plus the
  // next oldest items so the player starts from the clicked item.
  if (slug) {
    const startItem = await db.liveWallpaper.findFirst({
      where: { slug, isPublished: true },
    });

    if (!startItem) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const wallpapers = await db.liveWallpaper.findMany({
      where: {
        isPublished: true,
        createdAt: { lte: startItem.createdAt },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const data = wallpapers.map(mapWallpaper);
    const nextCursor =
      wallpapers.length === limit
        ? wallpapers[wallpapers.length - 1].createdAt.toISOString()
        : null;

    return NextResponse.json({ data, nextCursor });
  }

  // ── Standard cursor pagination ─────────────────────────────────────────────
  const wallpapers = await db.liveWallpaper.findMany({
    where: {
      isPublished: true,
      ...(cursor ? { createdAt: { lt: new Date(cursor) } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  if (wallpapers.length > 0 && !cursor) {
    db.liveWallpaper
      .updateMany({
        where: { id: { in: wallpapers.map((w) => w.id) } },
        data: { viewCount: { increment: 1 } },
      })
      .catch(() => {});
  }

  const data = wallpapers.map(mapWallpaper);
  const nextCursor =
    wallpapers.length === limit
      ? wallpapers[wallpapers.length - 1].createdAt.toISOString()
      : null;

  return NextResponse.json({ data, nextCursor });
}