import { Avatar } from "@/components/ui/Avatar";
import { ProgressTrack } from "@/components/point/ProgressTrack";
import type { GoalAssignment } from "@/types";

/**
 * Sidebar member summary inside a point. The viewer's own row is the active
 * one: sun-soft fill with an ink left rule.
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
    <aside className="rounded-2xl border border-line bg-surface">
      <div className="flex items-baseline justify-between gap-2 border-b border-line px-4 py-3">
        <h2 className="font-display text-base font-bold tracking-tight text-ink">In this point</h2>
        <span className="tnum text-xs text-muted">{participants.length}</span>
      </div>
      {participants.length === 0 ? (
        <p className="px-4 py-4 text-sm text-muted">No members yet.</p>
      ) : (
        <ul className="divide-y divide-line">
          {participants.map((person) => {
            const personGoals = assignments?.get(person.id) ?? [];
            const average = personGoals.length
              ? Math.round(personGoals.reduce((sum, g) => sum + g.progress, 0) / personGoals.length)
              : 0;
            const needsHelp = personGoals.some((g) => g.status === "Needs assistance");
            const isViewer = person.id === viewerId;

            return (
              <li
                key={person.id}
                className={`border-l-2 px-3 py-3 ${isViewer ? "border-ink bg-sun-soft" : "border-transparent"}`}
              >
                <div className="flex items-center gap-3">
                  <Avatar name={person.name} color={person.avatarColor} size={32} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-ink">
                      {person.name}
                      {isViewer ? <span className="font-normal text-muted"> (you)</span> : null}
                    </p>
                    <p className="truncate text-xs text-muted">{person.educationLevel}</p>
                  </div>
                  {personGoals.length > 0 ? (
                    <span className="tnum shrink-0 text-xs text-muted">{average}%</span>
                  ) : null}
                </div>
                {personGoals.length > 0 ? (
                  <div className="mt-2 pl-11">
                    <ProgressTrack value={average} label={`${person.name} average progress`} />
                  </div>
                ) : (
                  <p className="mt-1 pl-11 text-xs text-muted">No goals yet</p>
                )}
                {needsHelp ? <p className="mt-1.5 pl-11 text-[11px] text-coral">Needs a hand this week</p> : null}
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
