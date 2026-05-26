// app/api/view/[imageId]/route.ts
//
// Lightweight fire-and-forget view counter.
// Called client-side so pages don't need force-dynamic just for analytics.

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { shouldCountRequest } from "@/lib/analytics-filter";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ imageId: string }> }
) {
  if (!shouldCountRequest(req)) {
    return NextResponse.json({ ok: true });
  }

  const { imageId } = await params;
  if (!imageId) return NextResponse.json({ ok: false }, { status: 400 });

  db.image.update({
    where: { id: imageId },
    data: { viewCount: { increment: 1 } },
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}