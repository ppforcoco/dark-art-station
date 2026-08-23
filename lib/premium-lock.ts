/**
 * premium-lock.ts
 * Premium lock/unlock rotation has been disabled site-wide.
 * Premium items now just show their "PREMIUM" badge permanently and are
 * always downloadable — nothing ever gets locked away.
 *
 * These functions are kept (always returning false) so every file that
 * still imports them keeps working without needing individual edits.
 */

export function isPremiumLocked(_updatedAt?: Date | string | null): boolean {
  return false;
}

export function isGloballyPremiumLocked(): boolean {
  return false;
}

export function isImagePremiumLocked(_tags?: string[] | null): boolean {
  return false;
}