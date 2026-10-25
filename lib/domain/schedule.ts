import type { Goal, Point, ScheduleItem } from "@/types";
import { nextWeeklyOccurrence } from "./time";

/**
 * Builds the schedule feed for a set of points and goals.
 * Each point contributes its next two weekly meetings. Each goal contributes its deadline.
 */
export function buildScheduleItems(points: Point[], goals: Goal[], from: Date = new Date()): ScheduleItem[] {
  const items: ScheduleItem[] = [];

  for (const point of points) {
    const first = nextWeeklyOccurrence(point.schedule, from);
    // Resolve the second week through the timezone helper too: adding 7 * 24h of
    // absolute time drifts by an hour across a DST boundary.
    const occurrences = [first, nextWeeklyOccurrence(point.schedule, new Date(first.getTime() + 1))];
    occurrences.forEach((at, index) => {
      items.push({
        id: `${point.id}-meeting-${index}`,
        kind: "meeting",
        title: point.title,
        at: at.toISOString(),
        chordId: point.chordId,
        pointId: point.id,
        href: `/points/${point.id}`,
      });
    });
  }

  for (const goal of goals) {
    const point = points.find((p) => p.id === goal.pointId);
    items.push({
      id: `${goal.id}-deadline`,
      kind: "deadline",
      title: goal.title,
      at: goal.deadline,
      chordId: point?.chordId,
      pointId: goal.pointId,
      href: `/points/${goal.pointId}`,
    });
  }

  return items.sort((a, b) => a.at.localeCompare(b.at));
}
