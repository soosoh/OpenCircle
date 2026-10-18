import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { GoalStatusBadge } from "@/components/ui/StatusBadge";
import type { Goal, User } from "@/types";

/** One member with their current goals and progress, shown in the chord member panel. */
export function MemberPanelMember({
  user,
  goals,
  timeZone,
}: {
  user: User;
  goals: Goal[];
  timeZone: string;
}) {
  const assignments = goals.flatMap((goal) =>
    goal.assignments.filter((a) => a.userId === user.id).map((a) => ({ goal, ...a })),
  );
  const average = assignments.length
    ? Math.round(assignments.reduce((sum, a) => sum + a.progress, 0) / assignments.length)
    : 0;
  const needsHelp = assignments.some((a) => a.status === "Needs assistance");

  return (
    <li className="flex gap-3 rounded-xl border border-line bg-surface p-3">
      <Avatar name={user.name} color={user.avatarColor} size={36} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-medium">{user.name}</p>
          {needsHelp ? <GoalStatusBadge status="Needs assistance" /> : null}
        </div>
        <p className="text-xs text-muted">
          {user.experienceLevel} · {user.gradeLevel}
        </p>

        {assignments.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No active goals.</p>
        ) : (
          <ul className="mt-2 space-y-1">
            {assignments.map(({ goal, progress }) => (
              <li key={goal.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate">{goal.title}</span>
                <span className="shrink-0 font-medium text-muted">{progress}%</span>
              </li>
            ))}
            <li className="pt-1">
              <div className="flex items-center justify-between gap-2 text-xs text-muted">
                <span>{assignments.length} {assignments.length === 1 ? "goal" : "goals"}</span>
                <span>Avg {average}%</span>
              </div>
            </li>
          </ul>
        )}
        <p className="mt-2 text-[11px] text-muted">Times shown in {timeZone.split("/").pop()?.replace("_", " ")}</p>
      </div>
    </li>
  );
}

/** Member panel for a chord: every member with their current goal progress. */
export function MemberPanel({ users, goals, timeZone }: { users: User[]; goals: Goal[]; timeZone: string }) {
  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold tracking-tight">Members</h3>
        <Badge tone="muted">{users.length}</Badge>
      </div>
      {users.length === 0 ? (
        <p className="py-4 text-sm text-muted">No members yet.</p>
      ) : (
        <ul className="max-h-96 space-y-2 overflow-y-auto pr-1">
          {users.map((user) => (
            <MemberPanelMember key={user.id} user={user} goals={goals} timeZone={timeZone} />
          ))}
        </ul>
      )}
    </Card>
  );
}
