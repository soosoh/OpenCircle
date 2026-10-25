import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { ProgressTrack } from "@/components/point/ProgressTrack";
import type { Goal, User } from "@/types";

/** One member with their average goal progress, shown in the chord member panel. */
export function MemberPanelMember({ user, goals }: { user: User; goals: Goal[] }) {
  const assignments = goals.flatMap((goal) =>
    goal.assignments.filter((a) => a.userId === user.id).map((a) => ({ goal, ...a })),
  );
  const average = assignments.length
    ? Math.round(assignments.reduce((sum, a) => sum + a.progress, 0) / assignments.length)
    : 0;
  const needsHelp = assignments.some((a) => a.status === "Needs assistance");

  return (
    <li className="flex gap-3 py-3">
      <Avatar name={user.name} color={user.avatarColor} size={32} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-[13px] font-semibold text-ink">{user.name}</p>
          {assignments.length > 0 ? <span className="tnum text-xs text-muted">{average}%</span> : null}
        </div>
        <p className="truncate text-xs text-muted">
          {user.gradeLevel} · {user.experienceLevel}
        </p>
        {assignments.length > 0 ? (
          <div className="mt-2">
            <ProgressTrack value={average} label={`${user.name} average progress`} />
          </div>
        ) : (
          <p className="mt-1 text-xs text-muted">No goals yet</p>
        )}
        {needsHelp ? <p className="mt-1.5 text-[11px] text-coral">Needs a hand this week</p> : null}
      </div>
    </li>
  );
}

/** Member panel for a chord: every member with their current goal progress. */
export function MemberPanel({ users, goals }: { users: User[]; goals: Goal[] }) {
  return (
    <Card>
      <div className="flex items-baseline justify-between gap-2 border-b border-line pb-3">
        <h2 className="font-display text-base font-bold tracking-tight text-ink">Members</h2>
        <span className="tnum text-xs text-muted">{users.length}</span>
      </div>
      {users.length === 0 ? (
        <div className="py-4">
          <p className="text-sm leading-6 text-muted">No members yet. Join this chord to be the first.</p>
          <a
            href="#points"
            className="mt-2 inline-flex min-h-10 items-center text-sm font-semibold text-ink hover:underline"
          >
            Browse the points
          </a>
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {users.map((user) => (
            <MemberPanelMember key={user.id} user={user} goals={goals} />
          ))}
        </ul>
      )}
    </Card>
  );
}
