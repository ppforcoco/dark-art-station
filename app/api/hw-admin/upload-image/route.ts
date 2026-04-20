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

    const file         = formData.get("file")        as File | null;  // thumbnail
    const highResFile  = formData.get("highResFile") as File | null;  // 4K/upscaled (optional)
    const slug         = formData.get("slug")        as string;
    const title        = formData.get("title")       as string;
    const deviceType   = formData.get("deviceType")  as string | null;
    const tags         = formData.get("tags")        as string;
    const collectionId = formData.get("collectionId") as string | null;
    const altText      = formData.get("altText")     as string | null;
    const description  = formData.get("description") as string | null;
    const isAdult      = formData.get("isAdult") === "true";

    if (!file || !slug || !title) {
      return NextResponse.json({ error: "file, slug, and title are required" }, { status: 400 });
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { error: "Slug must be lowercase letters, numbers, and hyphens only" },
        { status: 400 }
      );
    }

    const existing = await db.image.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: `Image slug "${slug}" already exists` }, { status: 409 });
    }

    // ── Thumbnail (always required) ──────────────────────────────────────────
    const thumbBytes  = await file.arrayBuffer();
    const thumbBuffer = Buffer.from(thumbBytes);
    const thumbExt    = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const thumbMime   = file.type || "image/jpeg";
    const r2Key       = `thumbnails/${slug}/${slug}.${thumbExt}`;

    await r2.send(new PutObjectCommand({
      Bucket:       BUCKET,
      Key:          r2Key,
      Body:         thumbBuffer,
      ContentType:  thumbMime,
      CacheControl: "public, max-age=31536000, immutable",
    }));

    // ── High-res / 4K upscaled (optional separate file) ──────────────────────
    let highResKey: string;

    if (highResFile && highResFile.size > 0) {
      // Separate 4K file was provided
      const hrBytes  = await highResFile.arrayBuffer();
      const hrBuffer = Buffer.from(hrBytes);
      const hrExt    = highResFile.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const hrMime   = highResFile.type || "image/jpeg";
      highResKey     = `high-res/${slug}/${slug}-4k.${hrExt}`;

      await r2.send(new PutObjectCommand({
        Bucket:       BUCKET,
        Key:          highResKey,
        Body:         hrBuffer,
        ContentType:  hrMime,
        // High-res files are served via signed URL — no public cache-control needed
        CacheControl: "private, max-age=0",
      }));
    } else {
      // No 4K file — fall back to using the thumbnail as the download target
      highResKey = `high-res/${slug}/${slug}.${thumbExt}`;

      await r2.send(new PutObjectCommand({
        Bucket:       BUCKET,
        Key:          highResKey,
        Body:         thumbBuffer,
        ContentType:  thumbMime,
        CacheControl: "private, max-age=0",
      }));
    }

    // ── Parse tags ───────────────────────────────────────────────────────────
    let parsedTags: string[] = [];
    try { parsedTags = tags ? JSON.parse(tags) : []; } catch {}
    if (isAdult && !parsedTags.includes("16plus")) parsedTags.push("16plus");

    // ── Save to DB ───────────────────────────────────────────────────────────
    const image = await db.image.create({
      data: {
        slug,
        title,
        description:  description || altText || undefined,
        altText:      altText || undefined,
        r2Key,
        highResKey,
        isAdult,
        deviceType:   (deviceType as "IPHONE" | "ANDROID" | "PC" | null) ?? undefined,
        tags:          parsedTags,
        collectionId:  collectionId || undefined,
      },
    });

    const publicThumbUrl = getPublicUrl(r2Key);

    return NextResponse.json({
      ok:         true,
      imageId:    image.id,
      slug:       image.slug,
      url:        publicThumbUrl,
      r2Key,
      highResKey,
      hasHighRes: highResFile && highResFile.size > 0,
    });

  } catch (err) {
    console.error("[admin/upload-image POST]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}