import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Clock, UsersRound } from "lucide-react";
import { DotDigits, SpeechBubble } from "@/components/landing/mockups";
import { Mascot } from "@/components/landing/mascot";
import { GoalStatusBadge } from "@/components/ui/StatusBadge";
import type { GoalStatus } from "@/types";

/**
 * The signed-in dashboard, as pieces. Same grammar as the landing preview:
 * white cards with a hairline on a yellow stage, Fraunces card titles, a dark
 * fill for progress, dot-matrix numerals for the headline figure and a
 * mascot with a speech bubble. Every piece takes plain data as props; every
 * number it prints was computed from the data store by the page.
 *
 * Animation hooks (`data-rise`, `data-grow-x`, ...) are read by DashboardMotion.
 */

const CARD_TITLE = "font-display text-lg font-bold leading-tight tracking-tight text-ink";
const LINK_UNDERLINE =
  "link text-sm";

export function DashCard({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      data-rise
      className={`flex min-w-0 flex-col rounded-2xl border border-line bg-surface p-5 ${className}`}
    >
      {children}
    </section>
  );
}

/** A friendly empty state: the mascot, one sentence, one clear action. */
function CardEmpty({
  title,
  hint,
  href,
  action,
  mood = "peek",
}: {
  title: string;
  hint: string;
  href: string;
  action: string;
  mood?: "peek" | "happy" | "wink";
}) {
  return (
    <div className="flex flex-1 flex-col items-start justify-center gap-3 py-4 sm:flex-row sm:items-center sm:gap-4">
      <Mascot mood={mood} color="#2E7D5B" className="size-16 animate-bob" />
      <div className="min-w-0">
        <p className="font-semibold text-ink">{title}</p>
        <p className="mt-0.5 text-sm text-ink/80">{hint}</p>
        <Link href={href} className={`mt-2 inline-flex min-h-10 items-center ${LINK_UNDERLINE}`}>
          {action}
        </Link>
      </div>
    </div>
  );
}

/* ------------------------------ Stage header ------------------------------ */

/** A small read-only figure under the greeting. Flat and tinted so it never reads as a button. */
export type StageStat = { value: number; label: string; labelFirst?: boolean };

export type StageChip = { label: string; href?: string; tone: "coral" | "white" | "ink" };

const CHIP_TONES: Record<StageChip["tone"], string> = {
  coral: "bg-coral-soft text-coral-ink hover:bg-coral hover:text-white",
  white: "bg-surface text-ink hover:bg-sun-wash",
  ink: "bg-ink text-white hover:bg-ink-soft",
};

export function StageHeader({
  greeting,
  name,
  weekRange,
  stats,
  chips,
  mood,
  bubbleTitle,
  bubbleBody,
}: {
  greeting: string;
  name: string;
  weekRange: string;
  stats: StageStat[];
  chips: StageChip[];
  mood: "happy" | "cheer" | "peek";
  bubbleTitle: string;
  bubbleBody?: string;
}) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div data-rise className="min-w-0">
        <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-5xl">
          {greeting}, {name}.
        </h1>
        <ul className="tnum mt-3 flex flex-wrap items-center gap-2 text-sm font-semibold text-ink">
          <li className="inline-flex h-8 items-center rounded-full bg-sun-deep/40 px-3">
            <span className="sr-only">This week: </span>
            {weekRange}
          </li>
          {stats.map((stat) => (
            <li key={stat.label} className="inline-flex h-8 items-center rounded-full bg-sun-deep/40 px-3">
              {stat.labelFirst ? `${stat.label} ${stat.value}` : `${stat.value} ${stat.label}`}
            </li>
          ))}
        </ul>
        {chips.length > 0 ? (
          <ul className="mt-4 flex flex-wrap items-center gap-2">
            {chips.map((chip) => {
              const className = `inline-flex min-h-10 items-center rounded-full px-4 text-sm font-semibold ${CHIP_TONES[chip.tone]}`;
              return (
                <li key={chip.label}>
                  {chip.href ? (
                    <Link href={chip.href} className={`${className} transition-colors`}>
                      {chip.label}
                    </Link>
                  ) : (
                    <span className={className}>{chip.label}</span>
                  )}
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>

      <div data-rise className="flex items-end gap-3 sm:gap-4">
        <Mascot
          mood={mood}
          color={mood === "peek" ? "#C4462A" : "#2E7D5B"}
          className="size-20 animate-bob sm:size-24"
        />
        <SpeechBubble
          side="right"
          title={bubbleTitle}
          body={bubbleBody}
          className="mb-8 !max-w-[14rem] sm:!max-w-[16rem]"
        />
      </div>
    </div>
  );
}

/* ------------------------------ Goals ------------------------------ */

export type GoalLine = {
  id: string;
  href: string;
  title: string;
  progress: number;
  meta: string;
};

export function GoalsCard({
  goals,
  average,
  caption,
  footer,
  footerStatus,
  footerHref,
  className = "",
}: {
  goals: GoalLine[];
  average: number;
  caption: string | null;
  footer: string;
  footerStatus: GoalStatus | null;
  footerHref: string | null;
  className?: string;
}) {
  return (
    <DashCard className={className}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className={CARD_TITLE}>This week&apos;s goals</h2>
          {caption ? <p className="mt-1 text-sm text-muted">{caption}</p> : null}
        </div>
        {goals.length > 0 ? (
          <div className="flex shrink-0 items-end gap-1.5" aria-label={`Average ${average}%`}>
            <span data-dots>
              <DotDigits value={String(average)} className="h-8 w-auto text-ink" />
            </span>
            <span aria-hidden="true" className="pb-0.5 text-sm font-semibold text-ink">
              %
            </span>
          </div>
        ) : null}
      </div>

      {goals.length === 0 ? (
        <CardEmpty
          title="No goals assigned to you this week"
          hint="Your moderator sets goals inside a point. Join one and they show up here."
          href="/chords"
          action="Find a chord to join"
        />
      ) : (
        <>
          <ul className="mt-4 space-y-1">
            {goals.map((goal) => (
              <li key={goal.id}>
                <Link
                  href={goal.href}
                  aria-label={`${goal.title}, ${goal.progress}% complete`}
                  className="group -mx-2 block rounded-xl px-2 py-2 transition-colors hover:bg-sun-wash"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink group-hover:text-ink/70">
                      {goal.title}
                    </span>
                    <span
                      data-count={goal.progress}
                      data-suffix="%"
                      className="tnum shrink-0 rounded-full bg-mist px-2.5 py-0.5 text-xs font-bold text-ink"
                    >
                      {goal.progress}%
                    </span>
                  </div>
                  <div aria-hidden="true" className="mt-2 h-2 overflow-hidden rounded-full bg-line">
                    <div
                      data-grow-x
                      className="h-full rounded-full bg-ink"
                      style={{ width: `${Math.min(100, Math.max(0, goal.progress))}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-muted">{goal.meta}</p>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-line pt-3">
            <span className="flex min-w-0 items-center gap-1.5 text-xs text-ink">
              <UsersRound className="size-3.5 shrink-0" strokeWidth={2.25} aria-hidden="true" />
              <span className="truncate">{footer}</span>
            </span>
            {footerStatus && footerHref ? (
              <Link href={footerHref} className="inline-flex min-h-10 shrink-0 items-center">
                <GoalStatusBadge status={footerStatus} />
              </Link>
            ) : null}
          </div>
        </>
      )}
    </DashCard>
  );
}

/* ------------------------------ This week ------------------------------ */

export type WeekDay = {
  key: string;
  initial: string;
  label: string;
  count: number;
  isToday: boolean;
  isNext: boolean;
};

export function WeekCard({
  ahead,
  days,
  caption,
  agenda,
  className = "",
}: {
  ahead: number;
  days: WeekDay[];
  caption: string;
  agenda: { id: string; href: string; when: string; title: string; done: boolean }[];
  className?: string;
}) {
  return (
    <DashCard className={className}>
      <h2 className={CARD_TITLE}>Meetings this week</h2>

      <div className="mt-3 flex items-end gap-3">
        <span data-dots role="img" aria-label={String(ahead)}>
          <DotDigits value={String(Math.min(ahead, 99))} className="h-12 w-auto text-ink" />
        </span>
        <p className="pb-0.5 text-sm text-ink">{ahead === 1 ? "meeting still ahead" : "meetings still ahead"}</p>
      </div>

      <ul className="mt-4 grid grid-cols-7 gap-1.5">
        {days.map((day) => {
          const tone = day.isNext
            ? "bg-ink text-sun"
            : day.count > 0
              ? "bg-mint text-white"
              : "border border-line bg-mist text-muted";
          return (
            <li key={day.key}>
              <span
                className={`flex aspect-square items-center justify-center rounded-lg text-xs font-bold ${tone} ${
                  day.isToday ? "ring-2 ring-ink ring-offset-2 ring-offset-surface" : ""
                }`}
              >
                <span aria-hidden="true">{day.initial}</span>
                <span className="sr-only">
                  {day.label}: {day.count} {day.count === 1 ? "meeting" : "meetings"}
                  {day.isToday ? ", today" : ""}
                  {day.isNext ? ", your next one" : ""}
                </span>
              </span>
            </li>
          );
        })}
      </ul>

      <p
        aria-hidden="true"
        className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted"
      >
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-[3px] bg-mint" />
          meeting
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-[3px] bg-ink" />
          next
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-[3px] ring-2 ring-ink" />
          today
        </span>
      </p>

      {agenda.length > 0 ? (
        <ul className="mt-4 divide-y divide-line border-t border-line">
          {agenda.map((entry) => (
            <li key={entry.id}>
              <Link
                href={entry.href}
                className="group flex min-h-11 items-center justify-between gap-3 py-2 text-sm"
              >
                <span
                  className={`min-w-0 truncate font-semibold text-ink group-hover:text-ink/70 ${
                    entry.done ? "opacity-60" : ""
                  }`}
                >
                  {entry.title}
                </span>
                <span className="tnum shrink-0 text-xs text-muted">{entry.when}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      <p className="mt-auto pt-4 text-sm text-ink">{caption}</p>
    </DashCard>
  );
}

/* ------------------------------ Progress by point ------------------------------ */

export type PointBar = {
  id: string;
  href: string;
  title: string;
  label: string;
  average: number;
  goalCount: number;
};

export function PointBarsCard({ bars, className = "" }: { bars: PointBar[]; className?: string }) {
  return (
    <DashCard className={className}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 className={CARD_TITLE}>Goal progress by point</h2>
        <p className="text-sm text-muted">Average across every member, per point</p>
      </div>

      {bars.length === 0 ? (
        <CardEmpty
          title="No goals recorded in your points yet"
          hint="Once a moderator records a goal, each point gets its own progress bar."
          href="/chords"
          action="Browse chords"
        />
      ) : (
        <ul className="mt-5 flex flex-1 items-end justify-around gap-2 sm:gap-5">
          {bars.map((bar) => (
            <li key={bar.id} className="min-w-0 flex-1">
              <Link
                href={bar.href}
                title={bar.title}
                aria-label={`${bar.title}: ${bar.average}% average across ${bar.goalCount} ${
                  bar.goalCount === 1 ? "goal" : "goals"
                }`}
                className="group flex flex-col items-center gap-2"
              >
                <span
                  data-count={bar.average}
                  data-suffix="%"
                  className="tnum text-sm font-bold text-ink"
                >
                  {bar.average}%
                </span>
                <span
                  aria-hidden="true"
                  className="relative h-44 w-full max-w-20 overflow-hidden rounded-2xl bg-mist"
                >
                  <span
                    data-grow-y
                    className="absolute inset-x-0 bottom-0 rounded-2xl bg-mint"
                    style={{ height: `${Math.min(100, Math.max(0, bar.average))}%` }}
                  />
                </span>
                <span className="line-clamp-2 text-center text-xs font-medium leading-snug text-ink group-hover:text-ink/70">
                  {bar.label}
                </span>
                <span className="-mt-1.5 text-[11px] text-muted">
                  {bar.goalCount} {bar.goalCount === 1 ? "goal" : "goals"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </DashCard>
  );
}

/* ------------------------------ Coming up ------------------------------ */

export type ComingUpEntry = {
  id: string;
  href: string;
  title: string;
  month: string;
  day: string;
  meta: string;
};

export function ComingUpCard({ entries, className = "" }: { entries: ComingUpEntry[]; className?: string }) {
  return (
    <DashCard className={className}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className={CARD_TITLE}>Coming up</h2>
          <p className="mt-1 text-sm text-muted">Meetings and deadlines, soonest first.</p>
        </div>
        <Link
          href="/dashboard#schedule"
          className="inline-flex min-h-10 shrink-0 items-center link text-sm"
        >
          Schedule
        </Link>
      </div>

      {entries.length === 0 ? (
        <CardEmpty
          title="Nothing on the calendar yet"
          hint="Join a point and its weekly meeting lands here."
          href="/chords"
          action="Find a point"
        />
      ) : (
        <ul className="mt-2 flex-1 divide-y divide-line">
          {entries.map((entry, index) => (
            <li key={entry.id}>
              <Link href={entry.href} className="group flex min-h-16 items-center gap-3 py-3">
                <span
                  aria-hidden="true"
                  className={`flex size-12 shrink-0 flex-col items-center justify-center rounded-xl text-ink ${
                    index === 0 ? "bg-sun" : "bg-sun-wash"
                  }`}
                >
                  <span className="tnum text-base font-bold leading-none">{entry.day}</span>
                  <span className="mt-0.5 text-[11px] leading-none">{entry.month}</span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-ink group-hover:text-ink/70">
                    {entry.title}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted">{entry.meta}</span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-ink/60 transition-colors group-hover:text-ink" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </DashCard>
  );
}

/* ------------------------------ Next meetup ------------------------------ */

export function NextMeetupStrip({
  next,
  className = "",
}: {
  next: { title: string; when: string; members: number; href: string } | null;
  className?: string;
}) {
  return (
    <section
      data-rise
      className={`flex flex-col gap-4 rounded-2xl border border-line bg-surface px-5 py-4 sm:flex-row sm:items-center ${className}`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          aria-hidden="true"
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-mint text-white"
        >
          <Clock className="size-5" strokeWidth={2.25} />
        </span>
        <div className="min-w-0">
          <h2 className="truncate font-display text-lg font-bold leading-tight tracking-tight text-ink">
            {next ? `Next meetup · ${next.when}` : "No meetup scheduled yet"}
          </h2>
          <p className="mt-0.5 text-sm text-ink">
            {next
              ? `${next.title} · ${next.members} ${next.members === 1 ? "member" : "members"}`
              : "Join a point to put a weekly session on the calendar."}
          </p>
        </div>
      </div>

      <div className="flex min-w-0 flex-wrap items-center gap-3 sm:ml-auto sm:flex-nowrap">
        <div className="hidden items-center gap-1 lg:flex">
          <SpeechBubble
            side="left"
            title={next ? "See you at the meeting room." : "Pick a point and I'll save you a seat."}
            className="!max-w-[15rem]"
          />
          <Mascot mood="cheer" color="#2E7D5B" className="size-12 animate-bob [animation-delay:-1.8s]" />
        </div>
        <Mascot mood="cheer" color="#2E7D5B" className="size-10 animate-bob lg:hidden" />
        <Link
          href={next ? next.href : "/chords"}
          className="inline-flex min-h-11 items-center gap-2.5 rounded-full bg-ink py-1 pl-1 pr-5 text-white transition-colors hover:bg-ink-soft"
        >
          <span
            aria-hidden="true"
            className="flex size-9 items-center justify-center rounded-full bg-sun text-ink"
          >
            <ArrowRight className="size-4" strokeWidth={2.5} />
          </span>
          <span className="text-sm font-bold">{next ? "Join the session" : "Find a point"}</span>
        </Link>
      </div>
    </section>
  );
}

/* ------------------------------ Activity: streak, momentum, showing up ------------------------------ */

/*
 * "Activity" = the member sent a point message, raised a support request or sent a
 * private message (see lib/domain/activity.ts). There is no attendance record, so
 * every caption says exactly that and nothing more.
 */

const MICRO = "text-[11px] leading-snug text-muted";
const MINT_PILL = "rounded-full bg-sage px-2.5 py-1 text-[11px] font-semibold text-mint";

const plural = (count: number, one: string, many = `${one}s`) => `${count} ${count === 1 ? one : many}`;

/** Shown in place of the three activity cards until the member has done anything in a point. */
export function ActivityEmptyCard({ href, className = "" }: { href: string; className?: string }) {
  return (
    <DashCard className={className}>
      <CardEmpty
        title="Your streak starts with your first message."
        hint="Say hello in a point and your weekly streak, momentum and showing-up chart appear here."
        href={href}
        action="Open a point"
        mood="wink"
      />
    </DashCard>
  );
}

export function StreakCard({
  current,
  best,
  activeThisWeek,
  recentWeeks,
  className = "",
}: {
  current: number;
  best: number;
  activeThisWeek: boolean;
  /** Activity counts for the last six weeks, oldest first; the last one is this week. */
  recentWeeks: number[];
  className?: string;
}) {
  const peak = Math.max(1, ...recentWeeks);
  const bestLine =
    current > 0 && current >= best
      ? `Personal best: ${plural(best, "week")}, and you are on it now.`
      : `Personal best: ${plural(best, "week")}.`;
  return (
    <DashCard className={className}>
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5">
        <h2 className={CARD_TITLE}>Current streak</h2>
        <span className={`shrink-0 whitespace-nowrap ${MINT_PILL}`}>{activeThisWeek ? "Counted this week" : "Not yet this week"}</span>
      </div>
      <p className="mt-0.5 text-sm text-muted">Weeks in a row you took part in a point</p>

      <div className="mt-4 flex items-end justify-between gap-3">
        <span data-dots role="img" aria-label={plural(current, "week")}>
          <DotDigits value={String(Math.min(current, 99))} className="h-20 w-auto text-ink" />
        </span>
        <div className="flex h-16 items-end gap-1.5" aria-hidden="true">
          {recentWeeks.map((count, index) => (
            <span
              key={index}
              data-bar
              className={`w-1.5 rounded-full ${index === recentWeeks.length - 1 ? "bg-mint" : "bg-sage"}`}
              style={{ height: `${count === 0 ? 4 : 12 + Math.round((count / peak) * 52)}px` }}
            />
          ))}
        </div>
      </div>

      <p className={`mb-3 mt-1.5 text-right ${MICRO}`} aria-hidden="true">
        last 6 weeks
      </p>
      <p className={`mt-auto border-t border-line pt-3 ${MICRO}`}>{bestLine}</p>
    </DashCard>
  );
}

export type MomentumDay = { key: string; count: number; label: string };

export function MomentumCard({ days, className = "" }: { days: MomentumDay[]; className?: string }) {
  const peak = Math.max(1, ...days.map((day) => day.count));
  const busiest = Math.max(0, ...days.map((day) => day.count));
  const total = days.reduce((sum, day) => sum + day.count, 0);
  const recentFrom = days.length - 7;
  const weekCount = Math.max(1, Math.round(days.length / 7));
  return (
    <DashCard className={className}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className={CARD_TITLE}>Weekly momentum</h2>
        <span className="rounded-full bg-mist px-2.5 py-1 text-[11px] font-semibold text-muted">
          Last {weekCount} weeks
        </span>
      </div>
      <p className="mt-0.5 text-sm text-muted">
        {total === 0 ? "Nothing in the last 28 days." : `${plural(total, "action")} in your points, day by day`}
      </p>

      <div
        role="img"
        aria-label={`Activity per day over the last ${days.length} days: ${plural(total, "action")} in total, busiest day ${busiest}.`}
        className="mt-4 flex h-28 items-end gap-[3px]"
      >
        {days.map((day, index) => (
          <span
            key={day.key}
            data-bar
            title={`${day.label}: ${plural(day.count, "action")}`}
            className={`flex-1 rounded-full ${index >= recentFrom ? "bg-mint" : "bg-line"}`}
            style={{ height: `${day.count === 0 ? 5 : 14 + Math.round((day.count / peak) * 86)}%` }}
          />
        ))}
      </div>
      <div className={`mt-2 flex ${MICRO}`} aria-hidden="true">
        {Array.from({ length: weekCount }, (_, index) => (
          <span key={index} className="flex-1 text-center">
            Week {index + 1}
          </span>
        ))}
      </div>
      <p className={`mt-auto pt-3 ${MICRO}`}>Messages, support requests and private messages you sent.</p>
    </DashCard>
  );
}

export type ShowingUpWeek = { key: string; active: boolean; label: string };

export function ShowingUpCard({ weeks, className = "" }: { weeks: ShowingUpWeek[]; className?: string }) {
  const activeCount = weeks.filter((week) => week.active).length;
  return (
    <DashCard className={className}>
      <h2 className={CARD_TITLE}>Showing up</h2>
      <p className="mt-0.5 text-sm text-muted">Weeks you took part in a point</p>

      <div className="mt-4 flex items-end gap-3">
        <span data-dots role="img" aria-label={String(activeCount)}>
          <DotDigits value={String(activeCount)} className="h-16 w-auto text-ink" />
        </span>
        <p className="tnum pb-0.5 text-sm font-semibold text-ink">of the last {weeks.length} weeks</p>
      </div>

      <ul aria-label={`${activeCount} of the last ${weeks.length} weeks`} className="mt-5 flex items-center gap-1">
        {weeks.map((week) => (
          <li
            key={week.key}
            data-tile
            title={`${week.label}: ${week.active ? "took part" : "no activity"}`}
            className={`h-7 flex-1 rounded-[4px] ${week.active ? "bg-mint" : "bg-line"}`}
          >
            <span className="sr-only">
              {week.label}: {week.active ? "took part" : "no activity"}
            </span>
          </li>
        ))}
      </ul>

      <p aria-hidden="true" className={`mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-3 ${MICRO}`}>
        <span className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="size-2 rounded-[2px] bg-line" />
          no activity
        </span>
        <span className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="size-2 rounded-[2px] bg-mint" />
          took part
        </span>
        <span className="whitespace-nowrap">newest on the right</span>
      </p>
    </DashCard>
  );
}
