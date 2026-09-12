// app/api/hw-admin/shop/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, BUCKET } from "@/lib/r2";
import { db } from "@/lib/db";

function checkAuth(req: NextRequest) {
  const pw = req.headers.get("x-admin-password");
  const correct = process.env.ADMIN_PASSWORD ?? "haunted-admin-2025";
  return pw === correct;
}

// POST — upload a product image. formData: file, slug, kind ("thumbnail" | "gallery" | "print")
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const slug = formData.get("slug") as string;
    const kind = (formData.get("kind") as string) || "thumbnail";

    if (!file || !slug) {
      return NextResponse.json({ error: "file and slug are required" }, { status: 400 });
    }

    const product = await db.product.findUnique({ where: { slug } });
    if (!product) {
      return NextResponse.json({ error: `Product "${slug}" not found` }, { status: 404 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const mime = file.type || "image/jpeg";
    const uniquePart = kind === "gallery" ? `${Date.now()}` : `${kind}-${Date.now()}`;
    const r2Key = `shop/${slug}/${uniquePart}.${ext}`;

    await r2.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: r2Key,
      Body: buffer,
      ContentType: mime,
    }));

    const updated =
      kind === "gallery"
        ? await db.product.update({
            where: { slug },
            data: { galleryKeys: { push: r2Key } },
            select: { id: true, slug: true, galleryKeys: true },
          })
        : kind === "digital"
        ? await db.product.update({
            where: { slug },
            data: { digitalFileKey: r2Key },
            select: { id: true, slug: true, digitalFileKey: true },
          })
        : await db.product.update({
            where: { slug },
            data: { thumbnailKey: r2Key },
            select: { id: true, slug: true, thumbnailKey: true },
          });

    const r2Base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "";
    return NextResponse.json({
      ok: true,
      key: r2Key,
      url: r2Base ? `${r2Base}/${r2Key}` : r2Key,
      product: updated,
    });
  } catch (err) {
    console.error("[admin/shop/upload POST]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}