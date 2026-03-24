import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function checkAuth(req: NextRequest) {
  const pw = req.headers.get("x-admin-password");
  const correct = process.env.ADMIN_PASSWORD ?? "haunted-admin-2025";
  return pw === correct;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart  = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Total downloads
    const totalDownloads = await db.download.count();

    // Today downloads
    const todayDownloads = await db.download.count({
      where: { createdAt: { gte: todayStart } },
    });

    // Week downloads
    const weekDownloads = await db.download.count({
      where: { createdAt: { gte: weekStart } },
    });

    // Top individual wallpapers (downloads where imageId is set)
    const topImagesRaw = await db.download.groupBy({
      by: ["imageId"],
      where: { imageId: { not: null } },
      _count: { imageId: true },
      orderBy: { _count: { imageId: "desc" } },
      take: 10,
    });

    const topWallpapers: { title: string; downloads: number }[] = [];
    for (const row of topImagesRaw) {
      if (!row.imageId) continue;
      const img = await db.image.findUnique({
        where: { id: row.imageId },
        select: { title: true },
      }).catch(() => null);
      topWallpapers.push({
        title: img?.title ?? "Unknown",
        downloads: row._count.imageId ?? 0,
      });
    }

    // Top collections (downloads where collectionId is set)
    const topCollectionsRaw = await db.download.groupBy({
      by: ["collectionId"],
      where: { collectionId: { not: null } },
      _count: { collectionId: true },
      orderBy: { _count: { collectionId: "desc" } },
      take: 10,
    });

    const topCollections: { title: string; downloads: number }[] = [];
    for (const row of topCollectionsRaw) {
      if (!row.collectionId) continue;
      const col = await db.collection.findUnique({
        where: { id: row.collectionId },
        select: { title: true },
      }).catch(() => null);
      topCollections.push({
        title: col?.title ?? "Unknown",
        downloads: row._count.collectionId ?? 0,
      });
    }

    // Recent activity — last 20 downloads with collection or image name
    const recent = await db.download.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        collection: { select: { title: true } },
        image:      { select: { title: true } },
      },
    });

    const recentActivity = recent.map((r) => ({
      time: r.createdAt.toLocaleString("en-US", {
        month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit",
      }),
      title: r.collection?.title ?? r.image?.title ?? "Unknown",
    }));

    return NextResponse.json({
      totalDownloads,
      todayDownloads,
      weekDownloads,
      topWallpapers,
      topCollections,
      recentActivity,
    });

  } catch (err) {
    console.error("[admin/analytics]", err);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}