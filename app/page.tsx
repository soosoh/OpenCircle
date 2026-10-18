import Link from "next/link";
import { StudyCircle } from "@/components/circle/StudyCircle";
import { ChordCard } from "@/components/chord/ChordCard";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { listChords, listPoints, listUsers } from "@/lib/database/repository";
import { parseAudience } from "@/lib/domain/audience";

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const audience = parseAudience(typeof params.audience === "string" ? params.audience : null);

  const [chords, points, users] = await Promise.all([listChords(), listPoints(), listUsers()]);

  const visibleChords = audience === "all" ? chords : chords.filter((chord) => chord.audience === "all" || chord.audience === audience);
  const userById = new Map(users.map((user) => [user.id, user]));
  const activePoints = (chordId: string) => points.filter((p) => p.chordId === chordId && p.status !== "Paused").length;

  return (
    <div className="space-y-12">
      <section className="animate-fade-up space-y-4 text-center">
        <Badge tone="brand">{chords.length} chords · {points.length} points</Badge>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Study with people who notice when you fall behind.
        </h1>
        <p className="mx-auto max-w-xl text-muted">
          Each subject is a chord inside the circle. Inside each chord are points: small weekly groups that
          meet, review goals, and help each other finish what they start.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link
            href="/login"
            className="rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#3f38c9]"
          >
            Join the circle
          </Link>
          <Link
            href="/chords"
            className="rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-medium transition-colors hover:border-brand/40"
          >
            Browse chords
          </Link>
        </div>
      </section>

      <section>
        <StudyCircle
          items={visibleChords.map((chord) => ({
            chord,
            href: `/chords/${chord.id}${audience === "all" ? "" : `?audience=${audience}`}`,
          }))}
        />
        <p className="mt-6 text-center text-sm text-muted">
          Every chord is a subject. Click one to open its community and find a point to join.
        </p>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">All chords</h2>
          <Link href="/chords" className="text-sm font-medium text-brand hover:underline">
            See all →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {chords.map((chord) => (
            <ChordCard
              key={chord.id}
              chord={chord}
              members={chord.memberIds.map((id) => userById.get(id)).filter((u) => u !== undefined)}
              activePoints={activePoints(chord.id)}
            />
          ))}
        </div>
      </section>

      <Card>
        <h2 className="text-lg font-semibold tracking-tight">How a week works</h2>
        <ol className="mt-4 grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "1. Review last goals",
              body: "Say what you finished, what you struggled with, and where you need help.",
            },
            {
              title: "2. Set next goals",
              body: "Agree on one or two concrete objectives for the coming week.",
            },
            {
              title: "3. Show up",
              body: "The moderator records goals and checks in. Progress is visible to everyone.",
            },
          ].map((step) => (
            <li key={step.title} className="rounded-xl bg-paper p-4">
              <p className="font-medium">{step.title}</p>
              <p className="mt-1 text-sm text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
