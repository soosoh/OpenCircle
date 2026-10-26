import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { Avatar, AvatarStack } from "@/components/ui/Avatar";
import { PointStatusBadge } from "@/components/ui/StatusBadge";
import { WEEKDAY_NAMES, formatDateTime, formatTime, nextWeeklyOccurrence } from "@/lib/domain/time";
import type { Chord, Point, User } from "@/types";

export interface PointCardProps {
  point: Point;
  chord: Chord;
  moderator?: User;
  members: User[];
  /** Shown instead of members.length when the avatars are withheld from the viewer. */
  memberCount?: number;
  /** Current objective for the point, if any. */
  currentGoal?: string;
  /** Timezone used to render the next meeting. Defaults to the point's own timezone. */
  timeZone?: string;
  /** Optional link override (defaults to the point's detail page). */
  href?: string;
}

/** Reusable point card. Never create subject-specific variants of this. */
export function PointCard({
  point,
  chord,
  moderator,
  members,
  memberCount = members.length,
  currentGoal,
  timeZone,
  href,
}: PointCardProps) {
  const next = nextWeeklyOccurrence(point.schedule);
  const zone = timeZone ?? point.schedule.timezone;
  const scheduleZone = point.schedule.timezone.split("/").pop()?.replaceAll("_", " ") ?? point.schedule.timezone;

  return (
    <article className="group relative flex h-full flex-col rounded-2xl border border-line bg-surface p-5 lift-card has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-ink has-[a:focus-visible]:ring-offset-2 has-[a:focus-visible]:ring-offset-paper">
      <div className="flex items-start justify-between gap-3">
        <p className="flex min-w-0 items-center gap-2 text-[13px] font-medium text-ink">
          <span
            className="size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: chord.color }}
            aria-hidden="true"
          />
          <span className="truncate">{chord.name}</span>
        </p>
        <PointStatusBadge status={point.status} />
      </div>

      <h3 className="mt-2 font-display text-xl font-bold leading-tight tracking-tight text-ink">{point.title}</h3>

      {point.description ? <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink">{point.description}</p> : null}

      <div className="mt-4 flex items-center gap-3 rounded-xl bg-sun-wash px-3.5 py-3">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-mint text-white"
          aria-hidden="true"
        >
          <Clock size={16} strokeWidth={2.25} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-ink">
            <span className="sr-only">Meets </span>
            {WEEKDAY_NAMES[point.schedule.weekday]} · {formatTime(point.schedule.time, point.schedule.timezone)}
            <span className="ml-1.5 text-xs font-medium text-muted">{scheduleZone} time</span>
          </p>
          <p className="truncate text-xs text-muted">Next · {formatDateTime(next, zone)}</p>
        </div>
      </div>

      {moderator ? (
        <p className="mt-3 flex min-w-0 items-center gap-2 text-sm text-ink">
          <Avatar name={moderator.name} color={moderator.avatarColor} size={22} />
          <span className="truncate">
            <span className="text-muted">Moderator </span>
            <span className="font-semibold">{moderator.name}</span>
          </span>
        </p>
      ) : null}

      <div className="mt-auto pt-4">
        <div className="flex w-full flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-line pt-4">
          <div className="flex items-center gap-2">
            {members.length > 0 ? <AvatarStack people={members} size={24} /> : null}
            <span className="tnum text-xs text-muted">
              <span className="font-bold text-ink">{memberCount}</span> {memberCount === 1 ? "member" : "members"}
            </span>
          </div>
          <span className="flex min-w-0 items-center gap-2">
            {currentGoal ? (
              <span className="max-w-44 truncate text-xs text-ink" title={currentGoal}>
                Working on {currentGoal}
              </span>
            ) : (
              <span className="text-xs text-muted">No goal yet</span>
            )}
            <span
              className="flex size-8 shrink-0 items-center justify-center rounded-full border border-line text-ink transition-colors duration-200 ease-out-quart group-hover:border-ink group-hover:bg-ink group-hover:text-white"
              aria-hidden="true"
            >
              <ArrowRight size={14} strokeWidth={2.25} />
            </span>
          </span>
        </div>
      </div>

      <Link href={href ?? `/points/${point.id}`} className="absolute inset-0 rounded-2xl focus-visible:outline-none">
        <span className="sr-only">Open the {point.title} point</span>
      </Link>
    </article>
  );
}
