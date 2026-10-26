import Link from "next/link";
import { connection } from "next/server";
import { MotivationCard } from "@/components/assistant/MotivationCard";
import {
  ActivityEmptyCard,
  ComingUpCard,
  GoalsCard,
  MomentumCard,
  NextMeetupStrip,
  PointBarsCard,
  ShowingUpCard,
  StageHeader,
  StreakCard,
  WeekCard,
  type StageChip,
} from "@/components/circle/DashboardCards";
import { DashboardMotion } from "@/components/circle/DashboardMotion";
import { Mascot } from "@/components/landing/mascot";
import { PointCard } from "@/components/point/PointCard";
import { Calendar } from "@/components/schedule/Calendar";
import { DeadlineCard } from "@/components/schedule/DeadlineCard";
import { Button } from "@/components/ui/Button";
import { EmptyState, SectionHeading } from "@/components/ui/Card";
import { getMotivation } from "@/lib/api/actions";
import { requireUser } from "@/lib/api/session";
import {
  listChords,
  listGoals,
  listHelpRequests,
  listMessages,
  listPoints,
  listPrivateMessages,
  listUsers,
} from "@/lib/database/repository";
import { dailyActivity, memberActivityTimes, streakWeeks, weeklyActivity } from "@/lib/domain/activity";
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

const dueDate = (date: Date, timeZone: string) =>
  new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short", month: "short", day: "numeric" }).format(date);

const weekdayOf = (date: Date, timeZone: string, style: "long" | "short" | "narrow" = "long") =>
  new Intl.DateTimeFormat("en-US", { timeZone, weekday: style }).format(date);

const timeOf = (date: Date, timeZone: string) =>
  new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", minute: "2-digit" }).format(date);

const plural = (count: number, one: string, many = `${one}s`) => `${count} ${count === 1 ? one : many}`;

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

function greetingFor(hour: number): string {
  if (hour < 5) return "Up late";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  // Meeting times are computed against "now", so the render is explicitly dynamic.
  await connection();
  const viewer = await requireUser();

  const [chords, points, goals, users, helpRequests, messages, privateMessages] = await Promise.all([
    listChords(),
    listPoints(),
    listGoals(),
    listUsers(),
    listHelpRequests(),
    listMessages(),
    listPrivateMessages(),
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
  const moderatedPoints = points.filter((point) => point.moderatorId === viewer.id);
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
      label: weekdayOf(day, viewer.timezone),
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

  const nextMeeting = meetingRecords[0];
  const todayKey = dayKey(now, viewer.timezone);
  const nextKey = nextMeeting ? dayKey(nextMeeting.at, viewer.timezone) : null;
  const weekCardDays = weekDays.map((day) => ({
    ...day,
    count: thisWeekMeetings.filter((entry) => dayKey(entry.at, viewer.timezone) === day.key).length,
    isToday: day.key === todayKey,
    isNext: day.key === nextKey,
  }));

  const comingUp = allScheduleItems
    .filter((item) => new Date(item.at).getTime() >= now.getTime())
    .slice(0, 4)
    .map((item) => {
      const at = new Date(item.at);
      const point = item.pointId ? pointById.get(item.pointId) : undefined;
      const [month, day] = shortDate(at, viewer.timezone).split(" ");
      return {
        id: item.id,
        href: item.href ?? "/dashboard#schedule",
        title: item.title,
        month,
        day,
        meta:
          item.kind === "meeting"
            ? `${weekdayOf(at, viewer.timezone)} at ${timeOf(at, viewer.timezone)}${
                point && point.memberIds.length > 0 ? ` · ${plural(point.memberIds.length, "member")}` : ""
              }`
            : `Deadline${point ? ` · ${point.title}` : ""}`,
      };
    });
  const nextMeetingCaption = nextMeeting
    ? `Your next one is ${weekdayOf(nextMeeting.at, viewer.timezone)} at ${timeOf(
        nextMeeting.at,
        viewer.timezone,
      )}.`
    : "No meetings on the calendar yet. Join a point to get a weekly one.";

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
        ? `Recorded by ${moderatorFirstNames[0]} · average across your open goals`
        : "Average across your open goals";

  const footerEntry =
    [...openAssignments].sort(
      (a, b) =>
        STATUS_RANK[b.goal.status] - STATUS_RANK[a.goal.status] ||
        a.goal.deadline.localeCompare(b.goal.deadline),
    )[0] ?? null;

  const singleGoalPoint =
    goalPointIds.size === 1 ? pointById.get([...goalPointIds][0]) : undefined;
  const goalsFooter = singleGoalPoint
    ? `${plural(singleGoalPoint.memberIds.length, "member")} in ${singleGoalPoint.title}`
    : `${plural(openAssignments.length, "goal")} across ${plural(goalPointIds.size, "point")}`;

  const goalLines = openAssignments.map(({ goal, assignment, point }) => ({
    id: goal.id,
    href: `/points/${goal.pointId}`,
    title: goal.title,
    progress: assignment.progress,
    meta: `Due ${dueDate(new Date(goal.deadline), viewer.timezone)} · ${point.title}`,
  }));

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
    .slice(0, 6)
    .map(({ point, average, goalCount }) => ({
      id: point.id,
      href: `/points/${point.id}`,
      title: point.title,
      label: shortPointName(point.title),
      average,
      goalCount,
    }));

  const weekDeadlines = allScheduleItems.filter((item) => {
    if (item.kind !== "deadline") return false;
    const key = dayKey(new Date(item.at), viewer.timezone);
    return key >= startKey && key <= endKey;
  });

  const upcomingPoints = [...myPoints]
    .map((point) => ({ point, next: meetingRecords.find((entry) => entry.point.id === point.id)?.at }))
    .sort((a, b) => (a.next?.getTime() ?? Infinity) - (b.next?.getTime() ?? Infinity));

  // ---- Activity: streak, momentum, showing up (messages, support requests, private messages) ----
  const activityTimes = memberActivityTimes(viewer.id, { messages, helpRequests, privateMessages }, now);
  const streak = streakWeeks(activityTimes, now, viewer.timezone);
  const twelveWeeks = weeklyActivity(activityTimes, now, viewer.timezone, 12);
  const dayLabel = (key: string) =>
    new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: "short", month: "short", day: "numeric" }).format(
      new Date(`${key}T12:00:00.000Z`),
    );
  const momentumDays = dailyActivity(activityTimes, now, viewer.timezone, 28).map((day) => ({
    ...day,
    label: dayLabel(day.key),
  }));
  const showingUpWeeks = twelveWeeks.map((week) => ({
    key: week.key,
    active: week.active,
    label: `Week of ${dayLabel(week.key).split(", ")[1]}`,
  }));
  const hasActivity = activityTimes.length > 0;

  // ---- The greeting stage ----
  const firstName = viewer.name.split(" ")[0];
  const greeting = greetingFor(zonedParts(now, viewer.timezone).hour);

  const supportHref =
    moderatedPoints.length > 0 ? "/moderator" : `/points/${myHelpRequests[0]?.pointId ?? ""}`;
  const chips: StageChip[] = [
    ...(myHelpRequests.length > 0
      ? [
          {
            label: `${plural(myHelpRequests.length, "open support request")}`,
            href: supportHref,
            tone: "coral" as const,
          },
        ]
      : []),
    ...(moderatedPoints.length > 0
      ? [
          {
            label: `You moderate ${plural(moderatedPoints.length, "point")}`,
            href: "/moderator",
            tone: "ink" as const,
          },
        ]
      : []),
  ];

  const meetingToday = meetingRecords.find(
    (entry) => entry.at.getTime() >= now.getTime() && dayKey(entry.at, viewer.timezone) === todayKey,
  );
  const soonestGoal = openAssignments[0];
  const bubble = meetingToday
    ? { title: `${meetingToday.point.title} meets today.`, body: `At ${timeOf(meetingToday.at, viewer.timezone)}. Don't miss it.` }
    : soonestGoal
      ? {
          title: `${plural(openAssignments.length, "goal")} still open.`,
          body: `${soonestGoal.goal.title} is due ${dueDate(new Date(soonestGoal.goal.deadline), viewer.timezone)}.`,
        }
      : myPoints.length > 0
        ? { title: "You're all caught up.", body: "Nothing open this week." }
        : { title: "Welcome to the circle.", body: "Join a chord and find your first point." };

  return (
    <DashboardMotion>
      {/* The stage: a flat yellow field that carries the greeting and the week's cards. */}
      <div className="full-bleed -mt-8 rounded-b-[2.5rem] bg-sun">
        <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-8 sm:px-6 sm:pb-12 sm:pt-10">
          <StageHeader
            greeting={greeting}
            name={firstName}
            weekRange={weekRange}
            context={`${viewer.educationLevel} · ${viewer.gradeLevel} · ${plural(myChords.length, "chord")}, ${plural(myPoints.length, "point")}`}
            chips={chips}
            mood={myHelpRequests.length > 0 ? "peek" : "happy"}
            bubbleTitle={bubble.title}
            bubbleBody={bubble.body}
          />

          <div className="mt-8 grid gap-4 md:grid-cols-12">
            <GoalsCard
              className="md:col-span-12 lg:col-span-8"
              goals={goalLines}
              average={viewerAverage}
              caption={goalsMeta}
              footer={goalsFooter}
              footerStatus={footerEntry?.goal.status ?? null}
              footerHref={footerEntry ? `/points/${footerEntry.point.id}` : null}
            />
            <WeekCard
              className="md:col-span-6 lg:col-span-4"
              ahead={upcomingThisWeek.length}
              days={weekCardDays}
              caption={nextMeetingCaption}
              agenda={thisWeekMeetings.map((entry) => ({
                id: entry.item.id,
                href: `/points/${entry.point.id}`,
                when: `${weekdayOf(entry.at, viewer.timezone, "short")} ${timeOf(entry.at, viewer.timezone)}`,
                title: entry.point.title,
                done: entry.at.getTime() < now.getTime(),
              }))}
            />
            <PointBarsCard className="md:col-span-6 lg:col-span-7" bars={pointProgress} />
            <ComingUpCard className="md:col-span-12 lg:col-span-5" entries={comingUp} />
            {hasActivity ? (
              <>
                <StreakCard
                  className="md:col-span-6 lg:col-span-3"
                  current={streak.current}
                  best={streak.best}
                  activeThisWeek={streak.activeThisWeek}
                  recentWeeks={twelveWeeks.slice(-6).map((week) => week.count)}
                />
                <ShowingUpCard className="md:col-span-6 lg:col-span-4" weeks={showingUpWeeks} />
                <MomentumCard className="md:col-span-12 lg:col-span-5" days={momentumDays} />
              </>
            ) : (
              <ActivityEmptyCard
                className="md:col-span-12"
                href={myPoints[0] ? `/points/${myPoints[0].id}` : "/chords"}
              />
            )}
            <NextMeetupStrip
              className="md:col-span-12"
              next={
                nextMeeting
                  ? {
                      title: nextMeeting.point.title,
                      when: `${weekdayOf(nextMeeting.at, viewer.timezone)} ${timeOf(nextMeeting.at, viewer.timezone)}`,
                      members: nextMeeting.point.memberIds.length,
                      href: `/points/${nextMeeting.point.id}/meeting`,
                    }
                  : null
              }
            />
          </div>
        </div>
      </div>

      {/* Below the stage: the working parts, on paper. */}
      <div className="mt-12 space-y-12">
        <section className="space-y-3">
          <SectionHeading title="Your points" hint="Groups you belong to, soonest meeting first." />
          {upcomingPoints.length === 0 ? (
            <EmptyState
              art={<Mascot mood="peek" color="#2E7D5B" className="size-16 animate-bob" />}
              title="No points yet"
              hint="Join a point from a chord to get a weekly group."
              action={
                <Button href="/chords" variant="ink">
                  Browse chords
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,19rem),1fr))] gap-4">
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

        <section className="space-y-3">
          <SectionHeading
            title="Your chords"
            action={
              <Link
                href="/chords"
                className="inline-flex min-h-10 items-center text-sm font-semibold text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink"
              >
                Find more
              </Link>
            }
          />
          {myChords.length === 0 ? (
            <EmptyState
              art={<Mascot mood="wink" color="#2E7D5B" className="size-16 animate-bob" />}
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
                    className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-semibold text-ink transition-colors hover:border-ink/25 hover:bg-sun-wash"
                  >
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: chord.color }}
                      aria-hidden="true"
                    />
                    {chord.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
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
                  : plural(weekDeadlines.length, "deadline")
              }
            />
            {weekDeadlines.length === 0 ? (
              <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-line bg-surface px-5 py-6 sm:flex-row sm:items-center">
                <Mascot mood="cheer" color="#2E7D5B" className="size-14 animate-bob" />
                <div>
                  <p className="font-semibold text-ink">Nothing due this week.</p>
                  <Link
                    href="/chords"
                    className="mt-1 inline-flex min-h-10 items-center text-sm font-semibold text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink"
                  >
                    Browse chords
                  </Link>
                </div>
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
    </DashboardMotion>
  );
}
