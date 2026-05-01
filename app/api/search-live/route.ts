import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q     = (searchParams.get("q") ?? "").trim();
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "6", 10), 12);

  if (!q || q.length < 2) return NextResponse.json({ results: [] });

  const qLower = q.toLowerCase();

  // Search priority:
  // 1. Exact tag match  — "cat" only finds images tagged exactly "cat"
  // 2. Title starts with query — "cat" finds "Cat in the Dark" but NOT "intricate"
  // 3. Title contains whole word — "cat" finds "Dark Cat Wallpaper" but NOT "delicate"
  //
  // Description is intentionally excluded — substring matching on long text
  // causes false positives (e.g. "cat" matches "intricate", "dedicated", etc.)

  const [tagMatches, titleMatches] = await Promise.all([
    // Exact tag match
    db.image.findMany({
      where: {
        isAdult: false,
        tags: { has: qLower },
      },
      select: {
        id: true, title: true, slug: true, r2Key: true, deviceType: true,
        collection: { select: { slug: true } },
      },
      orderBy: { viewCount: "desc" },
      take: limit,
    }),
    // Title starts with query (most relevant titles first)
    db.image.findMany({
      where: {
        isAdult: false,
        title: { startsWith: q, mode: "insensitive" },
      },
      select: {
        id: true, title: true, slug: true, r2Key: true, deviceType: true,
        collection: { select: { slug: true } },
      },
      orderBy: { viewCount: "desc" },
      take: limit,
    }),
  ]);

  // Merge: tag matches first, then title matches, deduplicate by id
  const seen = new Set<string>();
  const merged = [...tagMatches, ...titleMatches].filter(img => {
    if (seen.has(img.id)) return false;
    seen.add(img.id);
    return true;
  }).slice(0, limit);

  // If still under limit, fill with title contains whole-word match
  if (merged.length < limit) {
    const needed = limit - merged.length;
    const existingIds = new Set(merged.map(m => m.id));

    // Use a word-boundary approach: title contains " cat " or starts/ends with "cat"
    // Prisma doesn't support word boundaries natively, so we fetch a wider set
    // and filter in JS — safe because we limit the DB query
    const titleContains = await db.image.findMany({
      where: {
        isAdult: false,
        title: { contains: q, mode: "insensitive" },
        id: { notIn: Array.from(existingIds) },
      },
      select: {
        id: true, title: true, slug: true, r2Key: true, deviceType: true,
        collection: { select: { slug: true } },
      },
      orderBy: { viewCount: "desc" },
      take: needed * 4, // fetch extra, filter down
    });

    // Only keep results where q appears as a whole word in the title
    const wordBoundary = new RegExp(`(^|\\s|-)${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\s|-|$)`, "i");
    const filtered = titleContains.filter(img => wordBoundary.test(img.title)).slice(0, needed);
    merged.push(...filtered);
  }

  const results = merged.map(img => ({
    id:             img.id,
    title:          img.title,
    slug:           img.slug,
    r2Key:          img.r2Key,
    deviceType:     img.deviceType,
    collectionSlug: img.collection?.slug ?? null,
  }));

  return NextResponse.json({ results }, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
  });
}