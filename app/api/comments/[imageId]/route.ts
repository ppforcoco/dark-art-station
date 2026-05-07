import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const BANNED_WORDS = [
  "porn","sex","nude","naked","xxx","fuck","shit","ass","bitch","cock","dick",
  "pussy","cunt","whore","slut","nigger","nigga","faggot","rape","kill yourself",
];

function containsBanned(text: string) {
  const lower = text.toLowerCase();
  return BANNED_WORDS.some((w) => lower.includes(w));
}

function hashIp(ip: string) {
  return crypto.createHash("sha256").update(ip + process.env.IP_HASH_SALT || "hw-salt").digest("hex").slice(0, 16);
}

// GET /api/comments/[imageId] — fetch approved comments sorted by likes
export async function GET(
  _req: NextRequest,
  { params }: { params: { imageId: string } }
) {
  try {
    const comments = await prisma.comment.findMany({
      where: { imageId: params.imageId, status: "approved" },
      orderBy: [{ likes: "desc" }, { createdAt: "asc" }],
      select: { id: true, name: true, message: true, likes: true, createdAt: true },
    });
    return NextResponse.json(comments);
  } catch (err) {
    console.error("GET comments error:", err);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

// POST /api/comments/[imageId] — submit a new wish
export async function POST(
  req: NextRequest,
  { params }: { params: { imageId: string } }
) {
  try {
    const body = await req.json();
    const name = (body.name || "").trim().slice(0, 50);
    const message = (body.message || "").trim().slice(0, 300);

    if (!name || name.length < 2) {
      return NextResponse.json({ error: "Name is too short." }, { status: 400 });
    }
    if (!message || message.length < 5) {
      return NextResponse.json({ error: "Message is too short." }, { status: 400 });
    }
    if (containsBanned(name) || containsBanned(message)) {
      return NextResponse.json({ error: "Inappropriate content detected." }, { status: 400 });
    }

    // Rate limit: max 3 per IP per day
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    const ipHash = hashIp(ip);
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentCount = await prisma.comment.count({
      where: { ipHash, createdAt: { gte: since } },
    });
    if (recentCount >= 3) {
      return NextResponse.json({ error: "Max 3 wishes per day. Come back tomorrow!" }, { status: 429 });
    }

    // Check image exists
    const image = await prisma.image.findUnique({ where: { id: params.imageId }, select: { id: true } });
    if (!image) {
      return NextResponse.json({ error: "Image not found." }, { status: 404 });
    }

    await prisma.comment.create({
      data: {
        imageId: params.imageId,
        name,
        message,
        status: "pending",
        ipHash,
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("POST comment error:", err);
    return NextResponse.json({ error: "Failed to submit wish." }, { status: 500 });
  }
}