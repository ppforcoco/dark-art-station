import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSignedDownloadUrl } from "@/lib/r2";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Missing collection ID" }, { status: 400 });
    }

    const collection = await db.collection.findUnique({
      where: { id },
      select: { id: true, title: true, downloadUrl: true, isFree: true },
    });

    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    if (!collection.downloadUrl) {
      return NextResponse.json({ error: "No download available" }, { status: 404 });
    }

    const signedUrl = await getSignedDownloadUrl(collection.downloadUrl);

    const ipHeader = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "";
    const ipHash = await hashIp(ipHeader.split(",")[0].trim());

    db.download.create({
      data: { collectionId: collection.id, ipHash },
    }).catch(() => {});

    return NextResponse.redirect(signedUrl);

  } catch (err) {
    console.error("[DOWNLOAD_ROUTE]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function hashIp(ip: string): Promise<string> {
  if (!ip) return "";
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + (process.env.IP_HASH_SALT ?? "voidcanvas-salt"));
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
}