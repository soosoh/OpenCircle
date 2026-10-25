import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

function dueDate(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(iso));
}

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
    <div className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 transition-colors hover:border-ink/20 hover:bg-sun-wash">
      <span
        aria-hidden="true"
        className={`size-2.5 shrink-0 rounded-full ${overdue ? "bg-coral" : "bg-sun"}`}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{title}</p>
        <p className={`mt-0.5 text-xs ${overdue ? "text-coral" : "text-muted"}`}>
          {dueDate(at, timeZone)}
        </p>
      </div>
      <Badge tone={overdue ? "coral" : "sun"}>{overdue ? "Overdue" : "Due"}</Badge>
    </div>
  );

  return href ? (
    <Link href={href} className="block">
      {body}
    </Link>
  ) : (
    body
  );
}
