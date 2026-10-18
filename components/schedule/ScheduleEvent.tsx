import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/domain/time";
import type { ScheduleItem } from "@/types";

/** One row in a schedule feed. */
export function ScheduleEvent({ item, timeZone }: { item: ScheduleItem; timeZone: string }) {
  const isMeeting = item.kind === "meeting";
  return (
    <Link
      href={item.href}
      className="flex items-center gap-4 rounded-xl border border-line bg-surface px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-sm"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{item.title}</p>
        <p className="text-sm text-muted">{formatDateTime(item.at, timeZone)}</p>
      </div>
      <Badge tone={isMeeting ? "brand" : "sun"}>{isMeeting ? "Meeting" : "Deadline"}</Badge>
    </Link>
  );
}
