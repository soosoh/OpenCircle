import type { ReactNode } from "react";
import { DotDigits } from "@/components/landing/mockups";
import { AvatarStack } from "@/components/ui/Avatar";
import { GoalStatusBadge } from "@/components/ui/StatusBadge";
import { ProgressTrack } from "@/components/point/ProgressTrack";
import { goalProgress } from "@/lib/domain/progress";
import { formatDateTime } from "@/lib/domain/time";
import type { Goal, User } from "@/types";

/**
 * Goal row for the point page. Shows the viewer's own progress when they are
 * assigned, otherwise the group average, with one dot-matrix number and one track.
 */
export function PointGoalCard({
  goal,
  members,
  viewerId,
  timeZone,
  footer,
}: {
  goal: Goal;
  members: User[];
  viewerId?: string;
  timeZone: string;
  /** The viewer's progress form, when they are a member. */
  footer?: ReactNode;
}) {
  const assignment = viewerId ? goal.assignments.find((entry) => entry.userId === viewerId) : undefined;
  const progress = assignment?.progress ?? goalProgress(goal);
  const completed = goal.status === "Completed" || progress === 100;
  // Server Component: re-rendered on every request, so reading the clock here is intentional.
  // eslint-disable-next-line react-hooks/purity
  const overdue = new Date(goal.deadline).getTime() < Date.now() && goal.status !== "Completed";

  const assignedPeople = goal.assignments
    .map((entry) => members.find((member) => member.id === entry.userId))
    .filter((member) => member !== undefined);
  const finished = goal.assignments.filter((entry) => entry.status === "Completed").length;

  return (
    <article className="space-y-4 rounded-2xl border border-line bg-surface p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-lg font-bold leading-tight tracking-tight text-ink">{goal.title}</h3>
            <GoalStatusBadge status={goal.status} />
          </div>
          <p className="mt-1.5 text-xs text-muted">
            Due {formatDateTime(goal.deadline, timeZone)}
            {overdue ? <span className="font-semibold text-coral"> · overdue</span> : null}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <div className="flex items-end justify-end gap-0.5">
            <DotDigits value={String(progress)} className="h-8 w-auto text-ink" />
            <span className="pb-px text-sm font-bold text-ink" aria-hidden="true">
              %
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted">
            <span className="sr-only">{progress}% </span>
            {assignment ? "your progress" : "group progress"}
          </p>
        </div>
      </div>

      {goal.description ? <p className="text-sm leading-6 text-ink">{goal.description}</p> : null}

      <ProgressTrack
        value={progress}
        size="md"
        tone={completed ? "mint" : "ink"}
        label={`${goal.title} ${assignment ? "your" : "group"} progress`}
      />

      {goal.resources.length > 0 ? (
        <p className="text-xs leading-5 text-muted">
          <span className="font-semibold text-ink">Resources</span> · {goal.resources.join(" · ")}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
        <div className="flex items-center gap-2">
          {assignedPeople.length > 0 ? <AvatarStack people={assignedPeople} size={24} /> : null}
          <span className="tnum text-xs text-muted">
            {goal.assignments.length} assigned · {finished} completed
          </span>
        </div>
      </div>

      {footer ? <div className="rounded-xl bg-sun-wash p-3.5">{footer}</div> : null}
    </article>
  );
}
