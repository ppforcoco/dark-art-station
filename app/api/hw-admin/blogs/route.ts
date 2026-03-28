import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function checkAuth(req: NextRequest) {
  const pw = req.headers.get("x-admin-password");
  const correct = process.env.ADMIN_PASSWORD ?? "haunted-admin-2025";
  return pw === correct;
}

// GET — list all posts (includes content for editing)
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
    select: { slug: true, title: true, label: true, featuredImage: true, content: true, createdAt: true },
  });
  return NextResponse.json({ posts });
}

// POST — create a new post
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { title, slug, content, label, createdAt, featuredImage } = await req.json();
    if (!title || !slug || !content) {
      return NextResponse.json({ error: "title, slug, and content are required" }, { status: 400 });
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json({ error: "Slug can only contain lowercase letters, numbers, and hyphens" }, { status: 400 });
    }
    const existing = await prisma.blogPost.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: `A post with slug "${slug}" already exists` }, { status: 409 });
    }
    const post = await prisma.blogPost.create({
      data: {
        slug, title,
        label: label ?? "Guide",
        content,
        featuredImage: featuredImage ?? null,
        ...(createdAt ? { createdAt: new Date(createdAt) } : {}),
      },
    });
    return NextResponse.json({ ok: true, slug: post.slug });
  } catch (err) {
    console.error("[admin/blogs POST]", err);
    return NextResponse.json({ error: "Failed to save post" }, { status: 500 });
  }
}

// PATCH — full edit OR backdate OR set featuredImage
// Supports:
//   { slug, title, content, label, featuredImage }  — full edit
//   { slug, featuredImage }                          — thumbnail only
//   { slug, createdAt }                              — backdate single
//   { updates: [{ slug, createdAt }] }               — bulk backdate
export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();

    // ── Full content edit: { slug, title, content, label, featuredImage } ──
    if (body.slug && body.content && !body.updates) {
      const { slug, title, content, label, featuredImage } = body;
      const updated = await prisma.blogPost.update({
        where: { slug },
        data: {
          ...(title ? { title } : {}),
          ...(content ? { content } : {}),
          ...(label ? { label } : {}),
          ...("featuredImage" in body ? { featuredImage: featuredImage ?? null } : {}),
        },
      });
      return NextResponse.json({ ok: true, slug: updated.slug });
    }

    // ── Thumbnail only: { slug, featuredImage } ──
    if (body.slug && "featuredImage" in body && !body.content && !body.updates) {
      const { slug, featuredImage } = body;
      await prisma.blogPost.update({
        where: { slug },
        data: { featuredImage: featuredImage ?? null },
      });
      return NextResponse.json({ ok: true, slug, featuredImage });
    }

    // ── Bulk/single backdate ──
    const updates: { slug: string; createdAt: string }[] = Array.isArray(body.updates)
      ? body.updates
      : [{ slug: body.slug, createdAt: body.createdAt }];

    if (!updates.length || !updates[0].slug || !updates[0].createdAt) {
      return NextResponse.json(
        { error: "Provide { slug, content } for edit, { slug, createdAt } for backdate, or { updates: [...] } for bulk." },
        { status: 400 }
      );
    }

    const results = [];
    for (const { slug, createdAt } of updates) {
      const date = new Date(createdAt);
      if (isNaN(date.getTime())) { results.push({ slug, ok: false, error: "Invalid date" }); continue; }
      try {
        await prisma.blogPost.update({ where: { slug }, data: { createdAt: date } });
        results.push({ slug, ok: true, createdAt: date.toISOString() });
      } catch {
        results.push({ slug, ok: false, error: "Post not found or DB error" });
      }
    }
    const allOk = results.every((r) => r.ok);
    return NextResponse.json({ ok: allOk, results }, { status: allOk ? 200 : 207 });
  } catch (err) {
    console.error("[admin/blogs PATCH]", err);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

// DELETE — remove a post by slug
export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { slug } = await req.json();
    await prisma.blogPost.delete({ where: { slug } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}