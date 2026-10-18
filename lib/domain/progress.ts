import type { Goal, GoalAssignment, GoalStatus } from "@/types";

export const GOAL_STATUSES: GoalStatus[] = ["On track", "Needs assistance", "Completed"];

/** Average progress across assigned members, 0-100. */
export function goalProgress(goal: Pick<Goal, "assignments">): number {
  if (goal.assignments.length === 0) return 0;
  const total = goal.assignments.reduce((sum, a) => sum + a.progress, 0);
  return Math.round(total / goal.assignments.length);
}

/** Goal-level status summarizes member statuses: any struggling member means "Needs assistance". */
export function deriveGoalStatus(assignments: GoalAssignment[]): GoalStatus {
  if (assignments.length > 0 && assignments.every((a) => a.status === "Completed")) return "Completed";
  if (assignments.some((a) => a.status === "Needs assistance")) return "Needs assistance";
  return "On track";
}

/** Progress of one member on one goal, or 0 if they are not assigned. */
export function memberProgress(goal: Pick<Goal, "assignments">, userId: string): GoalAssignment | undefined {
  return goal.assignments.find((a) => a.userId === userId);
}
