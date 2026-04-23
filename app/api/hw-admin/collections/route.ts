import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function checkAuth(req: NextRequest) {
  const pw = req.headers.get("x-admin-password");
  const correct = process.env.ADMIN_PASSWORD ?? "haunted-admin-2025";
  return pw === correct;
}

// GET — list all collections (id, slug, title, category, description, metaDescription)
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  if (slug) {
    const collection = await db.collection.findUnique({
      where: { slug },
      select: { id: true, slug: true, title: true, category: true, description: true, metaDescription: true, thumbnail: true },
    });
    return NextResponse.json({ collection: collection ?? null });
  }

  const collections = await db.collection.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, slug: true, title: true, category: true,
      description: true, metaDescription: true, thumbnail: true,
      _count: { select: { images: true } },
    },
  });
  return NextResponse.json({ collections });
}

// POST — create a new collection
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { title, slug, category, icon, bgClass, tag, featured, description } = await req.json();
    if (!title?.trim() || !slug?.trim()) {
      return NextResponse.json({ error: "title and slug are required" }, { status: 400 });
    }

    const collection = await db.collection.create({
      data: {
        title:       title.trim(),
        slug:        slug.trim(),
        category:    category?.trim()  || "General",
        icon:        icon?.trim()      || "🖤",
        bgClass:     bgClass?.trim()   || "p-bg-1",
        tag:         tag?.trim()       || "Collection",
        featured:    featured === true,
        description: description?.trim() || "",
        thumbnail:   "",
      },
    });

    return NextResponse.json({ ok: true, collection });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Create failed";
    if (msg.includes("Unique constraint")) {
      return NextResponse.json({ error: "A collection with that slug already exists." }, { status: 409 });
    }
    console.error("[admin/collections POST]", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE — delete a collection by slug
export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { slug } = await req.json();
    if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });
    await db.collection.delete({ where: { slug } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/collections DELETE]", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { slug, description, metaDescription } = await req.json();
    if (!slug) return NextResponse.json({ error: "slug is required" }, { status: 400 });

    const updated = await db.collection.update({
      where: { slug },
      data: {
        ...(description !== undefined ? { description } : {}),
        ...(metaDescription !== undefined ? { metaDescription: metaDescription || null } : {}),
      },
      select: { id: true, slug: true, title: true, description: true, metaDescription: true },
    });

    return NextResponse.json({ ok: true, collection: updated });
  } catch (err) {
    console.error("[admin/collections PATCH]", err);
    return NextResponse.json({ error: "Failed to update collection" }, { status: 500 });
  }
}