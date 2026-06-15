// app/api/hw-admin/live-wallpapers/manage/route.ts
import { NextRequest, NextResponse } from "next/server";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { r2, BUCKET, getPublicUrl } from "@/lib/r2";
import { db } from "@/lib/db";

function checkAuth(req: NextRequest) {
  const pw = req.headers.get("x-admin-password");
  return pw === (process.env.ADMIN_PASSWORD ?? "haunted-admin-2025");
}

// GET — list all live wallpapers
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const wallpapers = await db.liveWallpaper.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    wallpapers.map((w) => ({
      ...w,
      videoUrl: getPublicUrl(w.r2Key),
      thumbnailUrl: w.thumbnailKey ? getPublicUrl(w.thumbnailKey) : null,
    }))
  );
}

// PATCH — toggle isPublished
export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, isPublished } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const updated = await db.liveWallpaper.update({
    where: { id },
    data: { isPublished },
  });

  return NextResponse.json({ ok: true, updated });
}

// DELETE — remove from R2 + DB
export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const record = await db.liveWallpaper.findUnique({ where: { id } });
  if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Delete from R2
  try {
    await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: record.r2Key }));
    if (record.thumbnailKey) {
      await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: record.thumbnailKey }));
    }
  } catch (e) {
    console.warn("[live-wallpapers/manage DELETE] R2 delete failed:", e);
  }

  await db.liveWallpaper.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}