import { connection } from "next/server";
import { AudienceFilter } from "@/components/chord/AudienceFilter";
import { ChordCard } from "@/components/chord/ChordCard";
import { SectionHeading } from "@/components/ui/Card";
import { listChords, listPoints, listUsers } from "@/lib/database/repository";
import { matchesAudience } from "@/lib/domain/audience";
import type { Audience } from "@/types";

export const metadata = { title: "Chords · StudyCircle" };

export default async function ChordsPage({ searchParams }: PageProps<"/chords">) {
  // The audience filter reads searchParams; the render is explicitly dynamic.
  await connection();
  const params = await searchParams;
  const raw = typeof params.audience === "string" ? params.audience : null;
  const audience = raw === "high-school" || raw === "college" ? raw : "all";

  const [chords, points, users] = await Promise.all([listChords(), listPoints(), listUsers()]);
  const userById = new Map(users.map((user) => [user.id, user]));

  const visible = chords.filter((chord) => matchesAudience(chord.audience, audience));
  const counts: Record<Audience, number> = {
    all: chords.length,
    "high-school": chords.filter((c) => matchesAudience(c.audience, "high-school")).length,
    college: chords.filter((c) => matchesAudience(c.audience, "college")).length,
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Chords"
        hint="Subjects are chords inside the circle. Enter one to find its points."
        action={<AudienceFilter counts={counts} />}
      />

      {visible.length === 0 ? (
        <p className="py-12 text-center text-muted">No chords match this filter.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((chord) => (
            <ChordCard
              key={chord.id}
              chord={chord}
              members={chord.memberIds.map((id) => userById.get(id)).filter((user) => user !== undefined)}
              activePoints={points.filter((p) => p.chordId === chord.id && p.status !== "Paused").length}
            />
          ))}
        </div>
      )}
    </div>
  );
}
