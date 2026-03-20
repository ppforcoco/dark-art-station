// app/api/random-wallpaper/route.ts
// Returns a random wallpaper href — used by the "Summon Random" nav button.
// Create folder: app/api/random-wallpaper/ then save this file as route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const count = await db.wallpaper.count();
    if (count === 0) {
      return NextResponse.json({ error: "No wallpapers found" }, { status: 404 });
    }
    const skip = Math.floor(Math.random() * count);
    const wallpaper = await db.wallpaper.findFirst({
      skip,
      select: { slug: true, deviceType: true },
    });
    if (!wallpaper) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const devicePath =
      wallpaper.deviceType === "IPHONE"
        ? "iphone"
        : wallpaper.deviceType === "ANDROID"
        ? "android"
        : "pc";
    return NextResponse.json({ href: `/${devicePath}/${wallpaper.slug}` });
  } catch (err) {
    console.error("[random-wallpaper]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}