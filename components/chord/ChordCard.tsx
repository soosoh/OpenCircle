import Link from "next/link";
import { AvatarStack } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { audienceLabel } from "@/lib/domain/audience";
import type { Chord } from "@/types";

/**
 * Chord card used in the chord directory. The whole card is one link; the
 * subject colour appears only as the small dot beside the title.
 */
export function ChordCard({
  chord,
  members,
  activePoints,
}: {
  chord: Chord;
  members: { name: string; avatarColor: string }[];
  activePoints: number;
}) {
  return (
    <Card
      interactive
      className="group relative flex h-full flex-col focus-within:ring-2 focus-within:ring-ink focus-within:ring-offset-2 focus-within:ring-offset-paper"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className="size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: chord.color }}
            aria-hidden="true"
          />
          <h3 className="truncate font-display text-lg font-bold tracking-tight text-ink">{chord.name}</h3>
        </div>
        {chord.audience !== "all" ? (
          <Badge tone="sun" className="shrink-0">
            {audienceLabel(chord.audience)}
          </Badge>
        ) : null}
      </div>

      <p className="mt-2 flex-1 text-sm leading-6 text-muted">{chord.description}</p>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        {members.length > 0 ? (
          <AvatarStack people={members} size={26} />
        ) : (
          <span className="text-xs text-muted">No members yet</span>
        )}
        <span className="tnum text-xs text-muted">
          {activePoints} {activePoints === 1 ? "point" : "points"} · {members.length}{" "}
          {members.length === 1 ? "member" : "members"}
        </span>
      </div>

      <Link href={`/chords/${chord.id}`} className="absolute inset-0 rounded-2xl focus-visible:outline-none">
        <span className="sr-only">Open the {chord.name} chord</span>
      </Link>
    </Card>
  );
}
