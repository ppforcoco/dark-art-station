// app/api/hw-admin/shop/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function checkAuth(req: NextRequest) {
  const pw = req.headers.get("x-admin-password");
  const correct = process.env.ADMIN_PASSWORD ?? "haunted-admin-2025";
  return pw === correct;
}

// GET — list all products, or one by slug (?slug=...)
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  if (slug) {
    const product = await db.product.findUnique({ where: { slug } });
    return NextResponse.json({ product: product ?? null });
  }

  const products = await db.product.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ products });
}

// POST — create a new product
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const {
      name, slug, category, variantLabel, variants,
      price, compareAtPrice, descriptionHtml, badge, featured,
    } = await req.json();

    if (!name?.trim() || !slug?.trim() || !category?.trim() || price === undefined) {
      return NextResponse.json({ error: "name, slug, category and price are required" }, { status: 400 });
    }

    const product = await db.product.create({
      data: {
        name:            name.trim(),
        slug:            slug.trim(),
        category:        category.trim(),
        variantLabel:    variantLabel?.trim() || "Option",
        variants:        Array.isArray(variants) ? variants.filter(Boolean) : [],
        price:           Number(price),
        compareAtPrice:  compareAtPrice ? Number(compareAtPrice) : null,
        descriptionHtml: descriptionHtml ?? "",
        badge:           badge?.trim() || null,
        featured:        featured === true,
        isPublished:     false, // publish explicitly via PATCH once images are uploaded
      },
    });

    return NextResponse.json({ ok: true, product });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Create failed";
    if (msg.includes("Unique constraint")) {
      return NextResponse.json({ error: "A product with that slug already exists." }, { status: 409 });
    }
    console.error("[admin/shop POST]", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PATCH — update a product by slug
export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const {
      slug, newSlug, name, category, variantLabel, variants,
      price, compareAtPrice, descriptionHtml, badge, featured, isPublished,
    } = await req.json();

    if (!slug) return NextResponse.json({ error: "slug is required" }, { status: 400 });

    const updated = await db.product.update({
      where: { slug },
      data: {
        ...(newSlug !== undefined ? { slug: newSlug.trim() } : {}),
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(category !== undefined ? { category: category.trim() } : {}),
        ...(variantLabel !== undefined ? { variantLabel: variantLabel.trim() || "Option" } : {}),
        ...(variants !== undefined ? { variants: Array.isArray(variants) ? variants.filter(Boolean) : [] } : {}),
        ...(price !== undefined ? { price: Number(price) } : {}),
        ...(compareAtPrice !== undefined ? { compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null } : {}),
        ...(descriptionHtml !== undefined ? { descriptionHtml } : {}),
        ...(badge !== undefined ? { badge: badge?.trim() || null } : {}),
        ...(featured !== undefined ? { featured: Boolean(featured) } : {}),
        ...(isPublished !== undefined ? { isPublished: Boolean(isPublished) } : {}),
      },
    });

    return NextResponse.json({ ok: true, product: updated });
  } catch (err) {
    console.error("[admin/shop PATCH]", err);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

// DELETE — delete a product by slug
export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { slug } = await req.json();
    if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });
    await db.product.delete({ where: { slug } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/shop DELETE]", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}