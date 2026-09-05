// app/api/hw-admin/upload-image/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { r2, BUCKET, getPublicUrl } from "@/lib/r2";
import { db } from "@/lib/db";
import { pingIndexNow } from "@/lib/index-now";
import { revalidatePath } from "next/cache";

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
    const description     = formData.get("description") as string | null;
    const metaDescription = formData.get("metaDescription") as string | null;
    const isAdult      = formData.get("isAdult") === "true";
    const commentsEnabled = formData.get("commentsEnabled") === "true";
    const isAvatar         = formData.get("isAvatar") === "true";
    const matchingGroupId  = formData.get("matchingGroupId") as string | null; // shared id for a matching-pair avatar
    const matchingLabel    = formData.get("matchingLabel")   as string | null; // e.g. "Him" / "Her"

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
    // Resize/compress on upload so we never store or serve an oversized raw
    // file as the "thumbnail" — this was previously stored exactly as
    // uploaded, forcing Next's image optimizer to do heavy resizing work on
    // every uncached request (slow TTFB) and bloating the origin storage.
    const thumbBytes    = await file.arrayBuffer();
    const rawThumbBuffer = Buffer.from(thumbBytes);
    const thumbBuffer = await sharp(rawThumbBuffer)
      .resize(800, 1200, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    const thumbExt    = "webp";
    const thumbMime   = "image/webp";
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
      // No 4K file — fall back to using the original (uncompressed) upload
      // as the download target, not the shrunk public thumbnail.
      const origExt  = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const origMime = file.type || "image/jpeg";
      highResKey = `high-res/${slug}/${slug}.${origExt}`;

      await r2.send(new PutObjectCommand({
        Bucket:       BUCKET,
        Key:          highResKey,
        Body:         rawThumbBuffer,
        ContentType:  origMime,
        CacheControl: "private, max-age=0",
      }));
    }

    // ── Parse tags ───────────────────────────────────────────────────────────
    let parsedTags: string[] = [];
    try { parsedTags = tags ? JSON.parse(tags) : []; } catch {}

    // ── Save to DB ───────────────────────────────────────────────────────────
    const image = await db.image.create({
      data: {
        slug,
        title,
        description:       description || altText || null,
        metaDescription:   metaDescription || null,
        altText:      altText || null,
        r2Key,
        highResKey,
        isAdult,
        commentsEnabled,
        isAvatar,
        matchingGroupId: matchingGroupId || null,
        matchingLabel:   matchingLabel   || null,
        deviceType:   (deviceType as "IPHONE" | "ANDROID" | "PC" | null) || null,
        tags:          parsedTags,
        collectionId:  collectionId || null,
      },
    });

    const publicThumbUrl = getPublicUrl(r2Key);

    // Homepage is statically cached for 1 hour ("Fresh From The Town" slider).
    // Without this, a brand-new upload wouldn't show up there until the next
    // hourly rebuild — force it to refresh right now instead.
    try {
      revalidatePath("/");
    } catch (err) {
      console.error("[revalidateHomepage] failed", err);
    }

    // Tell Bing/Yandex/Seznam/Naver about the new page immediately instead of
    // waiting for their next crawl. Fire-and-forget — never blocks the response.
    // (Google doesn't support IndexNow — see lib/index-now.ts for what actually
    // helps Google pick this page up faster.)
    if (deviceType) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";
      void pingIndexNow([`${siteUrl}/${deviceType.toLowerCase()}/${slug}`]);
    }

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