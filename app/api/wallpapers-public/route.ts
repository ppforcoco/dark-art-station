// app/api/wallpapers-public/route.ts
// Public endpoint — no auth required, used by /wallpapers infinite scroll

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page   = Math.max(1, parseInt(searchParams.get("page")  ?? "1",  10));
  const limit  = Math.min(Math.max(1, parseInt(searchParams.get("limit") ?? "36", 10)), 100);
  const device = searchParams.get("device") ?? ""; // IPHONE | ANDROID | PC

  const where: Record<string, unknown> = {
    collectionId: null,    // exclude shop/collection items
    sortOrder: { gte: 0 }, // exclude pinned negatives
    isAdult: false,        // never show adult content publicly
  };

  if (device && ["IPHONE", "ANDROID", "PC"].includes(device)) {
    where.deviceType = device;
  }

  const skip = (page - 1) * limit;

  const [images, total] = await Promise.all([
    db.image.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      skip,
      take: limit,
      select: {
        id: true, slug: true, title: true, r2Key: true,
        deviceType: true, tags: true, isAdult: true, viewCount: true,
      },
    }),
    db.image.count({ where }),
  ]);

  return NextResponse.json(
    { images, total, page, pages: Math.ceil(total / limit) },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    }
  );
}