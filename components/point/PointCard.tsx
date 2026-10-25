import Link from "next/link";
import { Avatar, AvatarStack } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { PointStatusBadge } from "@/components/ui/StatusBadge";
import { WEEKDAY_NAMES, formatDateTime, formatTime, nextWeeklyOccurrence } from "@/lib/domain/time";
import type { Chord, Point, User } from "@/types";

export interface PointCardProps {
  point: Point;
  chord: Chord;
  moderator?: User;
  members: User[];
  /** Current objective for the point, if any. */
  currentGoal?: string;
  /** Timezone used to render the next meeting. Defaults to the point's own timezone. */
  timeZone?: string;
  /** Optional link override (defaults to the point's detail page). */
  href?: string;
}

/** Reusable point card. Never create subject-specific variants of this. */
export function PointCard({ point, chord, moderator, members, currentGoal, timeZone, href }: PointCardProps) {
  const next = nextWeeklyOccurrence(point.schedule);
  const zone = timeZone ?? point.schedule.timezone;
  const scheduleZone = point.schedule.timezone.split("/").pop()?.replaceAll("_", " ") ?? point.schedule.timezone;

  return (
    <Card
      interactive
      className="group relative flex h-full flex-col focus-within:ring-2 focus-within:ring-ink focus-within:ring-offset-2 focus-within:ring-offset-paper"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="flex min-w-0 items-center gap-2 text-[13px] text-muted">
          <span
            className="size-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: chord.color }}
            aria-hidden="true"
          />
          <span className="truncate">{chord.name}</span>
        </p>
        <PointStatusBadge status={point.status} />
      </div>

      <h3 className="mt-1.5 font-display text-lg font-bold tracking-tight text-ink">{point.title}</h3>

      {point.description ? <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{point.description}</p> : null}

      <dl className="mt-4 space-y-2 border-t border-line pt-3 text-sm">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="shrink-0 text-muted">Meets</dt>
          <dd className="text-right font-medium text-ink">
            {WEEKDAY_NAMES[point.schedule.weekday]} · {formatTime(point.schedule.time, point.schedule.timezone)}
            <span className="mt-0.5 block text-[11px] font-normal text-muted">{scheduleZone} time</span>
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="shrink-0 text-muted">Next</dt>
          <dd className="text-right font-medium text-ink">{formatDateTime(next, zone)}</dd>
        </div>
        {moderator ? (
          <div className="flex items-center justify-between gap-3">
            <dt className="shrink-0 text-muted">Moderator</dt>
            <dd className="flex min-w-0 items-center gap-1.5 font-medium text-ink">
              <Avatar name={moderator.name} color={moderator.avatarColor} size={20} className="ring-2 ring-surface" />
              <span className="truncate">{moderator.name}</span>
            </dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
        <div className="flex items-center gap-2">
          {members.length > 0 ? <AvatarStack people={members} size={22} /> : null}
          <span className="tnum text-xs text-muted">
            {members.length} {members.length === 1 ? "member" : "members"}
          </span>
        </div>
        {currentGoal ? (
          <span className="max-w-[55%] truncate text-xs text-muted" title={currentGoal}>
            Working on {currentGoal}
          </span>
        ) : (
          <span className="text-xs text-muted">No goal yet</span>
        )}
      </div>

      <Link href={href ?? `/points/${point.id}`} className="absolute inset-0 rounded-2xl focus-visible:outline-none">
        <span className="sr-only">Open the {point.title} point</span>
      </Link>
    </Card>
  );
}
