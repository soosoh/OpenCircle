import Link from "next/link";
import { CalendarClock, Flag } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/domain/time";
import type { ScheduleItem } from "@/types";

/** One row in a schedule feed. */
export function ScheduleEvent({ item, timeZone }: { item: ScheduleItem; timeZone: string }) {
  const isMeeting = item.kind === "meeting";
  return (
    <Link
      href={item.href}
      className="group lift-card flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 hover:bg-sun-wash"
    >
      <span
        aria-hidden="true"
        className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
          isMeeting ? "bg-sage text-ink" : "bg-mist text-coral"
        }`}
      >
        {isMeeting ? <CalendarClock className="size-4" /> : <Flag className="size-4" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink underline decoration-transparent decoration-2 underline-offset-4 transition-colors duration-200 ease-out-quart group-hover:decoration-sun-deep">{item.title}</p>
        <p className="mt-0.5 text-xs text-muted">{formatDateTime(item.at, timeZone)}</p>
      </div>
      <Badge tone={isMeeting ? "mint" : "sun"}>{isMeeting ? "Meeting" : "Deadline"}</Badge>
    </Link>
  );
}
