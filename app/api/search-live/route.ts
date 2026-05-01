import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q     = (searchParams.get("q") ?? "").trim();
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "6", 10), 12);

  if (!q) return NextResponse.json({ results: [] });

  const images = await db.image.findMany({
    where: {
      isAdult: false,
      OR: [
        { title:       { contains: q, mode: "insensitive" } },
        { tags:        { has: q.toLowerCase() }              },
        { description: { contains: q, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      title: true,
      slug: true,
      r2Key: true,
      deviceType: true,
      collection: {
        select: { slug: true },
      },
    },
    orderBy: { viewCount: "desc" },
    take: limit,
  });

  const results = images.map(img => ({
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