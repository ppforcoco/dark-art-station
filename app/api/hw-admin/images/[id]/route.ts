// app/api/hw-admin/images/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function checkAuth(req: NextRequest) {
  const pw = req.headers.get("x-admin-password");
  const correct = process.env.ADMIN_PASSWORD ?? "haunted-admin-2025";
  return pw === correct;
}

// GET — list all images (paginated, newest first)
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = 24;
  const skip = (page - 1) * limit;
  const q = searchParams.get("q") ?? "";

  const where = q
    ? { OR: [{ title: { contains: q, mode: "insensitive" as const } }, { slug: { contains: q } }] }
    : {};

  const [images, total] = await Promise.all([
    db.image.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        slug: true,
        title: true,
        r2Key: true,
        description: true,
        tags: true,
        deviceType: true,
        isAdult: true,
        createdAt: true,
        collectionId: true,
        viewCount: true,
        sortOrder: true,
        highResKey: true,
        collection: {
          select: {
            title: true,
            slug: true
          }
        },
      },
    }),
    db.image.count({ where }),
  ]);

  return NextResponse.json({ images, total, page, pages: Math.ceil(total / limit) });
}

// PATCH — update image fields
export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { id, title, description, tags, isAdult, deviceType } = body;

    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const updated = await db.image.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(tags !== undefined && { tags }),
        ...(isAdult !== undefined && { isAdult }),
        ...(deviceType !== undefined && { deviceType }),
      },
    });

    return NextResponse.json({ ok: true, slug: updated.slug });
  } catch (err) {
    console.error("[images PATCH]", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}