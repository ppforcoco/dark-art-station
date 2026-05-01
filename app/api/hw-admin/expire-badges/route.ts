import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Badge tags that auto-expire after 2 days
const EXPIRING_BADGES = ["badge-new", "badge-premium", "badge-trending", "badge-hot", "badge-exclusive", "badge-limited"];

// Call this from a cron job every hour:
// GET /api/hw-admin/expire-badges?secret=YOUR_CRON_SECRET
// Or manually from admin panel

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  const cronSecret = process.env.CRON_SECRET ?? process.env.ADMIN_PASSWORD ?? "haunted-admin-2025";

  // Allow admin password or dedicated cron secret
  const adminPw = req.headers.get("x-admin-password");
  if (secret !== cronSecret && adminPw !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const TWO_DAYS_AGO = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

  try {
    // Find all images that have a badge tag AND were last updated more than 2 days ago
    const images = await db.image.findMany({
      where: {
        updatedAt: { lt: TWO_DAYS_AGO },
        tags: { hasSome: EXPIRING_BADGES },
      },
      select: { id: true, title: true, tags: true },
    });

    if (images.length === 0) {
      return NextResponse.json({ ok: true, expired: 0, message: "No badges to expire" });
    }

    // Strip expired badge tags from each image
    const updates = await Promise.all(
      images.map((img) => {
        const cleanedTags = img.tags.filter((t) => !EXPIRING_BADGES.includes(t));
        return db.image.update({
          where: { id: img.id },
          data: { tags: cleanedTags },
        });
      })
    );

    return NextResponse.json({
      ok: true,
      expired: updates.length,
      images: images.map((i) => ({
        title: i.title,
        removedBadges: i.tags.filter((t) => EXPIRING_BADGES.includes(t)),
      })),
    });
  } catch (err) {
    console.error("[expire-badges]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}