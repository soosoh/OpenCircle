import { Badge, type Tone } from "./Badge";
import type { GoalStatus, PointStatus } from "@/types";

const GOAL_TONES: Record<GoalStatus, Tone> = {
  "On track": "mint",
  "Needs assistance": "sun",
  Completed: "brand",
};

const POINT_TONES: Record<PointStatus, Tone> = {
  Active: "mint",
  Recruiting: "brand",
  Paused: "muted",
};

export function GoalStatusBadge({ status }: { status: GoalStatus }) {
  return <Badge tone={GOAL_TONES[status]}>{status}</Badge>;
}

export function PointStatusBadge({ status }: { status: PointStatus }) {
  return <Badge tone={POINT_TONES[status]}>{status}</Badge>;
}
