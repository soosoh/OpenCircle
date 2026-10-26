import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { User } from "@/types";

/**
 * Compact person summary used in member lists and search results.
 * Deliberately limited to name, year and reputation, never age, school or
 * personal availability, which stay on the member's own profile.
 */
export function UserCard({ user, role, detail }: { user: User; role?: string; detail?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4 transition-colors hover:border-ink/30">
      <div className="flex items-center gap-3">
        <Avatar name={user.name} color={user.avatarColor} size={44} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-ink">{user.name}</p>
          <p className="truncate text-sm text-muted">{detail ?? `${user.educationLevel} · ${user.gradeLevel}`}</p>
        </div>
        {role ? <Badge tone="sun">{role}</Badge> : null}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <span className="shrink-0 text-xs text-muted">Reputation</span>
        <ProgressBar value={user.reputation} label={`${user.name} reputation`} />
        <span className="tnum shrink-0 text-sm font-bold text-ink">{user.reputation}</span>
      </div>
    </div>
  );
}
