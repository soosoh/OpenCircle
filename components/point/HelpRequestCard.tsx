import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { GoalStatusBadge } from "@/components/ui/StatusBadge";
import { formatDateTime } from "@/lib/domain/time";
import type { HelpRequest, User } from "@/types";

/** An open SOS request as a card, with an optional moderator resolve action. */
export function HelpRequestCard({
  request,
  user,
  timeZone,
  action,
}: {
  request: HelpRequest;
  user?: User;
  timeZone: string;
  /** Resolve action. Omit when the viewer is not the moderator. */
  action?: () => void | Promise<void>;
}) {
  return (
    <Card className="flex items-start gap-3">
      {user ? <Avatar name={user.name} color={user.avatarColor} size={36} /> : null}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">{user?.name ?? "Member"}</p>
          <GoalStatusBadge status={request.status === "open" ? "Needs assistance" : "Completed"} />
        </div>
        <p className="mt-0.5 text-sm text-muted">{request.reason}</p>
        <p className="mt-1 text-xs text-muted">{formatDateTime(request.createdAt, timeZone)}</p>
        {action && request.status === "open" ? (
          <form action={action} className="mt-3">
            <button
              type="submit"
              className="rounded-full border border-line px-3 py-1 text-xs font-medium transition-colors hover:border-brand/40"
            >
              Mark resolved
            </button>
          </form>
        ) : null}
      </div>
    </Card>
  );
}
