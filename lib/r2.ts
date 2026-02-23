import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Cloudflare R2 is S3-compatible — we use the AWS SDK pointed at R2's endpoint
export const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT, // https://<account_id>.r2.cloudflarestorage.com
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export const BUCKET = process.env.R2_BUCKET_NAME ?? "haunted-wallpapers-assets";

/**
 * Generate a time-limited signed URL for a private R2 object.
 * Used by the download API route — never expose the raw key to the client.
 */
export async function getSignedDownloadUrl(
  objectKey: string,
  expiresInSeconds = 60 * 5 // 5 minutes — short enough to prevent link sharing
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: objectKey,
  });
  return getSignedUrl(r2, command, { expiresIn: expiresInSeconds });
}

/**
 * Build a public CDN URL for thumbnails (R2 public bucket / custom domain).
 * Thumbnails are public; ZIP files are private (signed URLs only).
 */
export function getThumbnailUrl(objectKey: string): string {
  const base = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");
  return `${base}/${objectKey}`;
}