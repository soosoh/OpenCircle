import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PointStatusBadge } from "@/components/ui/StatusBadge";
import { WEEKDAY_NAMES, formatDateTime, nextWeeklyOccurrence } from "@/lib/domain/time";
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
}

/** Reusable point card. Never create subject-specific variants of this. */
export function PointCard({ point, chord, moderator, members, currentGoal, timeZone }: PointCardProps) {
  const next = nextWeeklyOccurrence(point.schedule);
  const zone = timeZone ?? point.schedule.timezone;

  return (
    <Link href={`/points/${point.id}`} className="group block h-full">
      <Card interactive className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: chord.color }}>
              {chord.name}
            </p>
            <h3 className="text-base font-semibold tracking-tight group-hover:text-brand">{point.title}</h3>
          </div>
          <PointStatusBadge status={point.status} />
        </div>

        {point.description ? <p className="mt-2 line-clamp-2 text-sm text-muted">{point.description}</p> : null}

        <dl className="mt-4 space-y-1.5 text-sm">
          <div className="flex justify-between gap-2">
            <dt className="text-muted">Meets</dt>
            <dd className="text-right font-medium">
              {WEEKDAY_NAMES[point.schedule.weekday]} {point.schedule.time} · {zone.split("/").pop()?.replace("_", " ")}
            </dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted">Next</dt>
            <dd className="text-right font-medium">{formatDateTime(next, zone)}</dd>
          </div>
          {moderator ? (
            <div className="flex justify-between gap-2">
              <dt className="text-muted">Moderator</dt>
              <dd className="flex items-center gap-1.5 text-right font-medium">
                <Avatar name={moderator.name} color={moderator.avatarColor} size={20} />
                {moderator.name}
              </dd>
            </div>
          ) : null}
        </dl>

        <div className="mt-4 flex items-center justify-between gap-2 border-t border-line pt-3">
          <span className="text-sm text-muted">
            {members.length} {members.length === 1 ? "member" : "members"}
          </span>
          {currentGoal ? (
            <Badge tone="brand" className="max-w-[60%] truncate">
              {currentGoal}
            </Badge>
          ) : (
            <Badge tone="muted">No goals yet</Badge>
          )}
        </div>
      </Card>
    </Link>
  );
}
