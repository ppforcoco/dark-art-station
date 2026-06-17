// app/api/hw-admin/upload-blog-image/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, BUCKET } from "@/lib/r2";

function checkAuth(req: NextRequest) {
  const pw = req.headers.get("x-admin-password");
  const correct = process.env.ADMIN_PASSWORD ?? "haunted-admin-2025";
  return pw === correct;
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const mime = file.type || "image/jpeg";

    // Unique filename using timestamp + original name (sanitised)
    const safeName = file.name
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9.\-_]/g, "")
      .toLowerCase();
    const r2Key = `blog/${Date.now()}-${safeName}`;

    await r2.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: r2Key,
        Body: buffer,
        ContentType: mime,
      })
    );

    const r2Base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "";
    const publicUrl = r2Base ? `${r2Base}/${r2Key}` : r2Key;

    return NextResponse.json({
      ok: true,
      key: r2Key,
      url: publicUrl,
    });
  } catch (err) {
    console.error("[upload-blog-image POST]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}