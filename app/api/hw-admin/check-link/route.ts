import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ ok: false, status: "No URL" }, { status: 400 });

  try {
    const res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
      headers: { "User-Agent": "HauntedWallpapers-LinkChecker/1.0" },
    });
    return NextResponse.json({ ok: res.ok, status: res.status });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ ok: false, status: msg.slice(0, 40) });
  }
}