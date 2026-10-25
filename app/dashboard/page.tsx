import Link from "next/link";
import { connection } from "next/server";
import { ArrowRight, Clock } from "lucide-react";
import { MotivationCard } from "@/components/assistant/MotivationCard";
import { PointCard } from "@/components/point/PointCard";
import { Calendar } from "@/components/schedule/Calendar";
import { DeadlineCard } from "@/components/schedule/DeadlineCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState, SectionHeading } from "@/components/ui/Card";
import { GoalStatusBadge } from "@/components/ui/StatusBadge";
import { getMotivation } from "@/lib/api/actions";
import { requireUser } from "@/lib/api/session";
import { listChords, listGoals, listHelpRequests, listPoints, listUsers } from "@/lib/database/repository";
import { goalProgress } from "@/lib/domain/progress";
import { buildScheduleItems } from "@/lib/domain/schedule";
import { dayKey, nextWeeklyOccurrence, zonedParts, zonedWallTimeToDate } from "@/lib/domain/time";
import type { GoalStatus, ScheduleItem } from "@/types";

export const metadata = { title: "Dashboard · StudyCircle" };

// This page reads the session and the store on every request; it is allowed to
// block the navigation instead of pretending to be instant.
export const instant = false;


const DAY_MS = 86_400_000;

const shortDate = (date: Date, timeZone: string) =>
  new Intl.DateTimeFormat("en-US", { timeZone, month: "short", day: "numeric" }).format(date);

const weekdayOf = (date: Date, timeZone: string, style: "long" | "short" | "narrow" = "long") =>
  new Intl.DateTimeFormat("en-US", { timeZone, weekday: style }).format(date);

const timeOf = (date: Date, timeZone: string) =>
  new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", minute: "2-digit" }).format(date);

/**
 * Monday–Sunday. On Sunday the week is over, so the dashboard rolls forward to
 * the week that starts tomorrow — the one a student can still plan.
 */
function planningWeekStart(now: Date, timeZone: string): Date {
  const p = zonedParts(now, timeZone);
  const todayNoon = zonedWallTimeToDate(p.year, p.month, p.day, 12, 0, timeZone);
  const weekday = new Date(`${dayKey(todayNoon, timeZone)}T12:00:00.000Z`).getUTCDay();
  const offset = weekday === 0 ? 1 : 1 - weekday;
  return new Date(todayNoon.getTime() + offset * DAY_MS);
}

const STATUS_RANK: Record<GoalStatus, number> = {
  "Needs assistance": 2,
  "On track": 1,
  Completed: 0,
};

/** "Python Study Group" → "Python Study" for a chart label. */
function shortPointName(title: string): string {
  return title.split(/\s+/).slice(0, 2).join(" ");
}

export default async function DashboardPage() {
  // Meeting times are computed against "now", so the render is explicitly dynamic.
  await connection();
  const viewer = await requireUser();

  const [chords, points, goals, users, helpRequests] = await Promise.all([
    listChords(),
    listPoints(),
    listGoals(),
    listUsers(),
    listHelpRequests(),
  ]);

  // Server Component: schedules are resolved against the request time by design.
  const now = new Date();

  const userById = new Map(users.map((user) => [user.id, user]));
  const chordById = new Map(chords.map((chord) => [chord.id, chord]));
  const pointById = new Map(points.map((point) => [point.id, point]));

  const myChords = chords.filter((chord) => chord.memberIds.includes(viewer.id));
  const myPoints = points.filter(
    (point) => point.memberIds.includes(viewer.id) || point.moderatorId === viewer.id,
  );
  // A paused point has no meetings to show. Goals still count, deadlines still land.
  const activeMyPoints = myPoints.filter((point) => point.status !== "Paused");

  const myGoals = goals.filter((goal) => goal.assignments.some((a) => a.userId === viewer.id));
  const myOpenGoals = myGoals
    .filter((goal) => {
      const assignment = goal.assignments.find((a) => a.userId === viewer.id);
      return assignment !== undefined && assignment.status !== "Completed";
    })
    .sort((a, b) => a.deadline.localeCompare(b.deadline));

  const myHelpRequests = helpRequests.filter(
    (request) =>
      (request.userId === viewer.id || myPoints.some((p) => p.id === request.pointId)) &&
      request.status === "open",
  );

  const scheduleItems = buildScheduleItems(activeMyPoints, myOpenGoals, now);
  // buildScheduleItems steps a fixed seven days, which drifts an hour across a
  // DST change. Resolve each weekly slot through nextWeeklyOccurrence instead.
  const meetingItems: ScheduleItem[] = activeMyPoints.flatMap((point) => {
    const first = nextWeeklyOccurrence(point.schedule, now);
    const second = nextWeeklyOccurrence(point.schedule, new Date(first.getTime() + 60_000));
    return [first, second].map((at, index) => ({
      id: `${point.id}-meeting-${index}`,
      kind: "meeting" as const,
      title: point.title,
      at: at.toISOString(),
      chordId: point.chordId,
      pointId: point.id,
      href: `/points/${point.id}`,
    }));
  });
  const allScheduleItems = [
    ...scheduleItems.filter((item) => item.kind !== "meeting"),
    ...meetingItems,
  ].sort((a, b) => a.at.localeCompare(b.at));

  const meetingRecords = allScheduleItems
    .filter((item) => item.kind === "meeting")
    .flatMap((item) => {
      const point = pointById.get(item.pointId);
      return point ? [{ item, at: new Date(item.at), point }] : [];
    });

  // ---- This week (Monday–Sunday, in the viewer's timezone) ----
  const weekStart = planningWeekStart(now, viewer.timezone);
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(weekStart.getTime() + index * DAY_MS);
    return {
      key: dayKey(day, viewer.timezone),
      initial: weekdayOf(day, viewer.timezone, "short").slice(0, 1),
    };
  });
  const startKey = weekDays[0].key;
  const endKey = weekDays[6].key;
  const weekRange = `${shortDate(weekStart, viewer.timezone)} – ${shortDate(
    new Date(weekStart.getTime() + 6 * DAY_MS),
    viewer.timezone,
  )}`;

  const thisWeekMeetings = meetingRecords.filter((entry) => {
    const key = dayKey(entry.at, viewer.timezone);
    return key >= startKey && key <= endKey;
  });
  const upcomingThisWeek = thisWeekMeetings.filter((entry) => entry.at.getTime() >= now.getTime());
  const barCounts = weekDays.map(
    (day) => thisWeekMeetings.filter((entry) => dayKey(entry.at, viewer.timezone) === day.key).length,
  );

  const nextMeeting = meetingRecords[0];
  const todayKey = dayKey(now, viewer.timezone);
  const comingUp = allScheduleItems
    .filter((item) => new Date(item.at).getTime() >= now.getTime())
    .slice(0, 3)
    .map((item) => ({
      item,
      at: new Date(item.at),
      point: item.pointId ? pointById.get(item.pointId) : undefined,
    }));
  const nextMeetingCaption = nextMeeting
    ? `Your next one is ${weekdayOf(nextMeeting.at, viewer.timezone)} at ${timeOf(
        nextMeeting.at,
        viewer.timezone,
      )}.`
    : "No meetings on the calendar yet.";

  // ---- Goals assigned to the viewer, and the point-level chart ----
  const openAssignments = myOpenGoals.flatMap((goal) => {
    const assignment = goal.assignments.find((a) => a.userId === viewer.id);
    const point = pointById.get(goal.pointId);
    return assignment && point ? [{ goal, assignment, point }] : [];
  });

  const goalPointIds = new Set(openAssignments.map((entry) => entry.point.id));
  const goalModeratorIds = new Set(
    [...goalPointIds]
      .map((id) => pointById.get(id)?.moderatorId)
      .filter((id): id is string => id !== undefined),
  );
  const moderatorFirstNames = [...goalModeratorIds]
    .map((id) => userById.get(id)?.name.split(" ")[0])
    .filter((name): name is string => name !== undefined);

  const viewerAverage =
    openAssignments.length > 0
      ? Math.round(
          openAssignments.reduce((total, entry) => total + entry.assignment.progress, 0) /
            openAssignments.length,
        )
      : 0;
  const goalsMeta =
    openAssignments.length === 0
      ? null
      : moderatorFirstNames.length === 1
        ? `recorded by ${moderatorFirstNames[0]}`
        : `avg ${viewerAverage}%`;

  const footerEntry =
    [...openAssignments].sort(
      (a, b) =>
        STATUS_RANK[b.goal.status] - STATUS_RANK[a.goal.status] ||
        a.goal.deadline.localeCompare(b.goal.deadline),
    )[0] ?? null;

  const singleGoalPoint =
    goalPointIds.size === 1 ? pointById.get([...goalPointIds][0]) : undefined;
  const goalsFooter = singleGoalPoint
    ? `${singleGoalPoint.memberIds.length} ${
        singleGoalPoint.memberIds.length === 1 ? "member" : "members"
      } in ${singleGoalPoint.title}`
    : `${openAssignments.length} goals across ${goalPointIds.size} points`;

  const pointProgress = myPoints
    .flatMap((point) => {
      const pointGoals = goals.filter((goal) => goal.pointId === point.id);
      if (pointGoals.length === 0) return [];
      const average = Math.round(
        pointGoals.reduce((total, goal) => total + goalProgress(goal), 0) / pointGoals.length,
      );
      return [{ point, average, goalCount: pointGoals.length }];
    })
    .sort((a, b) => b.average - a.average)
    .slice(0, 6);

  const weekDeadlines = allScheduleItems.filter((item) => {
    if (item.kind !== "deadline") return false;
    const key = dayKey(new Date(item.at), viewer.timezone);
    return key >= startKey && key <= endKey;
  });

  const upcomingPoints = [...myPoints]
    .map((point) => ({ point, next: meetingRecords.find((entry) => entry.point.id === point.id)?.at }))
    .sort((a, b) => (a.next?.getTime() ?? Infinity) - (b.next?.getTime() ?? Infinity));

  return (
    <div className="space-y-6">
      {/* Page header — plain text on paper, the way the reference opens. */}
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink">Your week</h1>
          <p className="mt-1 text-sm text-muted">
            Welcome back, {viewer.name.split(" ")[0]} — {viewer.educationLevel} · {viewer.gradeLevel}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {myHelpRequests.length > 0 ? (
            <Badge tone="coral">
              {myHelpRequests.length} open support {myHelpRequests.length === 1 ? "request" : "requests"}
            </Badge>
          ) : null}
          <Badge tone="muted">
            {myGoals.length} {myGoals.length === 1 ? "goal" : "goals"}
          </Badge>
          <span className="tnum text-sm text-muted">{weekRange}</span>
        </div>
      </header>

      {/* Two quiet columns beside the week's meeting summary. */}
      <div className="grid gap-4 lg:grid-cols-3">
        <section className="flex h-full flex-col rounded-2xl border border-line bg-surface p-5 lg:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-display text-lg font-bold tracking-tight text-ink">This week&apos;s goals</h2>
            {goalsMeta ? <p className="pt-1 text-xs text-muted">{goalsMeta}</p> : null}
          </div>

          {openAssignments.length === 0 ? (
            <div className="flex flex-1 flex-col items-start justify-center gap-1.5 py-8">
              <p className="text-sm text-muted">No goals are assigned to you this week.</p>
              <Link
                href="/chords"
                className="text-sm font-semibold text-ink underline decoration-line underline-offset-4 transition-colors hover:decoration-ink"
              >
                Find a chord to join
              </Link>
            </div>
          ) : (
            <>
              <ul className="mt-3 divide-y divide-line">
                {openAssignments.map(({ goal, assignment }) => (
                  <li key={goal.id}>
                    <Link
                      href={`/points/${goal.pointId}`}
                      aria-label={`${goal.title}, ${assignment.progress}% complete`}
                      className="group block py-3"
                    >
                      <div className="flex items-baseline justify-between gap-4">
                        <span className="min-w-0 truncate text-sm font-medium text-ink group-hover:underline">
                          {goal.title}
                        </span>
                        <span className="tnum text-sm font-bold text-ink">{assignment.progress}%</span>
                      </div>
                      <div
                        aria-hidden="true"
                        className="mt-2 h-1.5 overflow-hidden rounded-full bg-mist"
                      >
                        <div
                          className="h-full rounded-full bg-ink"
                          style={{ width: `${Math.min(100, Math.max(0, assignment.progress))}%` }}
                        />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                <p className="text-xs text-muted">{goalsFooter}</p>
                {footerEntry ? (
                  <Link
                    href={`/points/${footerEntry.point.id}`}
                    aria-label={`Open ${footerEntry.point.title}`}
                    className="shrink-0"
                  >
                    <GoalStatusBadge status={footerEntry.goal.status} />
                  </Link>
                ) : null}
              </div>
            </>
          )}
        </section>

        <section className="flex h-full flex-col rounded-2xl border border-line bg-surface p-5">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-display text-lg font-bold tracking-tight text-ink">Meetings this week</h2>
          </div>

          <div className="mt-3 flex items-end gap-2.5">
            <p className="tnum font-display text-4xl font-bold leading-none text-ink">
              {upcomingThisWeek.length}
            </p>
            <p className="pb-0.5 text-sm text-muted">
              {upcomingThisWeek.length === 1 ? "meeting still ahead" : "meetings still ahead"}
            </p>
          </div>

          <div className="mt-5 grid grid-cols-7 gap-1.5">
            {weekDays.map((day, index) => {
              const count = barCounts[index];
              const isToday = day.key === todayKey;
              const isNext = nextMeeting
                ? day.key === dayKey(nextMeeting.at, viewer.timezone)
                : false;
              return (
                <div
                  key={day.key}
                  className={`flex flex-col items-center gap-2 rounded-xl border py-2.5 ${
                    count > 0 ? "border-line bg-sun-wash" : "border-transparent bg-mist/60"
                  }`}
                >
                  <span
                    className={`text-xs ${
                      isToday ? "font-bold text-ink" : count > 0 ? "text-ink" : "text-muted"
                    }`}
                  >
                    {day.initial}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`rounded-full ${
                      count > 0
                        ? isNext
                          ? "size-2.5 bg-ink"
                          : "size-2.5 bg-mint"
                        : "size-1.5 bg-line"
                    }`}
                  />
                  <span className="sr-only">
                    {weekdayOf(new Date(weekStart.getTime() + index * DAY_MS), viewer.timezone)}:{" "}
                    {count} {count === 1 ? "meeting" : "meetings"}
                    {isToday ? ", today" : ""}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="mt-auto pt-5 text-sm text-muted">{nextMeetingCaption}</p>
        </section>
      </div>

      {/* The chart is real point averages; the next-meetups strip is chronological. */}
      <div className="grid gap-4 lg:grid-cols-3">
        <section className="flex h-full flex-col rounded-2xl border border-line bg-surface p-5 lg:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-display text-lg font-bold tracking-tight text-ink">Goal progress by point</h2>
            <Badge tone="muted">In your points</Badge>
          </div>

          {pointProgress.length === 0 ? (
            <div className="flex flex-1 flex-col items-start justify-center gap-1.5 py-8">
              <p className="text-sm text-muted">No goals have been recorded in your points yet.</p>
              <Link
                href="/chords"
                className="text-sm font-semibold text-ink underline decoration-line underline-offset-4 transition-colors hover:decoration-ink"
              >
                Browse chords
              </Link>
            </div>
          ) : (
            <div className="mt-4 flex flex-1 flex-col justify-end">
              <div className="flex h-40 items-end justify-around gap-2 border-b border-line sm:gap-4">
                {pointProgress.map(({ point, average, goalCount }) => (
                  <div
                    key={point.id}
                    role="img"
                    aria-label={`${point.title}: ${average}% average progress across ${goalCount} ${
                      goalCount === 1 ? "goal" : "goals"
                    }`}
                    className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5"
                  >
                    <span className="tnum text-xs font-semibold text-ink">{average}%</span>
                    <span
                      aria-hidden="true"
                      className="relative w-full max-w-10 rounded-t-md bg-sage"
                      style={{ height: `${Math.max(6, Math.round((average / 100) * 104))}px` }}
                    >
                      <span className="absolute inset-x-0 top-0 h-1.5 rounded-t-md bg-mint" />
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-around gap-2 pt-2 sm:gap-4">
                {pointProgress.map(({ point }) => (
                  <span
                    key={point.id}
                    className="min-w-0 flex-1 truncate text-center text-[11px] text-muted"
                    title={point.title}
                  >
                    {shortPointName(point.title)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="flex h-full flex-col rounded-2xl border border-line bg-surface p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold tracking-tight text-ink">Coming up</h2>
              <p className="mt-0.5 text-xs text-muted">Meetings and deadlines, soonest first.</p>
            </div>
            <Link
              href="/dashboard#schedule"
              className="pt-1 text-xs font-semibold text-muted transition-colors hover:text-ink"
            >
              Schedule
            </Link>
          </div>

          {comingUp.length === 0 ? (
            <div className="flex flex-1 flex-col items-start justify-center gap-1.5 py-8">
              <p className="text-sm text-muted">Nothing scheduled yet.</p>
              <Link
                href="/chords"
                className="text-sm font-semibold text-ink underline decoration-line underline-offset-4 transition-colors hover:decoration-ink"
              >
                Find a point
              </Link>
            </div>
          ) : (
            <ul className="mt-4 flex-1 divide-y divide-line">
              {comingUp.map(({ item, at, point }, index) => {
                const [month, dayNumber] = shortDate(at, viewer.timezone).split(" ");
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href ?? "/dashboard#schedule"}
                      className="group flex items-center gap-3 py-3"
                    >
                      <span
                        aria-hidden="true"
                        className={`flex size-11 shrink-0 flex-col items-center justify-center rounded-xl ${
                          index === 0 ? "bg-sun text-ink" : "bg-sun-wash text-ink"
                        }`}
                      >
                        <span className="tnum text-sm font-bold leading-none">{dayNumber}</span>
                        <span className="mt-0.5 text-[11px] leading-none text-muted">{month}</span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-ink group-hover:underline">
                          {item.title}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted">
                          {item.kind === "meeting"
                            ? `${weekdayOf(at, viewer.timezone)} at ${timeOf(at, viewer.timezone)}${
                                point && point.memberIds.length > 0
                                  ? ` · ${point.memberIds.length} ${
                                      point.memberIds.length === 1 ? "member" : "members"
                                    }`
                                  : ""
                              }`
                            : `Deadline${point ? ` · ${point.title}` : ""}`}
                        </span>
                      </span>
                      <ArrowRight
                        className="size-4 shrink-0 text-muted transition-colors group-hover:text-ink"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {/* The page's one strong moment. */}
      {nextMeeting ? (
        <section className="rounded-2xl border border-line bg-sun-soft p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sun text-ink">
              <Clock className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-ink">
                Next meetup · {weekdayOf(nextMeeting.at, viewer.timezone)}{" "}
                {timeOf(nextMeeting.at, viewer.timezone)}
              </p>
              <p className="mt-0.5 truncate text-sm text-muted">
                {nextMeeting.point.title} · {nextMeeting.point.memberIds.length}{" "}
                {nextMeeting.point.memberIds.length === 1 ? "member" : "members"}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:ml-auto sm:flex-row sm:items-center">
              <p className="w-fit rounded-2xl border border-line bg-paper px-3 py-2 text-sm text-ink">
                See you at the meeting room.
              </p>
              <Button href={`/points/${nextMeeting.point.id}/meeting`} variant="ink">
                Join the session
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </section>
      ) : (
        <section className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5 sm:flex-row sm:items-center">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sun-wash text-ink">
            <Clock className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-semibold text-ink">No meetup scheduled yet</p>
            <p className="mt-0.5 text-sm text-muted">Join a point to get a weekly session on the calendar.</p>
          </div>
          <Button href="/chords" variant="ink" className="sm:ml-auto">
            Find a point
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </section>
      )}

      {/* Below the fold: the quieter working parts of the dashboard. */}
      <section className="space-y-3">
        <SectionHeading
          title="Your chords"
          action={
            <Link
              href="/chords"
              className="text-sm font-semibold text-muted transition-colors hover:text-ink hover:underline"
            >
              Find more
            </Link>
          }
        />
        {myChords.length === 0 ? (
          <EmptyState
            title="You haven't joined a chord yet"
            hint="Chords are subjects. Join one to find its points."
            action={
              <Button href="/chords" variant="ink">
                Browse chords
              </Button>
            }
          />
        ) : (
          <ul className="flex flex-wrap gap-2">
            {myChords.map((chord) => (
              <li key={chord.id}>
                <Link
                  href={`/chords/${chord.id}`}
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm font-semibold text-ink transition-colors hover:border-ink/25 hover:bg-sun-wash"
                >
                  <span className="size-2 rounded-full" style={{ backgroundColor: chord.color }} aria-hidden="true" />
                  {chord.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <SectionHeading title="Your points" hint="Groups you belong to, soonest meeting first." />
        {upcomingPoints.length === 0 ? (
          <EmptyState
            title="No points yet"
            hint="Join a point from a chord to get a weekly group."
            action={
              <Button href="/chords" variant="ink">
                Browse chords
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingPoints.slice(0, 6).map(({ point }) => {
              const chord = chordById.get(point.chordId);
              if (!chord) return null;
              return (
                <PointCard
                  key={point.id}
                  point={point}
                  chord={chord}
                  moderator={userById.get(point.moderatorId)}
                  members={point.memberIds
                    .map((id) => userById.get(id))
                    .filter((user) => user !== undefined)}
                  currentGoal={myOpenGoals.find((goal) => goal.pointId === point.id)?.title}
                  timeZone={viewer.timezone}
                />
              );
            })}
          </div>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <section id="schedule" className="min-w-0 scroll-mt-24 space-y-3 lg:col-span-2">
          <SectionHeading
            title="Your schedule"
            hint={`The next 14 days in ${viewer.timezone.replace(/_/g, " ")}.`}
          />
          <Calendar items={allScheduleItems} timeZone={viewer.timezone} days={14} />
        </section>

        <section className="min-w-0 space-y-3">
          <SectionHeading
            title="Due this week"
            hint={
              weekDeadlines.length === 0
                ? "Nothing due in the week ahead."
                : `${weekDeadlines.length} ${weekDeadlines.length === 1 ? "deadline" : "deadlines"}`
            }
          />
          {weekDeadlines.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-paper px-5 py-8 text-center">
              <p className="text-sm text-muted">No deadlines in this week&apos;s window.</p>
              <Link
                href="/chords"
                className="mt-1 inline-block text-sm font-semibold text-ink underline decoration-line underline-offset-4 hover:decoration-ink"
              >
                Browse chords
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {weekDeadlines.map((item) => (
                <DeadlineCard
                  key={item.id}
                  title={item.title}
                  at={item.at}
                  timeZone={viewer.timezone}
                  href={item.href}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <MotivationCard action={getMotivation} />
    </div>
  );
}
