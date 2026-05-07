import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function isAuthorized(req: NextRequest) {
  const pw = req.headers.get("x-admin-password");
  const correct = process.env.ADMIN_PASSWORD ?? "haunted-admin-2025";
  return pw === correct;
}

// GET /api/admin/comments?status=pending
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const status = req.nextUrl.searchParams.get("status") ?? "pending";

  const comments = await db.comment.findMany({
    where: status === "all" ? {} : { status },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      image: {
        select: { slug: true, title: true },
      },
    },
  });

  return NextResponse.json(comments);
}

// PATCH /api/admin/comments
// body: { id: string, action: "approve" | "delete" }
export async function PATCH(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, action } = await req.json();

  if (!id || !["approve", "delete"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (action === "delete") {
    await db.comment.delete({ where: { id } });
    return NextResponse.json({ success: true, action: "deleted" });
  }

  const updated = await db.comment.update({
    where: { id },
    data: { status: "approved" },
    select: { id: true, status: true },
  });

  return NextResponse.json({ success: true, comment: updated });
}