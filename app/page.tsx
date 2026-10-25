import Link from "next/link";
import { StudyCircle } from "@/components/circle/StudyCircle";
import { ChordCard } from "@/components/chord/ChordCard";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { TasteHeading } from "@/components/ui/Surface";
import { listChords, listPoints, listUsers } from "@/lib/database/repository";
import { parseAudience } from "@/lib/domain/audience";

export const instant = false;

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const audience = parseAudience(typeof params.audience === "string" ? params.audience : null);

  const [chords, points, users] = await Promise.all([listChords(), listPoints(), listUsers()]);

  const visibleChords = audience === "all" ? chords : chords.filter((chord) => chord.audience === "all" || chord.audience === audience);
  const userById = new Map(users.map((user) => [user.id, user]));
  const activePoints = (chordId: string) => points.filter((p) => p.chordId === chordId && p.status !== "Paused").length;

  return (
    <div className="space-y-20 md:space-y-28">
      {/* Hero — editorial / taste */}
      <section className="enter-anim relative space-y-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 px-4 py-1.5 text-xs font-medium tracking-wide text-muted shadow-[0_1px_2px_rgba(10,10,10,0.04)]">
          <span className="h-1.5 w-1.5 rounded-full bg-mint animate-pulse" />
          {chords.length} chords · {points.length} points
        </div>
        <div className="mx-auto max-w-4xl space-y-6">
          <TasteHeading level={1} className="mx-auto leading-[0.95]">
            Study with people<br />
            <span className="italic text-brand">who notice</span> when you fall behind.
          </TasteHeading>
          <p className="mx-auto max-w-2xl text-lg sm:text-xl leading-relaxed text-muted font-[family-name:var(--font-body)]">
            Each subject is a <span className="text-ink font-medium">chord</span> inside the circle. Inside each chord are points: small weekly groups that meet, review goals, and help each other finish what they start.
          </p>
        </div>
        <div className="flex justify-center gap-3 pt-2">
          <Link
            href="/login"
            className="rounded-full bg-brand px-7 py-3 text-sm font-medium text-white shadow-[0_4px_14px_rgba(200,122,61,0.3)] transition-all hover:bg-[#b96d32] hover:shadow-[0_8px_24px_rgba(200,122,61,0.4)] hover:-translate-y-0.5"
          >
            Join the circle
          </Link>
          <Link
            href="/chords"
            className="rounded-full border border-line bg-surface px-7 py-3 text-sm font-medium text-ink transition-all hover:border-brand/40 hover:-translate-y-0.5 hover:shadow-[0_4px_14px_rgba(10,10,10,0.06)]"
          >
            Browse chords
          </Link>
        </div>
      </section>

      {/* StudyCircle visualization */}
      <section className="enter-anim space-y-4">
        <StudyCircle
          items={visibleChords.map((chord) => ({
            chord,
            href: `/chords/${chord.id}${audience === "all" ? "" : `?audience=${audience}`}`,
          }))}
        />
        <p className="text-center text-sm text-muted font-[family-name:var(--font-body)]">
          Every chord is a subject. Click one to open its community and find a point to join.
        </p>
      </section>

      {/* All chords grid — impeccable spacing */}
      <section className="enter-anim space-y-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight">All chords</h2>
            <p className="text-sm text-muted mt-1">Subjects with active study groups</p>
          </div>
          <Link href="/chords" className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium text-ink transition-all hover:border-brand/40 hover:-translate-y-px">
            See all →
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* Process — editorial cards */}
      <section className="enter-anim">
        <Card className="!bg-surface border-line/60 shadow-[0_1px_3px_rgba(10,10,10,0.05)]">
          <div className="mb-6 flex items-center gap-3">
            <span className="inline-flex size-10 items-center justify-center rounded-full bg-ink text-paper font-[family-name:var(--font-display)] text-xl shadow-sm">◈</span>
            <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-tight">How a week works</h2>
          </div>
          <ol className="grid gap-6 sm:grid-cols-3">
            {[
              { title: "Review last goals", body: "Say what you finished, what you struggled with, and where you need help." },
              { title: "Set next goals", body: "Agree on one or two concrete objectives for the coming week." },
              { title: "Show up", body: "The moderator records goals and checks in. Progress is visible to everyone." },
            ].map((step, i) => (
              <li key={step.title} className="rounded-xl bg-paper p-6 border border-line/40 shadow-[0_1px_2px_rgba(10,10,10,0.03)] hover:shadow-[0_4px_12px_rgba(10,10,10,0.05)] hover:-translate-y-0.5 transition-all duration-300">
                <span className="font-[family-name:var(--font-display)] text-4xl text-brand/20 leading-none">0{i + 1}</span>
                <h3 className="font-[family-name:var(--font-display)] text-xl mt-3 tracking-tight">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted font-[family-name:var(--font-body)]">{step.body}</p>
              </li>
            ))}
          </ol>
        </Card>
      </section>
    </div>
  );
}
