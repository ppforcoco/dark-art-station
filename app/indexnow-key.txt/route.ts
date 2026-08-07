// app/indexnow-key.txt/route.ts
//
// IndexNow requires a plain-text key file reachable on your domain so search
// engines (Bing, Yandex, Seznam, Naver — NOT Google, see lib/index-now.ts) can
// verify pings actually come from you. This serves it dynamically so it works
// even without a /public folder, and stays in sync with INDEXNOW_KEY in .env.
import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.INDEXNOW_KEY ?? "";
  return new NextResponse(key, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}