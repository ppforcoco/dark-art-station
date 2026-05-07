import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

const BANNED_WORDS = [
  "spam", "fuck", "shit", "bitch", "asshole", "dick", "pussy", "cunt",
  "nigger", "faggot", "retard", "whore", "slut",
];

function containsBannedWords(text: string) {
  const lower = text.toLowerCase();
  return BANNED_WORDS.some((w) => lower.includes(w));
}

function hashIp(ip: string) {
  return crypto.createHash("sha256").update(ip + "hw-salt-2025").digest("hex").slice(0, 16);
}

// GET /api/comments/[imageId] — fetch approved comments
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ imageId: string }> }
) {
  const { imageId } = await params;

  const comments = await db.comment.findMany({
    where: { imageId, status: "approved" },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      name: true,
      message: true,
      likes: true,
      createdAt: true,
    },
  });

  return NextResponse.json(comments);
}

// POST /api/comments/[imageId] — submit a new wish
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ imageId: string }> }
) {
  const { imageId } = await params;

  // Check commentsEnabled on the image
  const image = await db.image.findUnique({
    where: { id: imageId },
    select: { commentsEnabled: true },
  });

  if (!image || !image.commentsEnabled) {
    return NextResponse.json({ error: "Comments not enabled for this image" }, { status: 403 });
  }

  const body = await req.json();
  const name = (body.name ?? "").trim().slice(0, 60);
  const message = (body.message ?? "").trim().slice(0, 500);

  if (!name || !message) {
    return NextResponse.json({ error: "Name and message are required" }, { status: 400 });
  }

  if (containsBannedWords(name) || containsBannedWords(message)) {
    return NextResponse.json({ error: "Message contains inappropriate content" }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  const ipHash = hashIp(ip);

  // Rate limit: max 3 comments per IP per image per day
  const oneDayAgo = new Date(Date.now() - 86400000);
  const recentCount = await db.comment.count({
    where: { imageId, ipHash, createdAt: { gte: oneDayAgo } },
  });

  if (recentCount >= 3) {
    return NextResponse.json({ error: "Too many wishes from this device today" }, { status: 429 });
  }

  const comment = await db.comment.create({
    data: { imageId, name, message, ipHash, status: "pending" },
  });

  return NextResponse.json({ id: comment.id, status: "pending" }, { status: 201 });
}