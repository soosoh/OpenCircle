import type { ReactNode } from "react";
import { AvatarStack } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { GoalStatusBadge } from "@/components/ui/StatusBadge";
import { ProgressTrack } from "@/components/point/ProgressTrack";
import { goalProgress } from "@/lib/domain/progress";
import { formatDateTime } from "@/lib/domain/time";
import type { Goal, User } from "@/types";

/**
 * Goal row for the point page. Shows the viewer's own progress when they are
 * assigned, otherwise the group average, with one track and one number.
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
    <Card className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-display text-base font-bold tracking-tight text-ink">{goal.title}</h3>
          <p className="mt-1 text-xs text-muted">
            Due {formatDateTime(goal.deadline, timeZone)}
            {overdue ? <span className="text-coral"> · overdue</span> : null}
          </p>
        </div>
        <GoalStatusBadge status={goal.status} />
      </div>

      {goal.description ? <p className="text-sm leading-6 text-muted">{goal.description}</p> : null}

      <div>
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[13px] text-muted">{assignment ? "Your progress" : "Group progress"}</p>
          <p className="tnum text-sm font-semibold text-ink">{progress}%</p>
        </div>
        <div className="mt-2">
          <ProgressTrack
            value={progress}
            tone={completed ? "mint" : "ink"}
            label={`${goal.title} ${assignment ? "your" : "group"} progress`}
          />
        </div>
      </div>

      {goal.resources.length > 0 ? (
        <p className="text-xs leading-5 text-muted">
          <span className="font-medium text-ink/70">Resources</span> · {goal.resources.join(" · ")}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
        <div className="flex items-center gap-2">
          {assignedPeople.length > 0 ? <AvatarStack people={assignedPeople} size={22} /> : null}
          <span className="tnum text-xs text-muted">
            {goal.assignments.length} assigned · {finished} completed
          </span>
        </div>
      </div>

      {footer ? <div>{footer}</div> : null}
    </Card>
  );
}
