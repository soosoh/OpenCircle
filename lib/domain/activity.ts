import { dayKey, zonedWallTimeToDate } from "./time";

/**
 * Member activity, derived only from records that already carry a timestamp.
 *
 * The data model has no attendance table, so "active" is defined as "did
 * something in a point": sent a point message, raised a help request, or sent
 * a private message. Nothing here is estimated or invented; a week with none of
 * those records is a missed week.
 *
 * Every function is pure. `now` and the member's `timeZone` are always passed
 * in, and weeks run Monday 00:00 to Sunday 24:00 in that timezone.
 */

type Timestamped = { timestamp: string };

/** The three record kinds that count as activity, already loaded by the caller. */
export type ActivitySources = {
  messages: ReadonlyArray<Timestamped & { senderId: string }>;
  helpRequests: ReadonlyArray<{ userId: string; createdAt: string }>;
  privateMessages: ReadonlyArray<Timestamped & { senderId: string }>;
};

export type WeekActivity = {
  /** Monday of the week, "YYYY-MM-DD" in the member's timezone. */
  key: string;
  count: number;
  active: boolean;
};

export type DayActivity = { key: string; count: number };

export type StreakSummary = {
  /** Consecutive active weeks ending this week, or last week if this one is still empty. */
  current: number;
  /** The longest run of consecutive active weeks on record. */
  best: number;
  activeThisWeek: boolean;
};

/** Calendar-date arithmetic on "YYYY-MM-DD" keys; immune to DST because it never leaves UTC dates. */
function shiftDay(key: string, days: number): string {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

/** The Monday (as a date key) of the week containing `date`, in `timeZone`. */
export function weekKey(date: Date, timeZone: string): string {
  const key = dayKey(date, timeZone);
  const weekday = new Date(`${key}T12:00:00.000Z`).getUTCDay();
  return shiftDay(key, -((weekday + 6) % 7));
}

/** Monday 00:00 of the week containing `date`, in `timeZone`, as an absolute instant. */
export function weekStart(date: Date, timeZone: string): Date {
  const [year, month, day] = weekKey(date, timeZone).split("-").map(Number);
  return zonedWallTimeToDate(year, month, day, 0, 0, timeZone);
}

/** Every timestamp, up to `now`, at which `userId` did something in a point. */
export function memberActivityTimes(userId: string, sources: ActivitySources, now: Date): Date[] {
  const stamps = [
    ...sources.messages.filter((m) => m.senderId === userId).map((m) => m.timestamp),
    ...sources.helpRequests.filter((r) => r.userId === userId).map((r) => r.createdAt),
    ...sources.privateMessages.filter((m) => m.senderId === userId).map((m) => m.timestamp),
  ];
  return stamps
    .map((stamp) => new Date(stamp))
    .filter((date) => !Number.isNaN(date.getTime()) && date.getTime() <= now.getTime());
}

function countBy(times: Date[], keyOf: (date: Date) => string): Map<string, number> {
  const counts = new Map<string, number>();
  for (const time of times) {
    const key = keyOf(time);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

/** The last `weeks` weeks, oldest first, ending with the week that contains `now`. */
export function weeklyActivity(times: Date[], now: Date, timeZone: string, weeks = 12): WeekActivity[] {
  const counts = countBy(times, (date) => weekKey(date, timeZone));
  const thisWeek = weekKey(now, timeZone);
  return Array.from({ length: weeks }, (_, index) => {
    const key = shiftDay(thisWeek, -7 * (weeks - 1 - index));
    const count = counts.get(key) ?? 0;
    return { key, count, active: count > 0 };
  });
}

/**
 * Consecutive active weeks. The current week may still be empty without
 * breaking a streak that ended last week; it simply is not counted yet.
 */
export function streakWeeks(times: Date[], now: Date, timeZone: string): StreakSummary {
  const active = new Set(times.map((date) => weekKey(date, timeZone)));
  const thisWeek = weekKey(now, timeZone);
  const activeThisWeek = active.has(thisWeek);

  let current = 0;
  for (let key = activeThisWeek ? thisWeek : shiftDay(thisWeek, -7); active.has(key); key = shiftDay(key, -7)) {
    current += 1;
  }

  let best = 0;
  let run = 0;
  let previous: string | null = null;
  for (const key of [...active].sort()) {
    run = previous !== null && shiftDay(previous, 7) === key ? run + 1 : 1;
    best = Math.max(best, run);
    previous = key;
  }

  return { current, best, activeThisWeek };
}

/** One entry per day for the last `days` days, oldest first, ending with today. */
export function dailyActivity(times: Date[], now: Date, timeZone: string, days = 28): DayActivity[] {
  const counts = countBy(times, (date) => dayKey(date, timeZone));
  const today = dayKey(now, timeZone);
  return Array.from({ length: days }, (_, index) => {
    const key = shiftDay(today, -(days - 1 - index));
    return { key, count: counts.get(key) ?? 0 };
  });
}
