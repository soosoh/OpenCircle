import { ActionForm } from "@/components/ui/ActionForm";
import { Avatar } from "@/components/ui/Avatar";
import { formatDateTime } from "@/lib/domain/time";
import type { HelpRequest, User } from "@/types";

/** An open support request as a card, with an optional moderator resolve action. */
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
  const open = request.status === "open";

  return (
    <div className={`flex items-start gap-3 rounded-xl border p-3 ${
        open ? "border-coral/30 bg-coral-soft text-coral-ink" : "border-line bg-mist text-ink"
      }`}>
      {user ? <Avatar name={user.name} color={user.avatarColor} size={32} /> : null}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[13px] font-semibold">{user?.name ?? "Member"}</p>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
              open ? "border border-coral/30 bg-surface text-coral-ink" : "bg-sage text-sage-ink"
            }`}
          >
            {open ? "Open" : "Resolved"}
          </span>
        </div>
        <p className="mt-1 text-sm leading-6 text-coral-ink/85">{request.reason}</p>
        <p className="mt-1 text-[11px] text-coral-ink/65">{formatDateTime(request.createdAt, timeZone)}</p>
        {action && open ? (
          <ActionForm action={action} variant="secondary" className="mt-2.5" pendingLabel="Resolving…">
            Mark resolved
          </ActionForm>
        ) : null}
      </div>
    </div>
  );
}
