// app/api/hw-admin/nuke-all/route.ts
// ⚠️  IRREVERSIBLE — deletes every image, collection, and download from DB + R2.
// Requires both the admin password AND the confirmation phrase to prevent accidents.

import { NextRequest, NextResponse } from "next/server";
import {
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import { r2, BUCKET } from "@/lib/r2";
import { db } from "@/lib/db";

const ADMIN_PW    = process.env.ADMIN_PASSWORD      ?? "haunted-admin-2025";
const NUKE_PHRASE = process.env.NUKE_CONFIRM_PHRASE ?? "DELETE EVERYTHING";

function checkAuth(req: NextRequest) {
  return req.headers.get("x-admin-password") === ADMIN_PW;
}

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
  try { body = await req.json(); } catch { /* empty body fine */ }

  if (body.confirmPhrase !== NUKE_PHRASE)
    return NextResponse.json(
      { error: `Wrong confirmation phrase. Expected: "${NUKE_PHRASE}"` },
      { status: 400 }
    );

  try {
    // Delete in strict FK order — children before parents, one at a time
    const downloads   = await db.download.deleteMany({});
    const images      = await db.image.deleteMany({});
    const collections = await db.collection.deleteMany({});

    // Standalone models — safe to delete in any order, ignore if missing
    await db.blogPost.deleteMany({}).catch(() => {});
    await db.pageContent.deleteMany({}).catch(() => {});

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
    return NextResponse.json(
      { error: "Nuke failed", detail: String(err) },
      { status: 500 }
    );
  }
}