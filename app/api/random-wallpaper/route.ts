import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Cache a pool of IDs so we don't hit the DB on every shuffle click.
// Resets every 5 minutes so new uploads eventually appear.
let cachedIds: string[] = [];
let cacheExpiry = 0;

async function getIdPool(): Promise<string[]> {
  const now = Date.now();
  if (cachedIds.length > 0 && now < cacheExpiry) return cachedIds;

  const rows = await db.image.findMany({
    select: { id: true },
    where: { deviceType: { not: null }, isAdult: false, isAvatar: false },
  });

  cachedIds  = rows.map((r) => r.id);
  cacheExpiry = now + 5 * 60 * 1000;
  return cachedIds;
}

export const dynamic = "force-dynamic"; // never cache this route
export const revalidate = 0;

export async function GET() {
  try {
    const ids = await getIdPool();

    if (ids.length === 0) {
      return NextResponse.json(
        { error: "No wallpapers found" },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }

    // Pick a random ID — shuffle until it's different from last if possible
    const randomId = ids[Math.floor(Math.random() * ids.length)];

    const image = await db.image.findUnique({
      where: { id: randomId },
      select: {
        id:          true,
        slug:        true,
        title:       true,
        description: true,
        r2Key:       true,
        highResKey:  true,
        deviceType:  true,
        tags:        true,
        viewCount:   true,
        collection:  { select: { slug: true, title: true } },
      },
    });

    if (!image) {
      cachedIds  = [];
      cacheExpiry = 0;
      const cats = ["iphone", "android", "pc"];
      return NextResponse.json(
        { href: `/${cats[Math.floor(Math.random() * cats.length)]}` },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    let href = "/collections";
    if (image.deviceType === "IPHONE")       href = `/iphone/${image.slug}`;
    else if (image.deviceType === "ANDROID") href = `/android/${image.slug}`;
    else if (image.deviceType === "PC")      href = `/pc/${image.slug}`;
    else if (image.collection?.slug)         href = `/shop/${image.collection.slug}/${image.slug}`;

    return NextResponse.json(
      { ...image, href },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
    );
  } catch (err) {
    console.error("[RANDOM_WALLPAPER]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}