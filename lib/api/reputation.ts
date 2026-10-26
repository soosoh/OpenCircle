import * as repo from "@/lib/database/repository";
import { applyAward, groupSuccessRate, type AwardInput } from "@/lib/domain/reputation";

/**
 * Server-side reputation bookkeeping, called by the actions in actions.ts after the
 * action itself has been permission-checked and saved. Not a "use server" module on
 * purpose: these are internal helpers, never callable from the browser.
 *
 * Writes are read-modify-write on the user document (see supabase-store.ts), and a failure
 * here must never undo or hide the action that earned the award, so errors are logged.
 */

/** Records one reputation award for a user. Silently ignores duplicates and capped awards. */
export async function awardReputation(userId: string, award: Omit<AwardInput, "at"> & { at?: Date }): Promise<void> {
  try {
    const user = await repo.getUser(userId);
    if (!user) return;
    const next = applyAward(user, { ...award, at: award.at ?? new Date() });
    if (next) await repo.updateUser(userId, next);
  } catch (error) {
    console.error("Could not record a reputation award.", error);
  }
}

/** Recomputes a moderator's group success rate from their points' goals and saves it. */
export async function refreshGroupSuccess(moderatorId: string): Promise<void> {
  try {
    const [user, points, goals] = await Promise.all([repo.getUser(moderatorId), repo.listPoints(), repo.listGoals()]);
    if (!user) return;
    const rate = groupSuccessRate(moderatorId, points, goals);
    if (rate !== null && rate !== user.groupSuccessRate) await repo.updateUser(moderatorId, { groupSuccessRate: rate });
  } catch (error) {
    console.error("Could not refresh the group success rate.", error);
  }
}
