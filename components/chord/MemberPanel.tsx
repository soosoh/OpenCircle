import { Avatar } from "@/components/ui/Avatar";
import type { User } from "@/types";

/** One chord member: name, grade and experience. Goal progress stays inside a point. */
export function MemberPanelMember({ user }: { user: User }) {
  return (
    <li className="flex items-center gap-3 py-3">
      <Avatar name={user.name} color={user.avatarColor} size={36} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
        <p className="truncate text-xs text-muted">
          {user.gradeLevel} · {user.experienceLevel}
        </p>
      </div>
    </li>
  );
}

/**
 * Member panel for a chord. Members of the chord see who is in it; everyone else sees
 * only the count, so pass `users` only after checking membership on the server.
 */
export function MemberPanel({ count, users }: { count: number; users?: User[] }) {
  return (
    <section aria-labelledby="chord-members-heading" className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 id="chord-members-heading" className="font-display text-lg font-bold tracking-tight text-ink">
          Members
        </h2>
        <span className="tnum rounded-full bg-sage px-2.5 py-0.5 text-xs font-bold text-mint">{count}</span>
      </div>
      {users === undefined ? (
        <p className="mt-3 text-sm leading-6 text-ink">
          {count === 0
            ? "No members yet. Join this chord to be the first."
            : "Join this chord to see who is in it."}
        </p>
      ) : users.length === 0 ? (
        <div className="mt-3 border-t border-line py-4">
          <p className="text-sm leading-6 text-ink">No members yet. Join this chord to be the first.</p>
          <a
            href="#points"
            className="mt-2 inline-flex min-h-10 items-center text-sm font-semibold text-ink underline decoration-sun-deep decoration-2 underline-offset-4 hover:decoration-ink"
          >
            Browse the points
          </a>
        </div>
      ) : (
        <ul className="mt-3 divide-y divide-line border-t border-line">
          {users.map((user) => (
            <MemberPanelMember key={user.id} user={user} />
          ))}
        </ul>
      )}
    </section>
  );
}
