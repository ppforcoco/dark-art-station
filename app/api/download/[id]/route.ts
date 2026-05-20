import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSignedDownloadUrl } from "@/lib/r2";
import { createHash } from "crypto";
import { shouldCountRequest } from "@/lib/analytics-filter";

// ─── Rate limiter config ───────────────────────────────────────────────────────
// FIX: Emerging-market users (NG/KE/MM/IN) often share IPs via carrier-grade NAT
// (CGNAT) — a single IP may represent hundreds of real users on mobile networks.
// The old limits (5/hr, 15/day) were causing false-positive rate blocks.
// New limits are more generous while still blocking bots.
const HOURLY_LIMIT        = 15;                 // was 5 — raised for CGNAT networks
const HOURLY_WINDOW_MS    = 60 * 60 * 1000;
const BURST_LIMIT         = 5;                  // was 3 — raised for CGNAT networks
const BURST_WINDOW_MS     = 60 * 1000;
const DAILY_LIMIT         = 40;                 // was 15 — raised for CGNAT networks
const SAME_IMAGE_COOLDOWN = 24 * 60 * 60 * 1000;
const MIN_DELAY_MS        = 5_000;              // was 10_000 — halved; 10s felt broken on slow connections

// ─── In-memory stores ──────────────────────────────────────────────────────────
const hourlyStore  = new Map<string, number[]>();
const burstStore   = new Map<string, number[]>();
const lastDownload = new Map<string, number>();

function checkAndRecord(
  store: Map<string, number[]>,
  key: string,
  windowMs: number,
  max: number
): boolean {
  const now    = Date.now();
  const cutoff = now - windowMs;
  const times  = (store.get(key) ?? []).filter((t) => t > cutoff);

  if (times.length >= max) return true;

  times.push(now);
  store.set(key, times);

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

    // ── 1. Minimum delay between downloads ────────────────────────────────────
    const last = lastDownload.get(ipHash);
    if (last && Date.now() - last < MIN_DELAY_MS) {
      return NextResponse.json(
        { error: "Please wait a moment before downloading again." },
        {
          status: 429,
          headers: { "Retry-After": "5" },
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

    // ── 5. Same-image cooldown ────────────────────────────────────────────────
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

    lastDownload.set(ipHash, Date.now());

    const safeTitle = image.title
      ? image.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60)
      : "haunted-wallpaper";
    const fileName = `${safeTitle}.jpg`;

    const signedUrl = await getSignedDownloadUrl(image.highResKey, 60 * 15, fileName);

    // ── Fire-and-forget telemetry ─────────────────────────────────────────────
    db.download
      .create({ data: { imageId: image.id, ipHash } })
      .catch((err) => console.error("[IMAGE_DOWNLOAD_TELEMETRY]", err));

    if (shouldCountRequest(req)) {
      db.image
        .update({ where: { id: image.id }, data: { viewCount: { increment: 1 } } })
        .catch((err) => console.error("[IMAGE_VIEWCOUNT_INCREMENT]", err));
    }

    // ── Fetch from R2 and stream back ─────────────────────────────────────────
    // FIX: Added AbortController with 30s timeout — on slow connections in NG/KE/MM/IN
    // the R2 fetch could hang indefinitely, leaving the user with a stalled download.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    let r2Response: Response;
    try {
      r2Response = await fetch(signedUrl, { signal: controller.signal });
    } catch (fetchErr) {
      clearTimeout(timeout);
      console.error("[IMAGE_DOWNLOAD_R2_FETCH]", fetchErr);
      return NextResponse.json({ error: "Download timed out. Please try again." }, { status: 504 });
    }
    clearTimeout(timeout);

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