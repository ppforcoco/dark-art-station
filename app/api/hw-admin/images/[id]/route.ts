// app/api/hw-admin/images/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { r2, BUCKET } from "@/lib/r2";
import { db } from "@/lib/db";

function checkAuth(req: NextRequest) {
  const pw = req.headers.get("x-admin-password");
  const correct = process.env.ADMIN_PASSWORD ?? "haunted-admin-2025";
  return pw === correct;
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    // Find image first to get R2 keys
    const image = await db.image.findUnique({
      where: { id },
      select: { id: true, slug: true, r2Key: true, highResKey: true },
    });

    if (!image) return NextResponse.json({ error: "Image not found" }, { status: 404 });

    // Delete from R2 (both keys)
    const deletePromises = [
      r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: image.r2Key })),
    ];
    if (image.highResKey && image.highResKey !== image.r2Key) {
      deletePromises.push(
        r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: image.highResKey }))
      );
    }

    await Promise.allSettled(deletePromises); // don't fail if R2 key already gone

    // Delete from DB
    await db.image.delete({ where: { id } });

    return NextResponse.json({ ok: true, deleted: image.slug });
  } catch (err) {
    console.error("[images DELETE]", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}