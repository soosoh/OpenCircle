import { connection } from "next/server";
import { AudienceFilter } from "@/components/chord/AudienceFilter";
import { ChordCard } from "@/components/chord/ChordCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Card";
import { listChords, listPoints, listUsers } from "@/lib/database/repository";
import { matchesAudience } from "@/lib/domain/audience";
import type { Audience } from "@/types";

export const metadata = { title: "Chords · StudyCircle" };

const AUDIENCE_HEADING: Record<Audience, string> = {
  all: "All subjects",
  "high-school": "For high school students",
  college: "For college students",
};

export default async function ChordsPage({ searchParams }: PageProps<"/chords">) {
  // The audience filter reads searchParams; the render is explicitly dynamic.
  await connection();
  const params = await searchParams;
  const raw = typeof params.audience === "string" ? params.audience : null;
  const audience: Audience = raw === "high-school" || raw === "college" ? raw : "all";

  const [chords, points, users] = await Promise.all([listChords(), listPoints(), listUsers()]);
  const userById = new Map(users.map((user) => [user.id, user]));

  const visible = chords.filter((chord) => matchesAudience(chord.audience, audience));
  const counts: Record<Audience, number> = {
    all: chords.length,
    "high-school": chords.filter((c) => matchesAudience(c.audience, "high-school")).length,
    college: chords.filter((c) => matchesAudience(c.audience, "college")).length,
  };

  return (
    <div className="space-y-8">
      <header className="max-w-2xl">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">Chords</h1>
        <p className="mt-2 text-[15px] leading-7 text-muted">
          A chord is a subject community. Join one to find its points — the small groups that meet every week.
        </p>
      </header>

      <section aria-labelledby="chord-directory-heading" className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
          <div>
            <h2 id="chord-directory-heading" className="font-display text-lg font-bold tracking-tight text-ink">
              {AUDIENCE_HEADING[audience]}
            </h2>
            <p className="tnum mt-1 text-sm text-muted">
              {visible.length} {visible.length === 1 ? "chord" : "chords"} · {points.length} points across the
              circle
            </p>
          </div>
          <AudienceFilter counts={counts} />
        </div>

        {visible.length === 0 ? (
          <EmptyState
            title="No chords match this level"
            hint="Every chord is open unless it is marked for one education level. Try all students to see the full circle."
            action={
              <Button href="/chords" variant="secondary" size="sm" className="min-h-10">
                Show all chords
              </Button>
            }
          />
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {visible.map((chord, index) => (
              <li key={chord.id} className={index < 2 ? "lg:col-span-3" : "lg:col-span-2"}>
                <ChordCard
                  chord={chord}
                  members={chord.memberIds
                    .map((id) => userById.get(id))
                    .filter((user) => user !== undefined)}
                  activePoints={points.filter((p) => p.chordId === chord.id && p.status !== "Paused").length}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
