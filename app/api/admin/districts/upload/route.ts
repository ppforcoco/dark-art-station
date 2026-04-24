// app/api/admin/districts/upload/route.ts
// POST multipart/form-data
// fields: files (File[]), tags (string — the district tag), districtId (string)
// Uploads to R2 and records in DB with the district tag auto-applied.

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

// Inline slugify — no external dependency needed
const slugify = (str: string): string =>
  str
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME!;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 20 * 1024 * 1024; // 20 MB

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const files = form.getAll("files") as File[];
  const districtTag  = form.get("tags")       as string | null;
  const deviceType   = form.get("deviceType") as string | null;

  if (!districtTag) {
    return NextResponse.json({ message: "District tag is required" }, { status: 400 });
  }
  if (!files || files.length === 0) {
    return NextResponse.json({ message: "No files provided" }, { status: 400 });
  }

  const results: { id: string; slug: string }[] = [];

  for (const file of files) {
    // Validate
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { message: `Unsupported file type: ${file.type}` },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { message: `File too large: ${file.name} (max 20MB)` },
        { status: 400 }
      );
    }

    // Build R2 key
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const baseName = file.name.replace(/\.[^/.]+$/, "");
    const safeName = slugify(baseName);
    const uuid = randomUUID().slice(0, 8);
    const r2Key = `wallpapers/${safeName}-${uuid}.${ext}`;

    // Upload to R2
    const buffer = Buffer.from(await file.arrayBuffer());
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: r2Key,
        Body: buffer,
        ContentType: file.type,
      })
    );

    // Create DB record — highResKey defaults to r2Key (no separate high-res for district uploads)
    const slug = `${safeName}-${uuid}`;
    const record = await db.image.create({
      data: {
        title: baseName,
        slug,
        r2Key,
        highResKey: r2Key,
        tags: [districtTag],
        isAdult: false,
        ...(deviceType ? { deviceType: deviceType as "IPHONE" | "ANDROID" | "PC" } : {}),
      },
    });

    results.push({ id: record.id, slug: record.slug });
  }

  return NextResponse.json({ count: results.length, images: results });
}