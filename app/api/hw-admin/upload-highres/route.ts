// app/api/hw-admin/upload-highres/route.ts
// Accepts a high-res / 4K file for an already-uploaded image,
// stores it in R2 under high-res/{slug}/ and updates highResKey in the DB.

import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, BUCKET } from "@/lib/r2";
import { db } from "@/lib/db";

function checkAuth(req: NextRequest) {
  const pw = req.headers.get("x-admin-password");
  const correct = process.env.ADMIN_PASSWORD ?? "haunted-admin-2025";
  return pw === correct;
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData  = await req.formData();
    const imageId   = formData.get("imageId")   as string | null;
    const slug      = formData.get("slug")       as string | null;
    const file      = formData.get("file")       as File   | null;

    if (!imageId || !slug || !file || file.size === 0)
      return NextResponse.json(
        { error: "imageId, slug, and file are required" },
        { status: 400 }
      );

    // Confirm image exists
    const image = await db.image.findUnique({ where: { id: imageId } });
    if (!image)
      return NextResponse.json({ error: "Image not found" }, { status: 404 });

    const ext      = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const mime     = file.type || "image/jpeg";
    const highResKey = `high-res/${slug}/${slug}-4k.${ext}`;

    const bytes  = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await r2.send(new PutObjectCommand({
      Bucket:      BUCKET,
      Key:         highResKey,
      Body:        buffer,
      ContentType: mime,
      CacheControl: "private, max-age=0",
    }));

    await db.image.update({
      where: { id: imageId },
      data:  { highResKey },
    });

    return NextResponse.json({ ok: true, highResKey });

  } catch (err) {
    console.error("[upload-highres POST]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}