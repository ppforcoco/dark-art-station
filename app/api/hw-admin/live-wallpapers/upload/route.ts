// app/api/hw-admin/live-wallpapers/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, BUCKET, getPublicUrl } from "@/lib/r2";
import { db } from "@/lib/db";

function checkAuth(req: NextRequest) {
  const pw = req.headers.get("x-admin-password");
  return pw === (process.env.ADMIN_PASSWORD ?? "haunted-admin-2025");
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const form = await req.formData();
    const file      = form.get("file")      as File | null;
    const thumb     = form.get("thumbnail") as File | null;
    const title     = form.get("title")     as string;
    const slug      = form.get("slug")      as string;
    const hasSound  = form.get("hasSound") === "true";
    const desc      = form.get("description") as string | null;
    const tagsRaw   = form.get("tags") as string | null;

    if (!file || !slug || !title) {
      return NextResponse.json({ error: "file, slug, and title are required" }, { status: 400 });
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json({ error: "Slug must be lowercase, numbers, hyphens only" }, { status: 400 });
    }

    const existing = await db.liveWallpaper.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: `Slug "${slug}" already exists` }, { status: 409 });
    }

    // Upload MP4
    const videoBuffer = Buffer.from(await file.arrayBuffer());
    const r2Key = `live-wallpapers/${slug}.mp4`;
    await r2.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: r2Key,
      Body: videoBuffer,
      ContentType: "video/mp4",
      CacheControl: "public, max-age=31536000, immutable",
    }));

    // Upload thumbnail (optional)
    let thumbnailKey = "";
    if (thumb && thumb.size > 0) {
      const thumbBuffer = Buffer.from(await thumb.arrayBuffer());
      thumbnailKey = `live-wallpapers/thumbs/${slug}.jpg`;
      await r2.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: thumbnailKey,
        Body: thumbBuffer,
        ContentType: "image/jpeg",
        CacheControl: "public, max-age=31536000, immutable",
      }));
    }

    let tags: string[] = [];
    try { tags = tagsRaw ? JSON.parse(tagsRaw) : []; } catch { /* empty */ }

    const wallpaper = await db.liveWallpaper.create({
      data: {
        slug,
        title,
        description: desc || null,
        r2Key,
        thumbnailKey,
        hasSound,
        tags,
      },
    });

    return NextResponse.json({
      ok: true,
      wallpaper: {
        ...wallpaper,
        videoUrl: getPublicUrl(r2Key),
        thumbnailUrl: thumbnailKey ? getPublicUrl(thumbnailKey) : null,
      },
    });
  } catch (err) {
    console.error("[live-wallpapers/upload]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}