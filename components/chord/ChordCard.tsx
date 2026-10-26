import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AvatarStack } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { audienceLabel } from "@/lib/domain/audience";
import type { Chord } from "@/types";

/**
 * Chord card used in the chord directory. The whole card is one link. The
 * subject colour lives in the circle that holds the chord's initial.
 */
export function ChordCard({
  chord,
  members,
  activePoints,
  joined = false,
}: {
  chord: Chord;
  members: { name: string; avatarColor: string }[];
  activePoints: number;
  /** The signed-in viewer already belongs to this chord. */
  joined?: boolean;
}) {
  return (
    <article className="group relative flex h-full flex-col rounded-2xl border border-line bg-surface p-5 lift-card has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-ink has-[a:focus-visible]:ring-offset-2 has-[a:focus-visible]:ring-offset-paper">
      <div className="flex items-start gap-3.5">
        <span
          className="flex size-12 shrink-0 items-center justify-center rounded-full border border-ink/10 font-display text-xl font-bold text-white"
          style={{ backgroundColor: chord.color }}
          aria-hidden="true"
        >
          {chord.name[0]}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg font-bold leading-tight tracking-tight text-ink">{chord.name}</h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <Badge tone={chord.audience === "all" ? "muted" : "sun"}>{audienceLabel(chord.audience)}</Badge>
            {joined ? <Badge tone="mint">Joined</Badge> : null}
          </div>
        </div>
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-full border border-line text-ink transition-colors duration-200 ease-out-quart group-hover:border-ink group-hover:bg-ink group-hover:text-white"
          aria-hidden="true"
        >
          <ArrowRight size={15} strokeWidth={2.25} className="-rotate-45" />
        </span>
      </div>

      <p className="mt-4 flex-1 text-sm leading-6 text-ink">{chord.description}</p>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-line pt-4">
        {members.length > 0 ? (
          <AvatarStack people={members} size={28} />
        ) : (
          <span className="text-xs text-muted">Be the first to join</span>
        )}
        <span className="tnum text-xs text-muted">
          <span className="font-bold text-ink">{activePoints}</span> {activePoints === 1 ? "point" : "points"} ·{" "}
          <span className="font-bold text-ink">{members.length}</span> {members.length === 1 ? "member" : "members"}
        </span>
      </div>

      <Link href={`/chords/${chord.id}`} className="absolute inset-0 rounded-2xl focus-visible:outline-none">
        <span className="sr-only">Open the {chord.name} chord</span>
      </Link>
    </article>
  );
}
