import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSignedDownloadUrl } from "@/lib/r2";
import { createHash } from "crypto";

// ─── Rate limiter (in-memory, per hour) ───────────────────────────────────────
const RATE_LIMIT_MAX       = 10;
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
      return NextResponse.json({ error: "Missing collection ID" }, { status: 400 });
    }

    // ── Get IP + hash ─────────────────────────────────────────────────────────
    const rawIp =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";
    const ipHash = hashIp(rawIp);

    // ── DB-backed daily cap ───────────────────────────────────────────────────
    const todayDownloads = await db.download.count({
      where: {
        ipHash,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });

    if (todayDownloads >= 15) {
      return NextResponse.json(
        { error: "Daily download limit reached. Come back tomorrow!" },
        {
          status: 429,
          headers: {
            "Retry-After":       "86400",
            "X-RateLimit-Limit": "15",
          },
        }
      );
    }

    // ── In-memory hourly rate limit ───────────────────────────────────────────
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

    // ── Fetch collection ──────────────────────────────────────────────────────
    const collection = await db.collection.findUnique({
      where: { id },
      select: { id: true, title: true, downloadUrl: true, isFree: true },
    });

    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    if (!collection.downloadUrl) {
      return NextResponse.json({ error: "No download available" }, { status: 404 });
    }

    const signedUrl = await getSignedDownloadUrl(collection.downloadUrl);

    // ── Fire-and-forget telemetry ─────────────────────────────────────────────
    db.download
      .create({ data: { collectionId: collection.id, ipHash } })
      .catch(() => {});

    return NextResponse.redirect(signedUrl);

  } catch (err) {
    console.error("[DOWNLOAD_ROUTE]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}