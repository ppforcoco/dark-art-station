// app/api/hw-admin/page-content/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function checkAuth(req: NextRequest) {
  const pw = req.headers.get("x-admin-password");
  const correct = process.env.ADMIN_PASSWORD ?? "haunted-admin-2025";
  return pw === correct;
}

// GET  ?slug=faq          → single record
// GET  (no slug)          → all records
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  try {
    if (slug) {
      const record = await db.pageContent.findUnique({ where: { slug } });
      return NextResponse.json({ record: record ?? null });
    }

    const records = await db.pageContent.findMany({
      orderBy: { updatedAt: "desc" },
      select: { id: true, slug: true, title: true, body: true, metaDesc: true, updatedAt: true },
    });
    return NextResponse.json({ records });
  } catch (err) {
    console.error("[page-content GET]", err);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}

// POST  { slug, title?, body, metaDesc? }  → upsert
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { slug, title, body, metaDesc } = await req.json();
    if (!slug || !body?.trim()) {
      return NextResponse.json({ error: "slug and body are required" }, { status: 400 });
    }

    const record = await db.pageContent.upsert({
      where: { slug },
      create: { slug, title: title ?? null, body, metaDesc: metaDesc ?? null },
      update: { title: title ?? null, body, metaDesc: metaDesc ?? null },
    });
    return NextResponse.json({ ok: true, record });
  } catch (err) {
    console.error("[page-content POST]", err);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}

// DELETE  { slug }
export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { slug } = await req.json();
    if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

    await db.pageContent.delete({ where: { slug } }).catch(() => {});
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[page-content DELETE]", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}