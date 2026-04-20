// app/api/hw-admin/analytics/route.ts
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
    const now       = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart  = new Date(now.getTime() - 7  * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // ── Download counts ──────────────────────────────────────────────────────
    const [totalDownloads, todayDownloads, weekDownloads, monthDownloads] = await Promise.all([
      db.download.count(),
      db.download.count({ where: { createdAt: { gte: todayStart } } }),
      db.download.count({ where: { createdAt: { gte: weekStart  } } }),
      db.download.count({ where: { createdAt: { gte: monthStart } } }),
    ]);

    // ── Downloads per day (last 14 days) for sparkline ───────────────────────
    const dailyRaw = await db.download.findMany({
      where: { createdAt: { gte: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000) } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    const dailyMap: Record<string, number> = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      dailyMap[d.toISOString().slice(0, 10)] = 0;
    }
    for (const row of dailyRaw) {
      const key = row.createdAt.toISOString().slice(0, 10);
      if (key in dailyMap) dailyMap[key]++;
    }
    const downloadsPerDay = Object.entries(dailyMap).map(([date, count]) => ({ date, count }));

    // ── Top individual wallpapers ────────────────────────────────────────────
    const topImagesRaw = await db.download.groupBy({
      by: ["imageId"],
      where: { imageId: { not: null } },
      _count: { imageId: true },
      orderBy: { _count: { imageId: "desc" } },
      take: 10,
    });

    const topWallpapers: { title: string; slug: string; device: string | null; downloads: number }[] = [];
    for (const row of topImagesRaw) {
      if (!row.imageId) continue;
      const img = await db.image.findUnique({
        where: { id: row.imageId },
        select: { title: true, slug: true, deviceType: true },
      }).catch(() => null);
      topWallpapers.push({
        title:     img?.title ?? "Unknown",
        slug:      img?.slug  ?? "",
        device:    img?.deviceType ?? null,
        downloads: row._count.imageId ?? 0,
      });
    }

    // ── Top collections by downloads ─────────────────────────────────────────
    const topCollectionsRaw = await db.download.groupBy({
      by: ["collectionId"],
      where: { collectionId: { not: null } },
      _count: { collectionId: true },
      orderBy: { _count: { collectionId: "desc" } },
      take: 10,
    });

    const topCollections: { title: string; slug: string; downloads: number }[] = [];
    for (const row of topCollectionsRaw) {
      if (!row.collectionId) continue;
      const col = await db.collection.findUnique({
        where: { id: row.collectionId },
        select: { title: true, slug: true },
      }).catch(() => null);
      topCollections.push({
        title:     col?.title ?? "Unknown",
        slug:      col?.slug  ?? "",
        downloads: row._count.collectionId ?? 0,
      });
    }

    // ── Top pages by view count (most-viewed wallpapers) ─────────────────────
    const topViewedImages = await db.image.findMany({
      orderBy: { viewCount: "desc" },
      take: 10,
      select: { title: true, slug: true, viewCount: true, deviceType: true },
    });

    const topPageViews = topViewedImages.map(img => ({
      title:     img.title,
      slug:      img.slug,
      device:    img.deviceType,
      views:     img.viewCount,
    }));

    // ── Total page views across all images ───────────────────────────────────
    const totalViewsResult = await db.image.aggregate({ _sum: { viewCount: true } });
    const totalPageViews   = totalViewsResult._sum.viewCount ?? 0;

    // ── Blog stats ───────────────────────────────────────────────────────────
    const [totalBlogPosts, publishedBlogPosts] = await Promise.all([
      db.blogPost.count(),
      db.blogPost.count({ where: { published: true } }),
    ]);

    // Top blog posts by view count — requires adding viewCount to BlogPost model
    // For now we pull the 10 most recently created published posts
    const recentBlogPosts = await db.blogPost.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { title: true, slug: true, label: true, createdAt: true, content: true },
    });

    const blogPosts = recentBlogPosts.map(p => ({
      title:    p.title,
      slug:     p.slug,
      label:    p.label,
      date:     p.createdAt.toISOString().slice(0, 10),
      wordCount: p.content.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length,
    }));

    // ── Downloads by device type ─────────────────────────────────────────────
    const downloadsWithDevice = await db.download.findMany({
      where: { imageId: { not: null }, createdAt: { gte: monthStart } },
      select: { image: { select: { deviceType: true } } },
    });

    const deviceBreakdown = { IPHONE: 0, ANDROID: 0, PC: 0, OTHER: 0 };
    for (const d of downloadsWithDevice) {
      const dt = d.image?.deviceType ?? "OTHER";
      if (dt === "IPHONE")  deviceBreakdown.IPHONE++;
      else if (dt === "ANDROID") deviceBreakdown.ANDROID++;
      else if (dt === "PC")      deviceBreakdown.PC++;
      else                       deviceBreakdown.OTHER++;
    }

    // ── Real downloads (image download route) vs collection downloads ─────────
    const imageDownloads      = await db.download.count({ where: { imageId: { not: null } } });
    const collectionDownloads = await db.download.count({ where: { collectionId: { not: null } } });

    // ── Recent activity ──────────────────────────────────────────────────────
    const recent = await db.download.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        collection: { select: { title: true, slug: true } },
        image:      { select: { title: true, slug: true, deviceType: true } },
      },
    });

    const recentActivity = recent.map((r) => ({
      time: r.createdAt.toLocaleString("en-US", {
        month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit",
      }),
      title:  r.collection?.title ?? r.image?.title ?? "Unknown",
      slug:   r.collection?.slug  ?? r.image?.slug  ?? "",
      device: r.image?.deviceType ?? null,
      type:   r.collectionId ? "collection" : "image",
    }));

    return NextResponse.json({
      // Download counts
      totalDownloads,
      todayDownloads,
      weekDownloads,
      monthDownloads,
      imageDownloads,
      collectionDownloads,
      downloadsPerDay,
      // Page views
      totalPageViews,
      topPageViews,
      // Top performers
      topWallpapers,
      topCollections,
      // Blog
      totalBlogPosts,
      publishedBlogPosts,
      blogPosts,
      // Device breakdown
      deviceBreakdown,
      // Recent
      recentActivity,
    });

  } catch (err) {
    console.error("[admin/analytics]", err);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}