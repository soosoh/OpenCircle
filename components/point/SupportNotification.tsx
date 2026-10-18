import { Avatar } from "@/components/ui/Avatar";
import type { HelpRequest, User } from "@/types";

/** Banner shown to a point's members while someone is asking for support. */
export function SupportNotification({
  request,
  user,
  viewerId,
}: {
  request: HelpRequest;
  user?: User;
  viewerId?: string;
}) {
  const name = user?.name ?? "A member";
  const mine = request.userId === viewerId;

  return (
    <div
      role="status"
      className="flex items-start gap-3 rounded-xl border border-coral/30 bg-coral/8 px-4 py-3"
    >
      {user ? <Avatar name={name} color={user.avatarColor} size={30} /> : null}
      <div className="min-w-0">
        <p className="text-sm font-medium">
          {mine ? "You asked for support." : `${name} needs support in this point.`}
        </p>
        <p className="text-sm text-muted">{request.reason}</p>
      </div>
    </div>
  );
}
