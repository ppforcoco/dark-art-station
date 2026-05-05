import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/consent?id=<anonId>
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id || id.length > 128) {
    return NextResponse.json({ value: null });
  }

  try {
    const record = await db.cookieConsent.findUnique({ where: { anonId: id } });
    return NextResponse.json({ value: record?.value ?? null });
  } catch {
    return NextResponse.json({ value: null });
  }
}

// POST /api/consent  { id, value: "accepted" | "declined" }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, value } = body ?? {};

    if (
      typeof id !== "string" ||
      id.length > 128 ||
      (value !== "accepted" && value !== "declined")
    ) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    await db.cookieConsent.upsert({
      where: { anonId: id },
      create: { anonId: id, value },
      update: { value, updatedAt: new Date() },
    });

    return NextResponse.json({ ok: true });
  } catch {
    // Non-critical — if DB is down, client-side storage still works
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}