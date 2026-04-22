// app/api/admin/districts/route.ts
// GET /api/admin/districts?tag=bone-street&limit=50
// Returns images that have the given tag (strict match — only that district tag)

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tag = searchParams.get("tag");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50", 10), 200);

  if (!tag) {
    return NextResponse.json({ error: "tag is required" }, { status: 400 });
  }

  const [images, total] = await Promise.all([
    db.image.findMany({
      where: { tags: { has: tag } },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        r2Key: true,
        tags: true,
        createdAt: true,
      },
    }),
    db.image.count({ where: { tags: { has: tag } } }),
  ]);

  const r2Base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "";

  return NextResponse.json({
    districtId: tag,
    total,
    images: images.map((img) => ({
      ...img,
      thumbnailUrl: `${r2Base}/${img.r2Key}`,
      createdAt: img.createdAt.toISOString(),
    })),
  });
}