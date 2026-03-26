import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Cache a pool of IDs so we don't hit the DB on every shuffle click.
// Resets every 5 minutes so new uploads eventually appear.
let cachedIds: string[] = [];
let cacheExpiry = 0;

async function getIdPool(): Promise<string[]> {
  const now = Date.now();
  if (cachedIds.length > 0 && now < cacheExpiry) return cachedIds;

  // Fetch only IDs — extremely cheap query regardless of table size
  const rows = await db.image.findMany({
    select: { id: true },
    // Only standalone images that have a known device page
    where: { deviceType: { not: null }, collectionId: null, isAdult: false },
  });

  cachedIds  = rows.map((r) => r.id);
  cacheExpiry = now + 5 * 60 * 1000; // 5 min TTL
  return cachedIds;
}

export async function GET() {
  try {
    const ids = await getIdPool();

    if (ids.length === 0) {
      return NextResponse.json({ error: "No wallpapers found" }, { status: 404 });
    }

    // Pick a random ID from the pool — O(1), no table scan
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

    // Fallback: if the cached ID was deleted, clear cache and return a category page
    if (!image) {
      cachedIds  = [];
      cacheExpiry = 0;
      const cats = ["iphone", "android", "pc"];
      return NextResponse.json({
        href: `/${cats[Math.floor(Math.random() * cats.length)]}`,
      });
    }

    let href = "/collections";
    if (image.deviceType === "IPHONE")       href = `/iphone/${image.slug}`;
    else if (image.deviceType === "ANDROID") href = `/android/${image.slug}`;
    else if (image.deviceType === "PC")      href = `/pc/${image.slug}`;
    else if (image.collection?.slug)         href = `/shop/${image.collection.slug}/${image.slug}`;

    return NextResponse.json({ ...image, href });
  } catch (err) {
    console.error("[RANDOM_WALLPAPER]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}