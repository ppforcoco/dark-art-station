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