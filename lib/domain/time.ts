/** Timezone-aware helpers built on Intl (no extra dependencies). */

const DAY_MS = 86_400_000;

export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

export function zonedParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
  };
}

function offsetMs(date: Date, timeZone: string): number {
  const p = zonedParts(date, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

/** Converts a wall-clock time in `timeZone` to an absolute Date. */
export function zonedWallTimeToDate(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
): Date {
  const naive = Date.UTC(year, month - 1, day, hour, minute);
  const first = naive - offsetMs(new Date(naive), timeZone);
  return new Date(naive - offsetMs(new Date(first), timeZone));
}

/** Local calendar key "YYYY-MM-DD" for grouping items by day in a timezone. */
export function dayKey(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

export function formatDateTime(iso: string | Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(typeof iso === "string" ? new Date(iso) : iso);
}

export function formatTime(time: string, timeZone: string): string {
  const [hour, minute] = time.split(":").map(Number);
  const date = zonedWallTimeToDate(2026, 1, 1, hour, minute, timeZone);
  return new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", minute: "2-digit" }).format(date);
}

export const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Next occurrence strictly after `from` of a weekly wall-clock slot in its timezone. */
export function nextWeeklyOccurrence(
  schedule: { weekday: number; time: string; timezone: string },
  from: Date = new Date(),
): Date {
  const now = zonedParts(from, schedule.timezone);
  const [hour, minute] = schedule.time.split(":").map(Number);
  const anchor = Date.UTC(now.year, now.month - 1, now.day);
  for (let offset = 0; offset <= 7; offset++) {
    const day = new Date(anchor + offset * DAY_MS);
    if (day.getUTCDay() !== schedule.weekday) continue;
    const candidate = zonedWallTimeToDate(
      day.getUTCFullYear(),
      day.getUTCMonth() + 1,
      day.getUTCDate(),
      hour,
      minute,
      schedule.timezone,
    );
    if (candidate.getTime() > from.getTime()) return candidate;
  }
  throw new Error(`Could not resolve next occurrence for ${JSON.stringify(schedule)}`);
}
