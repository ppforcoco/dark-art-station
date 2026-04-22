// app/api/admin/districts/untag/route.ts
// POST application/json
// body: { imageIds: string[], tag: string }
// Removes the given tag from all listed images (does NOT delete the image).

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { imageIds, tag } = body as { imageIds?: string[]; tag?: string };

  if (!Array.isArray(imageIds) || imageIds.length === 0) {
    return NextResponse.json({ message: "imageIds array is required" }, { status: 400 });
  }
  if (!tag) {
    return NextResponse.json({ message: "tag is required" }, { status: 400 });
  }

  // Fetch current tags for each image, then remove the district tag
  const images = await db.image.findMany({
    where: { id: { in: imageIds } },
    select: { id: true, tags: true },
  });

  await Promise.all(
    images.map((img) =>
      db.image.update({
        where: { id: img.id },
        data: {
          tags: img.tags.filter((t) => t !== tag),
        },
      })
    )
  );

  return NextResponse.json({ removed: images.length });
}