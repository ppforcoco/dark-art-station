import { revalidatePath } from "next/cache";

/**
 * Call this after any admin edit to a Collection (description, metaDescription,
 * thumbnail, publish state, rootSlug, etc). Without this, edits are correct in
 * the database immediately, but the public page is statically cached
 * (revalidate = 3600) and won't reflect the change for up to an hour.
 *
 * Revalidates BOTH possible URLs for the collection (/collections/{slug} and
 * the root /{slug}) since a collection can move between the two when its
 * rootSlug flag is toggled — cheap no-op for whichever path isn't in use.
 */
export function revalidateCollectionPage(slug: string) {
  try {
    revalidatePath(`/collections/${slug}`);
    revalidatePath(`/${slug}`);
  } catch (err) {
    // Non-fatal — worst case the page just falls back to the 1hr cache window.
    console.error("[revalidateCollectionPage] failed for", slug, err);
  }
}

/** Same idea, for an individual image's own detail page. */
export function revalidateImagePage(collectionSlug: string, imageSlug: string) {
  try {
    revalidatePath(`/collections/${collectionSlug}/${imageSlug}`);
    revalidatePath(`/${imageSlug}`);
  } catch (err) {
    console.error("[revalidateImagePage] failed for", imageSlug, err);
  }
}