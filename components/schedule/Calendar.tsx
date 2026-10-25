import Link from "next/link";
import { CHORD_CATALOG } from "@/config/chords";
import { dayKey, zonedParts, zonedWallTimeToDate } from "@/lib/domain/time";
import type { ScheduleItem } from "@/types";

const DAY_MS = 86_400_000;

const chordColorById = new Map(CHORD_CATALOG.map((chord) => [chord.id, chord.color]));

function clockTime(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function monthDay(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    month: "short",
    day: "numeric",
  }).format(date);
}

/** One calendar day with its meetings and deadlines. */
function DayColumn({
  day,
  items,
  timeZone,
  isToday,
  isWeekend,
}: {
  day: Date;
  items: ScheduleItem[];
  timeZone: string;
  isToday: boolean;
  isWeekend: boolean;
}) {
  return (
    <div
      aria-current={isToday ? "date" : undefined}
      className={`flex min-h-32 flex-col gap-2 border-r border-b p-2.5 transition-colors sm:p-3 ${
        isToday
          ? "border-ink/25 bg-sun-soft"
          : `border-line ${isWeekend ? "bg-paper" : "bg-surface"}`
      }`}
    >
      {/* The weekday lives in the column header; two full weeks share one alignment. */}
      <div className="flex items-baseline justify-between gap-1">
        <p className="tnum text-xs font-semibold text-ink">{monthDay(day, timeZone)}</p>
        {isToday ? (
          <span className="rounded-full bg-sun px-1.5 py-0.5 text-[10px] font-semibold leading-none text-ink">
            Today
          </span>
        ) : null}
      </div>
      {items.length === 0 ? null : (
        <ul className="space-y-1">
          {items.map((item) => {
            const color = (item.chordId ? chordColorById.get(item.chordId) : undefined) ?? "#F4D35E";
            const isMeeting = item.kind === "meeting";
            const stamp = isMeeting
              ? clockTime(new Date(item.at), timeZone)
              : `Due ${monthDay(new Date(item.at), timeZone)}`;
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  title={`${item.title} · ${stamp}`}
                  className="flex items-start gap-1.5 rounded-md px-1.5 py-1 text-[11px] leading-4 text-ink transition-colors hover:brightness-95"
                  style={{ backgroundColor: `${color}1F` }}
                >
                  <span
                    aria-hidden="true"
                    className={`mt-1 size-1.5 shrink-0 rounded-full ${isMeeting ? "" : "bg-coral"}`}
                    style={isMeeting ? { backgroundColor: color } : undefined}
                  />
                  <span className="min-w-0">
                    <span className={`font-semibold ${isMeeting ? "tnum" : ""}`}>
                      {isMeeting ? stamp : "Due"}
                    </span>
                    <span className="block truncate">{item.title}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/**
 * Calendar schedule showing point meetings and goal deadlines.
 * Items are grouped by the viewer's timezone. The planner keeps a seven-column
 * sheet shape and scrolls inside its own frame on narrow screens.
 */
export function Calendar({ items, timeZone, days = 14 }: { items: ScheduleItem[]; timeZone: string; days?: number }) {
  // Server Component: the planner is anchored on the request's "today".
  const now = new Date();

  // Anchor at local noon so 00:00 UTC can never slip a negative-offset timezone
  // into the previous day, then step whole days from there.
  const p = zonedParts(now, timeZone);
  const anchor = zonedWallTimeToDate(p.year, p.month, p.day, 12, 0, timeZone);
  const todayKey = dayKey(anchor, timeZone);

  const columns = Array.from({ length: days }, (_, index) => {
    const day = new Date(anchor.getTime() + index * DAY_MS);
    const key = dayKey(day, timeZone);
    const weekday = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short" }).format(day);
    return {
      day,
      key,
      isToday: key === todayKey,
      isWeekend: weekday === "Sat" || weekday === "Sun",
      items: items
        .filter((item) => dayKey(new Date(item.at), timeZone) === key)
        .sort((a, b) => a.at.localeCompare(b.at)),
    };
  });

  const first = columns[0];
  const last = columns[columns.length - 1];
  const range =
    first && last ? `${monthDay(first.day, timeZone)} – ${monthDay(last.day, timeZone)}` : "";

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
        <p className="text-xs font-semibold text-ink">Week planner</p>
        <p className="tnum text-xs text-muted">{range}</p>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[720px]">
          <div className="grid grid-cols-7 border-b border-line bg-surface">
            {columns.slice(0, 7).map((column) => (
              <p
                key={column.key}
                className="border-r border-line px-3 py-1.5 text-[11px] text-muted last:border-r-0"
              >
                {new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short" }).format(column.day)}
              </p>
            ))}
          </div>
          {/* The negative margins pull the final hairlines under the frame, so
              the planner reads as one printed sheet rather than a grid of cards. */}
          <div className="-mr-px -mb-px grid grid-cols-7">
            {columns.map((column) => (
              <DayColumn
                key={column.key}
                day={column.day}
                items={column.items}
                timeZone={timeZone}
                isToday={column.isToday}
                isWeekend={column.isWeekend}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
