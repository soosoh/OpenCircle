import type { Goal, Point, ReputationEvent, ReputationKind, User } from "@/types";

/**
 * Reputation, 0-100. Everyone starts at 50 and it only goes up, through a few deliberate
 * actions. Each award has a dedupe key, so undoing and redoing an action (or spamming one)
 * can never farm points. Showing up in chat earns nothing on purpose: it is rewarded
 * on the dashboard's streak instead, and spam would otherwise buy moderator status.
 */
export const REPUTATION_START = 50;
export const REPUTATION_MAX = 100;
/** Oldest entries fall off so the user document stays small; keys older than this can repeat. */
export const REPUTATION_LOG_LIMIT = 100;

export const REPUTATION_RULES: Record<ReputationKind, { delta: number; label: string; rule: string }> = {
  "goal-completed": { delta: 3, label: "Finished a goal", rule: "Take a goal you were assigned to 100%." },
  "goal-set": { delta: 1, label: "Set a goal for the group", rule: "Moderators: record a goal for your point." },
  "request-resolved": { delta: 2, label: "Resolved a support request", rule: "Moderators: close a member's request for help." },
  "resource-shared": { delta: 1, label: "Shared a resource", rule: "Post a resource in a point's chat (3 a day count)." },
};

/** Resource shares that count toward reputation per UTC day. */
export const RESOURCE_DAILY_CAP = 3;

const clamp = (value: number) => Math.min(REPUTATION_MAX, Math.max(0, Math.round(value)));

export type AwardInput = { key: string; kind: ReputationKind; at: Date; pointId?: string };

/**
 * The user with an award applied, or null when it must not apply (same key already awarded,
 * or the daily cap for resource shares is used up). Pure: the caller saves the result.
 */
export function applyAward(user: User, award: AwardInput): Pick<User, "reputation" | "reputationLog"> | null {
  const log = user.reputationLog ?? [];
  if (log.some((entry) => entry.key === award.key)) return null;

  if (award.kind === "resource-shared") {
    const today = award.at.toISOString().slice(0, 10);
    const sharedToday = log.filter((entry) => entry.kind === "resource-shared" && entry.at.slice(0, 10) === today);
    if (sharedToday.length >= RESOURCE_DAILY_CAP) return null;
  }

  const reputation = clamp(user.reputation + REPUTATION_RULES[award.kind].delta);
  const entry: ReputationEvent = {
    key: award.key,
    kind: award.kind,
    delta: reputation - clamp(user.reputation),
    at: award.at.toISOString(),
    ...(award.pointId ? { pointId: award.pointId } : {}),
  };
  return { reputation, reputationLog: [...log, entry].slice(-REPUTATION_LOG_LIMIT) };
}

/** Pseudo-assignments at a 50% prior, so one finished goal does not make a new moderator "100%". */
const SUCCESS_PRIOR_WEIGHT = 3;

/**
 * Share (0-1) of assigned goals that members finished, across the points a moderator runs,
 * smoothed toward 50% while there is little data. Returns null when there is nothing to
 * measure yet, so the stored value is left alone.
 */
export function groupSuccessRate(moderatorId: string, points: Point[], goals: Goal[]): number | null {
  const mine = new Set(points.filter((point) => point.moderatorId === moderatorId).map((point) => point.id));
  const assignments = goals.filter((goal) => mine.has(goal.pointId)).flatMap((goal) => goal.assignments);
  if (assignments.length === 0) return null;
  const done = assignments.filter((assignment) => assignment.status === "Completed").length;
  return Math.round(((done + SUCCESS_PRIOR_WEIGHT / 2) / (assignments.length + SUCCESS_PRIOR_WEIGHT)) * 100) / 100;
}
