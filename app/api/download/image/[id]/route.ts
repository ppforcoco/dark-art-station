import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSignedDownloadUrl } from "@/lib/r2";
import { createHash } from "crypto";

// ─── Rate limiter ─────────────────────────────────────────────────────────────
// Sliding-window in-memory store. Zero dependencies — no lru-cache needed.
// Allows RATE_LIMIT_MAX requests per RATE_LIMIT_WINDOW_MS per hashed IP.
//
// Safe for single-instance deployments (Coolify / single container).
// For multi-instance horizontal scaling, swap the Map for a Redis INCR.

const RATE_LIMIT_MAX       = 30;                 // max downloads per window
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;    // 1 hour rolling window

// Map<ipHash, timestamp[]>  — stores the times of recent requests per IP
const rateLimitStore = new Map<string, number[]>();

function isRateLimited(ipHash: string): boolean {
  const now       = Date.now();
  const cutoff    = now - RATE_LIMIT_WINDOW_MS;
  const timestamps = (rateLimitStore.get(ipHash) ?? []).filter((t) => t > cutoff);

  if (timestamps.length >= RATE_LIMIT_MAX) {
    // Don't record — just reject
    return true;
  }

  timestamps.push(now);
  rateLimitStore.set(ipHash, timestamps);

  // Periodically purge old entries to prevent unbounded memory growth.
  // Runs roughly 1% of requests — cheap enough to ignore.
  if (Math.random() < 0.01) {
    for (const [key, times] of rateLimitStore.entries()) {
      if (times.every((t) => t <= cutoff)) rateLimitStore.delete(key);
    }
  }

  return false;
}

// ─── IP hashing helper ────────────────────────────────────────────────────────

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

    // ── Rate limit check ──────────────────────────────────────────────────────
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

    // Build a safe filename from the image title (falls back to generic name)
    const safeTitle = image.title
      ? image.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60)
      : "haunted-wallpaper";
    const fileName = `${safeTitle}.jpg`;

    // Fresh signed URL — forces Save-As dialog via ResponseContentDisposition
    const signedUrl = await getSignedDownloadUrl(image.highResKey, 60 * 15, fileName);

    // ── Fire-and-forget telemetry ─────────────────────────────────────────────
    db.download
      .create({ data: { imageId: image.id, ipHash } })
      .catch((err) => console.error("[IMAGE_DOWNLOAD_TELEMETRY]", err));

    db.image
      .update({ where: { id: image.id }, data: { viewCount: { increment: 1 } } })
      .catch((err) => console.error("[IMAGE_VIEWCOUNT_INCREMENT]", err));

    return NextResponse.redirect(signedUrl);

  } catch (err) {
    console.error("[IMAGE_DOWNLOAD_ROUTE]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}