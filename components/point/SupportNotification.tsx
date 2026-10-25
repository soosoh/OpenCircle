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
      className="flex items-start gap-3 rounded-2xl border border-coral/30 bg-[#FBE3DC] px-4 py-3 text-[#8E3520]"
    >
      {user ? <Avatar name={name} color={user.avatarColor} size={30} /> : null}
      <div className="min-w-0">
        <p className="text-sm font-medium">{mine ? "You asked for support." : `${name} needs a hand.`}</p>
        <p className="mt-0.5 text-sm leading-6 text-[#8E3520]/85">{request.reason}</p>
        <p className="mt-1 text-xs text-[#8E3520]/70">
          {mine ? "Your moderator can mark this resolved." : "Reply in the point chat or check in with them."}
        </p>
      </div>
    </div>
  );
}
