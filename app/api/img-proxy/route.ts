import { NextRequest, NextResponse } from "next/server";

const R2_BASE = "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (!key) return new NextResponse("Missing key", { status: 400 });
  if (key.includes("..") || key.startsWith("/")) {
    return new NextResponse("Invalid key", { status: 400 });
  }

  try {
    const res = await fetch(`${R2_BASE}/${encodeURIComponent(key)}`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return new NextResponse("Upstream error", { status: res.status });

    const body = await res.arrayBuffer();
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": res.headers.get("content-type") ?? "image/jpeg",
        "Cache-Control": "public, max-age=86400, immutable",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("[img-proxy] error:", err);
    return new NextResponse("Proxy error", { status: 502 });
  }
}