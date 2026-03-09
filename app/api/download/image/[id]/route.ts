import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSignedDownloadUrl } from "@/lib/r2";
import { createHash } from "crypto";

// ─── IP hashing helper ────────────────────────────────────────────────────────
// One-way SHA-256 hash of IP + salt. Matches the pattern used in the
// collection download route. Never stores the raw IP — GDPR-safe.

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

    // Fresh signed URL generated ON DEMAND — never expires before the user clicks
    const signedUrl = await getSignedDownloadUrl(image.highResKey, 60 * 15); // 15 min

    // ── Fire-and-forget telemetry ─────────────────────────────────────────────
    // Redirect happens instantly. The DB write runs in the background and its
    // success/failure never blocks the user. Also increments viewCount atomically.
    const rawIp =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";
    const ipHash = hashIp(rawIp);

    db.download
      .create({
        data: {
          imageId: image.id,
          ipHash,
        },
      })
      .catch((err) => console.error("[IMAGE_DOWNLOAD_TELEMETRY]", err));

    // Increment viewCount in the same non-blocking pattern
    db.image
      .update({
        where: { id: image.id },
        data:  { viewCount: { increment: 1 } },
      })
      .catch((err) => console.error("[IMAGE_VIEWCOUNT_INCREMENT]", err));

    return NextResponse.redirect(signedUrl);

  } catch (err) {
    console.error("[IMAGE_DOWNLOAD_ROUTE]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}