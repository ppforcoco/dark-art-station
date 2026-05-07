import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/comments/like/[commentId]
export async function POST(
  _req: NextRequest,
  { params }: { params: { commentId: string } }
) {
  try {
    await prisma.comment.update({
      where: { id: params.commentId },
      data: { likes: { increment: 1 } },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Like error:", err);
    return NextResponse.json({ error: "Failed to like comment" }, { status: 500 });
  }
}