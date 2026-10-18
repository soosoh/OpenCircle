import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { GoalStatusBadge } from "@/components/ui/StatusBadge";
import { goalProgress } from "@/lib/domain/progress";
import { formatDateTime } from "@/lib/domain/time";
import type { Goal, User } from "@/types";

/** Goal card with overall progress and per-member progress. */
export function GoalCard({
  goal,
  members,
  timeZone,
  showMembers = true,
}: {
  goal: Goal;
  members: User[];
  timeZone: string;
  showMembers?: boolean;
}) {
  const progress = goalProgress(goal);
  // Server Component: re-rendered on every request, so reading the clock here is intentional.
  // eslint-disable-next-line react-hooks/purity
  const overdue = new Date(goal.deadline).getTime() < Date.now() && goal.status !== "Completed";

  return (
    <Card className="space-y-4">
      <div>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="font-semibold tracking-tight">{goal.title}</h3>
          <GoalStatusBadge status={goal.status} />
        </div>
        {goal.description ? <p className="mt-1 text-sm text-muted">{goal.description}</p> : null}
        <p className={`mt-2 text-xs font-medium ${overdue ? "text-coral" : "text-muted"}`}>
          Due {formatDateTime(goal.deadline, timeZone)}
          {overdue ? " · overdue" : ""}
        </p>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-sm">
          <span className="text-muted">Overall progress</span>
          <span className="font-semibold">{progress}%</span>
        </div>
        <ProgressBar value={progress} label={`${goal.title} progress`} />
      </div>

      {goal.resources.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {goal.resources.map((resource) => (
            <Badge key={resource} tone="muted">
              {resource}
            </Badge>
          ))}
        </div>
      ) : null}

      {showMembers && members.length > 0 ? (
        <ul className="space-y-2 border-t border-line pt-3">
          {members.map((member) => {
            const assignment = goal.assignments.find((a) => a.userId === member.id);
            return (
              <li key={member.id} className="flex items-center gap-3">
                <span className="min-w-0 flex-1 truncate text-sm">{member.name}</span>
                <div className="w-24">
                  <ProgressBar value={assignment?.progress ?? 0} label={`${member.name} progress`} />
                </div>
                <span className="w-9 text-right text-xs font-medium text-muted">{assignment?.progress ?? 0}%</span>
              </li>
            );
          })}
        </ul>
      ) : null}
    </Card>
  );
}
