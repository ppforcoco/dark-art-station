// app/api/hw-admin/residents/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function checkAuth(req: NextRequest) {
  const pw = req.headers.get("x-admin-password");
  const correct = process.env.ADMIN_PASSWORD ?? "haunted-admin-2025";
  return pw === correct;
}

// GET — list all residents
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const residents = await db.resident.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      slug: true,
      name: true,
      tagline: true,
      story: true,
      personality: true,
      portraitKey: true,
      order: true,
      isPublished: true,
      createdAt: true,
    },
  });
  return NextResponse.json({ residents });
}

// POST — create a new resident
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { slug, name, tagline, story, personality, order } = await req.json();
    if (!slug?.trim() || !name?.trim()) {
      return NextResponse.json({ error: "slug and name are required" }, { status: 400 });
    }

    const resident = await db.resident.create({
      data: {
        slug:        slug.trim(),
        name:        name.trim(),
        tagline:     tagline?.trim()     || "",
        story:       story?.trim()       || "",
        personality: personality?.trim() || "",
        order:       typeof order === "number" ? order : 0,
        isPublished: false,
      },
    });

    return NextResponse.json({ ok: true, resident });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Create failed";
    if (msg.includes("Unique constraint")) {
      return NextResponse.json({ error: "A resident with that slug already exists." }, { status: 409 });
    }
    console.error("[hw-admin/residents POST]", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PATCH — update resident fields (including isPublished, story, personality, order)
export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { slug, ...fields } = await req.json();
    if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

    // Only allow safe fields to be updated
    const allowed = ["name", "tagline", "story", "personality", "order", "isPublished", "portraitKey"];
    const data: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in fields) data[key] = fields[key];
    }

    const resident = await db.resident.update({
      where: { slug },
      data,
    });

    return NextResponse.json({ ok: true, resident });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Update failed";
    console.error("[hw-admin/residents PATCH]", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE — delete a resident by slug
export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { slug } = await req.json();
    if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });
    await db.resident.delete({ where: { slug } });
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Delete failed";
    console.error("[hw-admin/residents DELETE]", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}