/**
 * premium-lock.ts
 * Utility for determining whether a wallpaper is currently in a "premium locked" state.
 *
 * Logic: Items rotate on a 72-hour cycle. The first 48 h they are publicly
 * visible; the final 24 h they are locked back in the vault.
 */

/**
 * Returns true when the item should be treated as premium-locked.
 *
 * @param updatedAt - The date the item was last updated / promoted (Date or ISO string).
 *                    Pass null/undefined to treat the item as always unlocked.
 */
export function isPremiumLocked(updatedAt: Date | string | null | undefined): boolean {
  if (!updatedAt) return false;

  const updated = typeof updatedAt === "string" ? new Date(updatedAt) : updatedAt;
  if (isNaN(updated.getTime())) return false;

  const hoursOld = (Date.now() - updated.getTime()) / (1000 * 60 * 60);
  const cycle = hoursOld % 72;

  // Locked during the last 24 h of each 72-hour cycle (hours 48–72)
  return cycle > 48;
}

/**
 * Server-side mirror of the GLOBAL vault clock used by
 * components/PremiumLockedGate.tsx on the client. All "badge-premium"
 * items lock/unlock together on a single shared 48h-unlocked / 24h-locked
 * cycle, anchored to a fixed epoch — NOT per-item like isPremiumLocked above.
 *
 * IMPORTANT: these constants must stay in sync with PremiumLockedGate.tsx.
 * This function is the server-side source of truth and MUST be checked
 * by any route that serves a premium-tagged file (downloads, etc.) — the
 * client-side gate only hides the UI, it enforces nothing on its own.
 */
const VAULT_EPOCH_MS  = Date.UTC(2025, 0, 1, 0, 0, 0);
const VAULT_CYCLE_MS  = 48 * 60 * 60 * 1000;
const VAULT_UNLOCK_MS = 24 * 60 * 60 * 1000;

export function isGloballyPremiumLocked(): boolean {
  const pos = (Date.now() - VAULT_EPOCH_MS) % VAULT_CYCLE_MS;
  return pos >= VAULT_UNLOCK_MS;
}

/** True if this image's tags mark it premium AND the global vault is currently locked. */
export function isImagePremiumLocked(tags: string[] | null | undefined): boolean {
  if (!tags || !tags.includes("badge-premium")) return false;
  return isGloballyPremiumLocked();
}