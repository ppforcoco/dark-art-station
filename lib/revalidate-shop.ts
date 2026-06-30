import { revalidatePath } from "next/cache";

/**
 * Call this after any admin edit to a Collection (description, metaDescription,
 * thumbnail, publish state, etc). Without this, edits are correct in the
 * database immediately, but the public /collections/[slug] page is statically
 * cached (revalidate = 3600 in app/collections/[slug]/page.tsx) and won't reflect
 * the change for up to an hour.
 */
export function revalidateCollectionPage(slug: string) {
  try {
    revalidatePath(`/collections/${slug}`);
  } catch (err) {
    // Non-fatal — worst case the page just falls back to the 1hr cache window.
    console.error("[revalidateCollectionPage] failed for", slug, err);
  }
}