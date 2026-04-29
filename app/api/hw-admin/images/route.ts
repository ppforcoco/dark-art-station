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
  const page         = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limitParam   = parseInt(searchParams.get("limit") ?? "24", 10);
  const limit        = Math.min(limitParam, 500); // cap at 500
  const skip         = (page - 1) * limit;
  const q            = searchParams.get("q") ?? "";
  const collectionId = searchParams.get("collectionId") ?? "";
  const device       = searchParams.get("device") ?? ""; // IPHONE | ANDROID | PC

  const where: Record<string, unknown> = {};
  if (device) {
    where.deviceType = device;
  }
  if (collectionId) {
    where.collectionId = collectionId;
  } else if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" as const } },
      { slug:  { contains: q } },
    ];
  }

  const [images, total] = await Promise.all([
    db.image.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true, slug: true, title: true, r2Key: true,
        description: true, altText: true, metaDescription: true, tags: true,
        deviceType: true, isAdult: true, createdAt: true,
        collectionId: true, viewCount: true, sortOrder: true, highResKey: true,
        collection: { select: { title: true, slug: true } },
      },
    }),
    db.image.count({ where }),
  ]);

  return NextResponse.json({ images, total, page, pages: Math.ceil(total / limit) });
}