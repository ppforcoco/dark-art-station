import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Simple admin auth check
function isAuthorized(req: NextRequest) {
  const key = req.headers.get("x-admin-key") || req.nextUrl.searchParams.get("key");
  return key === process.env.ADMIN_SECRET;
}

// GET /api/admin/comments?status=pending&key=xxx
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const status = req.nextUrl.searchParams.get("status") || "pending";
  const comments = await prisma.comment.findMany({
    where: { status },
    orderBy: { createdAt: "desc" },
    include: { image: { select: { slug: true, title: true } } },
  });
  return NextResponse.json(comments);
}

// PATCH /api/admin/comments?key=xxx  body: { id, action: "approve" | "delete" }
export async function PATCH(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id, action } = await req.json();
  if (!id || !["approve", "delete"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (action === "delete") {
    await prisma.comment.delete({ where: { id } });
    return NextResponse.json({ success: true, action: "deleted" });
  }
  const updated = await prisma.comment.update({
    where: { id },
    data: { status: "approved" },
  });
  return NextResponse.json({ success: true, comment: updated });
}