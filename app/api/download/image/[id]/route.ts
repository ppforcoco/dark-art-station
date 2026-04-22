import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSignedDownloadUrl } from "@/lib/r2";
import { createHash } from "crypto";

// ─── Rate limiter ─────────────────────────────────────────────────────────────
const RATE_LIMIT_MAX       = 30;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

const rateLimitStore = new Map<string, number[]>();

function isRateLimited(ipHash: string): boolean {
  const now        = Date.now();
  const cutoff     = now - RATE_LIMIT_WINDOW_MS;
  const timestamps = (rateLimitStore.get(ipHash) ?? []).filter((t) => t > cutoff);

  if (timestamps.length >= RATE_LIMIT_MAX) return true;

  timestamps.push(now);
  rateLimitStore.set(ipHash, timestamps);

  if (Math.random() < 0.01) {
    for (const [key, times] of rateLimitStore.entries()) {
      if (times.every((t) => t <= cutoff)) rateLimitStore.delete(key);
    }
  }

  return false;
}

function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT ?? "haunted-default-salt";
  return createHash("sha256").update(salt + ip).digest("hex");
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Missing image ID" }, { status: 400 });
    }

    // ── Rate limit ────────────────────────────────────────────────────────────
    const rawIp =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";
    const ipHash = hashIp(rawIp);

    if (isRateLimited(ipHash)) {
      return NextResponse.json(
        { error: "Too many downloads. Please wait before trying again." },
        {
          status: 429,
          headers: {
            "Retry-After":       "3600",
            "X-RateLimit-Limit": String(RATE_LIMIT_MAX),
          },
        }
      );
    }

    const image = await db.image.findUnique({
      where: { id },
      select: { id: true, title: true, highResKey: true },
    });

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    if (!image.highResKey) {
      return NextResponse.json({ error: "No download available" }, { status: 404 });
    }

    // Build a safe filename
    const safeTitle = image.title
      ? image.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60)
      : "haunted-wallpaper";
    const fileName = `${safeTitle}.jpg`;

    // Get signed URL from R2
    const signedUrl = await getSignedDownloadUrl(image.highResKey, 60 * 15, fileName);

    // ── Fire-and-forget telemetry ─────────────────────────────────────────────
    db.download
      .create({ data: { imageId: image.id, ipHash } })
      .catch((err) => console.error("[IMAGE_DOWNLOAD_TELEMETRY]", err));

    db.image
      .update({ where: { id: image.id }, data: { viewCount: { increment: 1 } } })
      .catch((err) => console.error("[IMAGE_VIEWCOUNT_INCREMENT]", err));

    // ── Fetch from R2 and stream back with correct headers ────────────────────
    // This bypasses the R2 ResponseContentDisposition limitation on signed URLs.
    // We fetch the file server-side and set Content-Disposition ourselves.
    const r2Response = await fetch(signedUrl);

    if (!r2Response.ok) {
      return NextResponse.json({ error: "Failed to fetch file" }, { status: 502 });
    }

    const contentType = r2Response.headers.get("content-type") ?? "image/jpeg";
    const body = r2Response.body;

    if (!body) {
      return NextResponse.json({ error: "Empty file" }, { status: 502 });
    }

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type":        contentType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control":       "no-store",
      },
    });

  } catch (err) {
    console.error("[IMAGE_DOWNLOAD_ROUTE]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}