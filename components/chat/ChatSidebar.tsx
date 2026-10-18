import { Avatar } from "@/components/ui/Avatar";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { GoalStatusBadge } from "@/components/ui/StatusBadge";
import type { GoalAssignment } from "@/types";

/**
 * Sidebar entry summarising one member's goal progress inside a point.
 */
export function ChatSidebar({
  participants,
  viewerId,
  assignments,
}: {
  participants: { id: string; name: string; avatarColor: string; educationLevel: string }[];
  viewerId?: string;
  /** Current goal progress per member, keyed by user id. */
  assignments?: Map<string, GoalAssignment[]>;
}) {
  return (
    <aside className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">In this point</h3>
      <ul className="space-y-2">
        {participants.map((person) => {
          const personGoals = assignments?.get(person.id) ?? [];
          const average = personGoals.length
            ? Math.round(personGoals.reduce((sum, g) => sum + g.progress, 0) / personGoals.length)
            : 0;
          const needsHelp = personGoals.some((g) => g.status === "Needs assistance");
          const name = person.name;

          return (
            <li key={person.id} className="rounded-xl border border-line bg-surface p-3">
              <div className="flex items-center gap-3">
                <Avatar name={name} color={person.avatarColor} size={32} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {name}
                    {person.id === viewerId ? <span className="text-muted"> (you)</span> : null}
                  </p>
                  <p className="truncate text-xs text-muted">{person.educationLevel}</p>
                </div>
                {needsHelp ? <GoalStatusBadge status="Needs assistance" /> : null}
              </div>
              {personGoals.length > 0 ? (
                <div className="mt-2">
                  <ProgressBar value={average} label={`${name} average progress`} />
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
