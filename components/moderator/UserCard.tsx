import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import type { User } from "@/types";

/** Compact person summary used in member lists and search results. */
export function UserCard({ user, role, detail }: { user: User; role?: string; detail?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3 transition-colors hover:border-brand/30">
      <Avatar name={user.name} color={user.avatarColor} size={38} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{user.name}</p>
        <p className="truncate text-xs text-muted">
          {detail ?? `${user.educationLevel} · ${user.gradeLevel}`}
        </p>
      </div>
      {role ? <Badge tone="brand">{role}</Badge> : null}
    </div>
  );
}
