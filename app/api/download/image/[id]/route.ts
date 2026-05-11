import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSignedDownloadUrl } from "@/lib/r2";
import { createHash } from "crypto";
import { shouldCountRequest } from "@/lib/analytics-filter";

// ─── Rate limiter config ───────────────────────────────────────────────────────
const HOURLY_LIMIT        = 5;                  // max downloads per IP per hour (was 30)
const HOURLY_WINDOW_MS    = 60 * 60 * 1000;
const BURST_LIMIT         = 3;                  // max downloads per IP per minute
const BURST_WINDOW_MS     = 60 * 1000;
const DAILY_LIMIT         = 15;                 // max downloads per IP per 24 hours (DB-backed)
const SAME_IMAGE_COOLDOWN = 24 * 60 * 60 * 1000; // same IP can't re-download same image within 24h
const MIN_DELAY_MS        = 10_000;             // minimum 10s between any two downloads from same IP

// ─── In-memory stores ──────────────────────────────────────────────────────────
const hourlyStore   = new Map<string, number[]>(); // ipHash → timestamps[]
const burstStore    = new Map<string, number[]>(); // ipHash → timestamps[]
const lastDownload  = new Map<string, number>();   // ipHash → last download timestamp

function checkAndRecord(
  store: Map<string, number[]>,
  key: string,
  windowMs: number,
  max: number
): boolean {
  const now       = Date.now();
  const cutoff    = now - windowMs;
  const times     = (store.get(key) ?? []).filter((t) => t > cutoff);

  if (times.length >= max) return true; // rate limited

  times.push(now);
  store.set(key, times);

  // Probabilistic cleanup to avoid memory growth
  if (Math.random() < 0.01) {
    for (const [k, ts] of store.entries()) {
      if (ts.every((t) => t <= cutoff)) store.delete(k);
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

    // ── Get IP + hash ─────────────────────────────────────────────────────────
    const rawIp =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";
    const ipHash = hashIp(rawIp);

    // ── 1. Minimum delay between downloads (blocks rapid-fire bots) ───────────
    const last = lastDownload.get(ipHash);
    if (last && Date.now() - last < MIN_DELAY_MS) {
      return NextResponse.json(
        { error: "Please wait a moment before downloading again." },
        {
          status: 429,
          headers: { "Retry-After": "10" },
        }
      );
    }

    // ── 2. Per-minute burst limit ─────────────────────────────────────────────
    if (checkAndRecord(burstStore, ipHash, BURST_WINDOW_MS, BURST_LIMIT)) {
      return NextResponse.json(
        { error: "Too many downloads too quickly. Please slow down." },
        {
          status: 429,
          headers: {
            "Retry-After":       "60",
            "X-RateLimit-Limit": String(BURST_LIMIT),
          },
        }
      );
    }

    // ── 3. Hourly limit ───────────────────────────────────────────────────────
    if (checkAndRecord(hourlyStore, ipHash, HOURLY_WINDOW_MS, HOURLY_LIMIT)) {
      return NextResponse.json(
        { error: "Too many downloads. Please wait before trying again." },
        {
          status: 429,
          headers: {
            "Retry-After":       "3600",
            "X-RateLimit-Limit": String(HOURLY_LIMIT),
          },
        }
      );
    }

    // ── 4. DB-backed daily cap (survives restarts) ────────────────────────────
    const todayDownloads = await db.download.count({
      where: {
        ipHash,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });

    if (todayDownloads >= DAILY_LIMIT) {
      return NextResponse.json(
        { error: "Daily download limit reached. Come back tomorrow!" },
        {
          status: 429,
          headers: {
            "Retry-After":       "86400",
            "X-RateLimit-Limit": String(DAILY_LIMIT),
          },
        }
      );
    }

    // ── 5. Same-image cooldown (blocks bots re-downloading the same file) ─────
    const recentSameImage = await db.download.findFirst({
      where: {
        ipHash,
        imageId: id,
        createdAt: { gte: new Date(Date.now() - SAME_IMAGE_COOLDOWN) },
      },
    });

    if (recentSameImage) {
      return NextResponse.json(
        { error: "You already downloaded this wallpaper recently." },
        {
          status: 429,
          headers: { "Retry-After": "86400" },
        }
      );
    }

    // ── Fetch image ───────────────────────────────────────────────────────────
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

    // Record last download time (for min-delay check)
    lastDownload.set(ipHash, Date.now());

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

    // Only count views from real humans — skip bots and admin IPs
    if (shouldCountRequest(req)) {
      db.image
        .update({ where: { id: image.id }, data: { viewCount: { increment: 1 } } })
        .catch((err) => console.error("[IMAGE_VIEWCOUNT_INCREMENT]", err));
    }

    // ── Fetch from R2 and stream back with correct headers ────────────────────
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