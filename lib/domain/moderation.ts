import type { User } from "@/types";

/** Minimum reputation (0-100) before someone can be picked as a moderator. */
export const MIN_MODERATOR_REPUTATION = 50;

/**
 * Trust-style score (0-1) combining subject familiarity, experience, past group success,
 * and community reputation.
 */
export function scoreModerator(user: User, chordId: string): number {
  const familiarity = user.subjects.includes(chordId) ? 1 : 0;
  const experience = { Beginner: 0.25, Intermediate: 0.5, Advanced: 0.75, Expert: 1 }[user.experienceLevel];
  const success = Math.min(Math.max(user.groupSuccessRate, 0), 1);
  const reputation = Math.min(Math.max(user.reputation / 100, 0), 1);
  return 0.35 * familiarity + 0.2 * experience + 0.25 * success + 0.2 * reputation;
}

/** Picks the highest-scoring eligible user for a chord. Returns undefined when nobody qualifies. */
export function selectModerator(users: User[], chordId: string): User | undefined {
  return users
    .filter((u) => u.reputation >= MIN_MODERATOR_REPUTATION)
    .sort((a, b) => scoreModerator(b, chordId) - scoreModerator(a, chordId))[0];
}
