// app/api/hw-admin/collections/upload-thumbnail/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, BUCKET } from "@/lib/r2";
import { db } from "@/lib/db";

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
    const slug = formData.get("slug") as string;

    if (!file || !slug) {
      return NextResponse.json({ error: "file and slug are required" }, { status: 400 });
    }

    const collection = await db.collection.findUnique({ where: { slug } });
    if (!collection) {
      return NextResponse.json({ error: `Collection "${slug}" not found` }, { status: 404 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const mime = file.type || "image/jpeg";
    const r2Key = `obsession-thumbnails/${slug}/${slug}.${ext}`;

    await r2.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: r2Key,
      Body: buffer,
      ContentType: mime,
    }));

    const updated = await db.collection.update({
      where: { slug },
      data: { thumbnail: r2Key },
      select: { id: true, slug: true, thumbnail: true },
    });

    const r2Base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "";
    return NextResponse.json({
      ok: true,
      thumbnail: updated.thumbnail,
      url: r2Base ? `${r2Base}/${r2Key}` : r2Key,
    });
  } catch (err) {
    console.error("[collections/upload-thumbnail POST]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}