import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const count = await db.image.count();
    if (count === 0) {
      return NextResponse.json({ error: "No wallpapers found" }, { status: 404 });
    }

    const skip = Math.floor(Math.random() * count);

    const image = await db.image.findFirst({
      skip,
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
      return NextResponse.json({ error: "No wallpapers found" }, { status: 404 });
    }

    // Build href so the Header can navigate directly
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