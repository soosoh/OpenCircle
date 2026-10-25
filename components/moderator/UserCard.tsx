import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { User } from "@/types";

/**
 * Compact person summary used in member lists and search results.
 * Deliberately limited to name, year and reputation — never age, school or
 * personal availability, which stay on the member's own profile.
 */
export function UserCard({ user, role, detail }: { user: User; role?: string; detail?: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-3.5 transition-colors hover:border-ink/20">
      <div className="flex items-center gap-3">
        <Avatar name={user.name} color={user.avatarColor} size={36} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
          <p className="truncate text-xs text-muted">{detail ?? `${user.educationLevel} · ${user.gradeLevel}`}</p>
        </div>
        {role ? <Badge tone="sun">{role}</Badge> : null}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <ProgressBar value={user.reputation} label={`${user.name} reputation`} />
        <span className="tnum shrink-0 text-xs font-semibold text-muted">{user.reputation}</span>
      </div>
    </div>
  );
}
