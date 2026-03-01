import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export const BUCKET = process.env.R2_BUCKET_NAME ?? "haunted-wallpapers-assets";

/**
 * Generate a time-limited signed URL for any private R2 object.
 */
export async function getSignedDownloadUrl(
  objectKey: string,
  expiresInSeconds = 60 * 15
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: objectKey,
  });
  return getSignedUrl(r2, command, { expiresIn: expiresInSeconds });
}

/**
 * Build a public CDN URL for any public R2 asset.
 * Falls back to NEXT_PUBLIC_R2_PUBLIC_URL so it works in both
 * server-side and client-side (browser) contexts.
 */
export function getPublicUrl(objectKey: string): string {
  const base = (
    process.env.R2_PUBLIC_URL ??
    process.env.NEXT_PUBLIC_R2_PUBLIC_URL ??
    ""
  ).replace(/\/$/, "");
  return `${base}/${objectKey}`;
}

// ── Convenience wrappers ────────────────────────────────────────────────────

export function getCollectionThumbnailUrl(collectionSlug: string): string {
  return getPublicUrl(`thumbnails/${collectionSlug}/${collectionSlug}.jpeg`);
}

export function getImageThumbnailUrl(collectionSlug: string, imageSlug: string): string {
  return getPublicUrl(`thumbnails/${collectionSlug}/${imageSlug}.jpeg`);
}

// highResKey is PRIVATE — always use getSignedDownloadUrl for these
export function buildHighResKey(collectionSlug: string, imageSlug: string): string {
  return `high-res/${collectionSlug}/${imageSlug}.jpeg`;
}