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
    const slugHint  = formData.get("slug")       as string | null; // used only as fallback
    const file      = formData.get("file")       as File   | null;

    if (!imageId || !file || file.size === 0)
      return NextResponse.json(
        { error: "imageId and file are required" },
        { status: 400 }
      );

    // Look up by imageId first; fall back to slug so the UI can recover
    // from stale IDs (e.g. after a re-seed).
    let image = await db.image.findUnique({ where: { id: imageId } });
    if (!image && slugHint) {
      image = await db.image.findUnique({ where: { slug: slugHint } });
    }
    if (!image)
      return NextResponse.json(
        { error: `Image not found (id=${imageId}, slug=${slugHint})` },
        { status: 404 }
      );

    // Always derive the R2 key from the canonical DB slug — never trust the form slug.
    const ext        = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const mime       = file.type || "image/jpeg";
    const highResKey = `high-res/${image.slug}/${image.slug}-4k.${ext}`;

    const bytes  = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await r2.send(new PutObjectCommand({
      Bucket:       BUCKET,
      Key:          highResKey,
      Body:         buffer,
      ContentType:  mime,
      CacheControl: "private, max-age=0",
    }));

    await db.image.update({
      where: { id: image.id },
      data:  { highResKey },
    });

    return NextResponse.json({ ok: true, highResKey, imageId: image.id, slug: image.slug });

  } catch (err) {
    console.error("[upload-highres POST]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}