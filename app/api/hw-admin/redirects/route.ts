import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function checkAuth(req: NextRequest) {
  const pw = req.headers.get("x-admin-password");
  const correct = process.env.ADMIN_PASSWORD ?? "haunted-admin-2025";
  return pw === correct;
}

// GET — list all vanity redirects
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const redirects = await prisma.vanityRedirect.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(redirects);
}

// POST — create a new vanity redirect
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { slug, destination, label } = await req.json();

  if (!slug || !destination) {
    return NextResponse.json({ error: "slug and destination required" }, { status: 400 });
  }

  // Sanitize slug: lowercase, no spaces, only alphanumeric + hyphens
  const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

  try {
    const redirect = await prisma.vanityRedirect.create({
      data: { slug: cleanSlug, destination, label: label || null },
    });
    return NextResponse.json(redirect, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
  }
}

// DELETE — remove a vanity redirect
export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { slug } = await req.json();
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  await prisma.vanityRedirect.delete({ where: { slug } });
  return NextResponse.json({ ok: true });
}

// PATCH — update destination or label
export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { slug, destination, label } = await req.json();
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  const updated = await prisma.vanityRedirect.update({
    where: { slug },
    data: {
      ...(destination && { destination }),
      ...(label !== undefined && { label }),
    },
  });
  return NextResponse.json(updated);
}