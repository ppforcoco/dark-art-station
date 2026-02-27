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
 * Used for both collection ZIPs and individual image high-res downloads.
 */
export async function getSignedDownloadUrl(
  objectKey: string,
  expiresInSeconds = 60 * 5
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: objectKey,
  });
  return getSignedUrl(r2, command, { expiresIn: expiresInSeconds });
}

/**
 * Build a public CDN URL for any public R2 asset.
 * Works for both flat keys (thumbnails/slug.webp)
 * and nested keys (thumbnails/collection-slug/image-slug.webp).
 */
export function getPublicUrl(objectKey: string): string {
  const base = (process.env.R2_PUBLIC_URL ?? "").replace(/\/$/, "");
  return `${base}/${objectKey}`;
}

// Convenience wrappers — keeps consumers clean

export function getCollectionThumbnailUrl(collectionSlug: string): string {
  return getPublicUrl(`thumbnails/${collectionSlug}.webp`);
}

export function getImageThumbnailUrl(collectionSlug: string, imageSlug: string): string {
  return getPublicUrl(`thumbnails/${collectionSlug}/${imageSlug}.webp`);
}

// highResKey is PRIVATE — always use getSignedDownloadUrl for these
export function buildHighResKey(collectionSlug: string, imageSlug: string): string {
  return `high-res/${collectionSlug}/${imageSlug}.png`;
}