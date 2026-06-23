// app/api/avatars/route.ts
// Public endpoint — returns images marked isAvatar=true, for the /avatars page.

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";

export const revalidate = 300; // 5-min edge cache

export async function GET(_req: NextRequest) {
  try {
    const images = await db.image.findMany({
      where: {
        isAvatar: true,
        isAdult:  false,
      },
      orderBy: { createdAt: "desc" },
      select: {
        id:          true,
        slug:        true,
        title:       true,
        description: true,
        r2Key:       true,
        tags:        true,
      },
    });

    const result = images.map((img) => ({
      id:          img.id,
      slug:        img.slug,
      title:       img.title,
      description: img.description,
      src:         getPublicUrl(img.r2Key),
      tags:        img.tags,
    }));

    return NextResponse.json(
      { avatars: result, total: result.length },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }
    );
  } catch (err) {
    console.error("[api/avatars]", err);
    return NextResponse.json({ error: "Failed to load avatars" }, { status: 500 });
  }
}