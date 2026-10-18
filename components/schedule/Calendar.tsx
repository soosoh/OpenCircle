import { Card } from "@/components/ui/Card";
import { dayKey, formatDateTime } from "@/lib/domain/time";
import type { ScheduleItem } from "@/types";
import Link from "next/link";

const DAY_MS = 86_400_000;

/** One calendar day with its meetings and deadlines. */
function DayColumn({ day, items, timeZone, isToday }: { day: Date; items: ScheduleItem[]; timeZone: string; isToday: boolean }) {
  const weekday = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short" }).format(day);
  const date = new Intl.DateTimeFormat("en-US", { timeZone, month: "short", day: "numeric" }).format(day);

  return (
    <div
      className={`flex min-h-32 flex-col rounded-xl border p-3 transition-colors ${
        isToday ? "border-brand/40 bg-brand/5" : "border-line bg-surface"
      }`}
    >
      <div className="mb-2">
        <p className={`text-xs font-semibold uppercase tracking-wide ${isToday ? "text-brand" : "text-muted"}`}>{weekday}</p>
        <p className="text-sm text-muted">{date}</p>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-muted/70">—</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className={`block truncate rounded-lg px-2 py-1 text-xs font-medium transition-colors hover:opacity-80 ${
                  item.kind === "meeting" ? "bg-brand/12 text-brand" : "bg-sun/18 text-[#8a5105]"
                }`}
                title={item.title}
              >
                {formatDateTime(item.at, timeZone).split(",").slice(-1)[0]} · {item.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Calendar schedule showing point meetings and goal deadlines.
 * Items are grouped by the viewer's timezone.
 */
export function Calendar({ items, timeZone, days = 14 }: { items: ScheduleItem[]; timeZone: string; days?: number }) {
  const now = new Date();

  // Anchor "today" by the viewer's calendar day, then step whole days from the UTC anchor.
  const todayKey = dayKey(now, timeZone);
  const anchor = new Date(`${todayKey}T00:00:00.000Z`);

  const columns = Array.from({ length: days }, (_, index) => {
    const day = new Date(anchor.getTime() + index * DAY_MS);
    const key = dayKey(day, timeZone);
    return {
      day,
      key,
      isToday: key === todayKey,
      items: items.filter((item) => dayKey(new Date(item.at), timeZone) === key),
    };
  });

  return (
    <Card>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {columns.map((column) => (
          <DayColumn key={column.key} day={column.day} items={column.items} timeZone={timeZone} isToday={column.isToday} />
        ))}
      </div>
    </Card>
  );
}
