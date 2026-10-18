import Link from "next/link";
import { AvatarStack } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { audienceLabel } from "@/lib/domain/audience";
import type { Chord } from "@/types";

/** Chord card used on the homepage circle and in the chord directory. */
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
    <Link href={`/chords/${chord.id}`} className="group block h-full">
      <Card interactive className="flex h-full flex-col">
        <span className="mb-3 block h-1.5 w-10 rounded-full" style={{ backgroundColor: chord.color }} />
        <h3 className="text-base font-semibold tracking-tight group-hover:text-brand">{chord.name} Chord</h3>
        <p className="mt-1 flex-1 text-sm text-muted">{chord.description}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge tone="brand">{members.length} members</Badge>
          <Badge tone="muted">
            {activePoints} active {activePoints === 1 ? "point" : "points"}
          </Badge>
          {chord.audience !== "all" ? <Badge tone="coral">{audienceLabel(chord.audience)}</Badge> : null}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <AvatarStack people={members} size={28} />
          <span className="text-sm font-medium text-brand opacity-0 transition-opacity group-hover:opacity-100">
            Enter →
          </span>
        </div>
      </Card>
    </Link>
  );
}
