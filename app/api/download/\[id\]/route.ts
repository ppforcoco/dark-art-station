import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSignedDownloadUrl } from "@/lib/r2";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Missing collection ID" }, { status: 400 });
    }

    // Fetch the collection record to get the R2 object key
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

    // Generate a 5-minute signed URL — user gets redirected directly to R2
    // This means zero bandwidth cost on your server for large ZIP files
    const signedUrl = await getSignedDownloadUrl(collection.downloadUrl);

    // Log the download event (fire-and-forget, don't block the response)
    const ipHeader = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "";
    const ipHash = await hashIp(ipHeader.split(",")[0].trim());

    db.download.create({
      data: {
        collectionId: collection.id,
        ipHash,
      },
    }).catch(() => {}); // non-blocking, silent fail

    // Redirect the browser to the signed R2 URL
    return NextResponse.redirect(signedUrl);

  } catch (err) {
    console.error("[DOWNLOAD_ROUTE]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Hash the IP so we store no PII — GDPR-friendly approach
async function hashIp(ip: string): Promise<string> {
  if (!ip) return "";
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + (process.env.IP_HASH_SALT ?? "voidcanvas-salt"));
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
}