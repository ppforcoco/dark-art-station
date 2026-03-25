// app/api/hw-admin/upload-image/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, BUCKET, getPublicUrl } from "@/lib/r2";
import { db } from "@/lib/db";

function checkAuth(req: NextRequest) {
  const pw = req.headers.get("x-admin-password");
  const correct = process.env.ADMIN_PASSWORD ?? "haunted-admin-2025";
  return pw === correct;
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();

    const file         = formData.get("file") as File | null;
    const slug         = formData.get("slug") as string;
    const title        = formData.get("title") as string;
    const deviceType   = formData.get("deviceType") as string | null;
    const tags         = formData.get("tags") as string;       // JSON array string
    const collectionId = formData.get("collectionId") as string | null;
    const altText      = formData.get("altText") as string | null;

    if (!file || !slug || !title) {
      return NextResponse.json({ error: "file, slug, and title are required" }, { status: 400 });
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json({ error: "Slug must be lowercase letters, numbers, and hyphens only" }, { status: 400 });
    }

    // Check slug uniqueness
    const existing = await db.image.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: `Image slug "${slug}" already exists` }, { status: 409 });
    }

    // ── Upload to R2 ────────────────────────────────────────────────────────
    const bytes      = await file.arrayBuffer();
    const buffer     = Buffer.from(bytes);
    const ext        = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const mimeType   = file.type || "image/jpeg";

    // Public thumbnail key  (served from CDN)
    const r2Key      = `thumbnails/${slug}/${slug}.${ext}`;
    // High-res key (same file for now — you can swap for a separate upload later)
    const highResKey = `high-res/${slug}/${slug}.${ext}`;

    // Upload thumbnail
    await r2.send(new PutObjectCommand({
      Bucket:      BUCKET,
      Key:         r2Key,
      Body:        buffer,
      ContentType: mimeType,
      // Make public — remove CacheControl if your bucket enforces private-by-default
      CacheControl: "public, max-age=31536000, immutable",
    }));

    // Upload high-res (same bytes — replace with a separate high-res file later)
    await r2.send(new PutObjectCommand({
      Bucket:      BUCKET,
      Key:         highResKey,
      Body:        buffer,
      ContentType: mimeType,
      CacheControl: "public, max-age=31536000, immutable",
    }));

    // ── Parse tags ───────────────────────────────────────────────────────────
    let parsedTags: string[] = [];
    try { parsedTags = tags ? JSON.parse(tags) : []; } catch {}

    // ── Save to DB ───────────────────────────────────────────────────────────
    const image = await db.image.create({
      data: {
        slug,
        title,
        description: altText ?? undefined,
        r2Key,
        highResKey,
        deviceType:   (deviceType as "IPHONE" | "ANDROID" | "PC" | null) ?? undefined,
        tags:          parsedTags,
        collectionId:  collectionId || undefined,
      },
    });

    const publicUrl = getPublicUrl(r2Key);

    return NextResponse.json({
      ok:       true,
      imageId:  image.id,
      slug:     image.slug,
      url:      publicUrl,
      r2Key,
      highResKey,
    });

  } catch (err) {
    console.error("[admin/upload-image POST]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

// Max file size: 20 MB
export const config = {
  api: { bodyParser: false },
};