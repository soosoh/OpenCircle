import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/domain/time";

/** Compact deadline row, e.g. on a personal schedule. */
export function DeadlineCard({
  title,
  at,
  timeZone,
  href,
}: {
  title: string;
  at: string;
  timeZone: string;
  href?: string;
}) {
  // Server Component: re-rendered on every request, so reading the clock here is intentional.
  // eslint-disable-next-line react-hooks/purity
  const overdue = new Date(at).getTime() < Date.now();
  const body = (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 transition-all duration-200 hover:border-sun/50">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{title}</p>
        <p className={`text-xs ${overdue ? "text-coral" : "text-muted"}`}>Due {formatDateTime(at, timeZone)}</p>
      </div>
      <Badge tone={overdue ? "coral" : "sun"}>{overdue ? "Overdue" : "Due"}</Badge>
    </div>
  );

  return href ? <Link href={href}>{body}</Link> : body;
}
