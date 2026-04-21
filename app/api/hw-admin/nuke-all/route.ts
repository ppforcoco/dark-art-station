// app/api/hw-admin/nuke-all/route.ts
// ⚠️  IRREVERSIBLE — deletes every image, collection, and download from DB + R2.
// Requires both the admin password AND a separate NUKE_CONFIRM_PHRASE env var
// (or the default phrase) to prevent accidental triggers.

import { NextRequest, NextResponse } from "next/server";
import {
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import { r2, BUCKET } from "@/lib/r2";
import { db } from "@/lib/db";

const ADMIN_PW     = process.env.ADMIN_PASSWORD      ?? "haunted-admin-2025";
const NUKE_PHRASE  = process.env.NUKE_CONFIRM_PHRASE ?? "DELETE EVERYTHING";

function checkAuth(req: NextRequest) {
  return req.headers.get("x-admin-password") === ADMIN_PW;
}

// Delete all objects in R2 bucket in batches of 1000 (S3 API limit)
async function wipeR2(): Promise<{ deleted: number; errors: number }> {
  let deleted = 0;
  let errors  = 0;
  let continuationToken: string | undefined;

  do {
    const list = await r2.send(
      new ListObjectsV2Command({
        Bucket:            BUCKET,
        ContinuationToken: continuationToken,
        MaxKeys:           1000,
      })
    );

    const objects = list.Contents ?? [];
    if (objects.length > 0) {
      const result = await r2.send(
        new DeleteObjectsCommand({
          Bucket: BUCKET,
          Delete: {
            Objects: objects.map((o) => ({ Key: o.Key! })),
            Quiet:   true,
          },
        })
      );
      deleted += objects.length - (result.Errors?.length ?? 0);
      errors  += result.Errors?.length ?? 0;
    }

    continuationToken = list.IsTruncated ? list.NextContinuationToken : undefined;
  } while (continuationToken);

  return { deleted, errors };
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { confirmPhrase?: string } = {};
  try { body = await req.json(); } catch { /* empty body is fine */ }

  if (body.confirmPhrase !== NUKE_PHRASE)
    return NextResponse.json(
      { error: `Wrong confirmation phrase. Expected: "${NUKE_PHRASE}"` },
      { status: 400 }
    );

  try {
    // 1 — Wipe DB (order matters due to foreign keys)
    const [downloads, images, collections] = await Promise.all([
      db.download.deleteMany({}),
      db.image.deleteMany({}),
      db.collection.deleteMany({}),
    ]);

    // 2 — Wipe R2
    const r2Result = await wipeR2();

    return NextResponse.json({
      ok: true,
      db: {
        downloadsDeleted:   downloads.count,
        imagesDeleted:      images.count,
        collectionsDeleted: collections.count,
      },
      r2: r2Result,
    });
  } catch (err) {
    console.error("[NUKE_ALL]", err);
    return NextResponse.json({ error: "Nuke failed", detail: String(err) }, { status: 500 });
  }
}