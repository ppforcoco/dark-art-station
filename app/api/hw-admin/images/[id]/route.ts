import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function checkAuth(req: NextRequest) {
  const pw = req.headers.get("x-admin-password");
  const correct = process.env.ADMIN_PASSWORD ?? "haunted-admin-2025";
  return pw === correct;
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!id)
    return NextResponse.json({ error: "id required" }, { status: 400 });

  try {
    await db.image.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[images DELETE]", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const image = await db.image.findUnique({ where: { id } });
    if (!image)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(image);
  } catch (err) {
    console.error("[images GET by id]", err);
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const body = await req.json();
    const { title, description, altText, tags, isAdult, deviceType, sortOrder, highResKey } = body;

    const updated = await db.image.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(altText !== undefined && { altText }),
        ...(tags !== undefined && { tags }),
        ...(isAdult !== undefined && { isAdult }),
        ...(deviceType !== undefined && { deviceType }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(highResKey !== undefined && { highResKey }),
      },
    });

    return NextResponse.json({ ok: true, slug: updated.slug });
  } catch (err) {
    console.error("[images PATCH by id]", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}