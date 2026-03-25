// app/api/hw-admin/mark-adult/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function checkAuth(req: NextRequest) {
  const pw      = req.headers.get("x-admin-password");
  const correct = process.env.ADMIN_PASSWORD ?? "haunted-admin-2025";
  return pw === correct;
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title } = await req.json() as { title?: string };
    if (!title?.trim()) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    // Find images by partial title match (case-insensitive)
    const images = await db.image.findMany({
      where: { title: { contains: title.trim(), mode: "insensitive" } },
      select: { id: true, title: true },
    });

    if (images.length === 0) {
      return NextResponse.json({ error: `No images found matching "${title}"` }, { status: 404 });
    }

    // Update tags to include "adult" marker — we use a special tag since schema has no isAdult field
    // We'll add "18plus" to the tags array as the marker
    let updated = 0;
    for (const img of images) {
      const current = await db.image.findUnique({
        where: { id: img.id },
        select: { tags: true },
      });
      const tags = current?.tags ?? [];
      if (!tags.includes("18plus")) {
        await db.image.update({
          where: { id: img.id },
          data: { tags: [...tags, "18plus"] },
        });
        updated++;
      }
    }

    return NextResponse.json({
      ok: true,
      found: images.length,
      updated,
      titles: images.map(i => i.title),
    });

  } catch (err) {
    console.error("[mark-adult POST]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}