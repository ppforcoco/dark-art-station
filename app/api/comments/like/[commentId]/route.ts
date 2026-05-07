import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/comments/like/[commentId]
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const { commentId } = await params;

  const comment = await db.comment.findUnique({
    where: { id: commentId },
    select: { id: true, status: true },
  });

  if (!comment || comment.status !== "approved") {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  const updated = await db.comment.update({
    where: { id: commentId },
    data: { likes: { increment: 1 } },
    select: { likes: true },
  });

  return NextResponse.json({ likes: updated.likes });
}