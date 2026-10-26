import { connection } from "next/server";
import { AudienceFilter } from "@/components/chord/AudienceFilter";
import { ChordCard } from "@/components/chord/ChordCard";
import { MascotNote } from "@/components/chord/MascotNote";
import { PageBand, StatRow, StatTile } from "@/components/chord/PageBand";
import { PillLink } from "@/components/chord/PillLink";
import { Mascot } from "@/components/landing/mascot";
import { SpeechBubble } from "@/components/landing/mockups";
import { getCurrentUser } from "@/lib/api/session";
import { listChords, listPoints, listUsers } from "@/lib/database/repository";
import { matchesAudience } from "@/lib/domain/audience";
import type { Audience } from "@/types";

export const metadata = { title: "Chords · StudyCircle" };

// The audience filter reads searchParams and the page reads the session, so this
// route blocks on the server instead of pretending to be instant (same opt-out
// as app/dashboard/page.tsx).
export const instant = false;

const AUDIENCE_HEADING: Record<Audience, string> = {
  all: "All subjects",
  "high-school": "For high school students",
  college: "For college students",
};

export default async function ChordsPage({ searchParams }: PageProps<"/chords">) {
  await connection();
  const params = await searchParams;
  const raw = typeof params.audience === "string" ? params.audience : null;
  const audience: Audience = raw === "high-school" || raw === "college" ? raw : "all";

  const [chords, points, users, viewer] = await Promise.all([
    listChords(),
    listPoints(),
    listUsers(),
    getCurrentUser(),
  ]);
  const userById = new Map(users.map((user) => [user.id, user]));

  const visible = chords.filter((chord) => matchesAudience(chord.audience, audience));
  const counts: Record<Audience, number> = {
    all: chords.length,
    "high-school": chords.filter((c) => matchesAudience(c.audience, "high-school")).length,
    college: chords.filter((c) => matchesAudience(c.audience, "college")).length,
  };
  const joinedCount = viewer ? chords.filter((chord) => chord.memberIds.includes(viewer.id)).length : 0;

  return (
    <div className="space-y-8">
      <PageBand
        title="Chords"
        description="Subjects are chords inside the circle. Join one to find its points, the small groups that meet every week."
        actions={
          viewer ? (
            <PillLink href="/dashboard">Your dashboard</PillLink>
          ) : (
            <PillLink href="/login">Sign in to join</PillLink>
          )
        }
        decor={
          <>
            <SpeechBubble
              side="left"
              className="mb-8"
              title={
                joinedCount > 0
                  ? `You are in ${joinedCount} ${joinedCount === 1 ? "chord" : "chords"}.`
                  : "Pick a subject, then find a point."
              }
            />
            <Mascot mood="cheer" color="#2E7D5B" className="size-20 animate-bob" width={80} height={80} />
          </>
        }
      >
        <StatRow>
          <StatTile value={chords.length} label={chords.length === 1 ? "chord" : "chords"} />
          <StatTile value={points.length} label={points.length === 1 ? "point" : "points"} delay={60} />
          <StatTile value={users.length} label={users.length === 1 ? "student" : "students"} delay={120} />
        </StatRow>
      </PageBand>

      <section aria-labelledby="chord-directory-heading" id="directory" className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <div>
            <h2
              id="chord-directory-heading"
              className="font-display text-2xl font-bold tracking-tight text-ink"
            >
              {AUDIENCE_HEADING[audience]}
            </h2>
            <p className="tnum mt-1 text-sm text-muted">
              Showing {visible.length} of {chords.length} {chords.length === 1 ? "chord" : "chords"}
            </p>
          </div>
          <AudienceFilter counts={counts} />
        </div>

        {visible.length === 0 ? (
          <MascotNote
            mood="peek"
            title="No chords match this level."
            hint="Every chord is open unless it is marked for one education level. Try all students to see the full circle."
            action={
              <PillLink href="/chords" tone="ink">
                Show all chords
              </PillLink>
            }
          />
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((chord, index) => (
              <li
                key={chord.id}
                className="animate-fade-up"
                style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
              >
                <ChordCard
                  chord={chord}
                  joined={viewer ? chord.memberIds.includes(viewer.id) : false}
                  members={chord.memberIds
                    .map((id) => userById.get(id))
                    .filter((user) => user !== undefined)}
                  activePoints={points.filter((p) => p.chordId === chord.id && p.status !== "Paused").length}
                />
              </li>
            ))}
            {visible.length % 3 === 2 ? (
              <li className="hidden lg:block" aria-hidden="true">
                <div className="flex h-full flex-col items-center justify-center gap-3 rounded-2xl bg-sun-wash p-6 text-center">
                  <Mascot mood="peek" color="#2E7D5B" className="size-16 animate-bob" width={64} height={64} />
                  <p className="font-display text-base font-bold leading-snug text-ink">
                    Join one, then find the point that meets when you actually can.
                  </p>
                </div>
              </li>
            ) : null}
          </ul>
        )}
      </section>
    </div>
  );
}
