import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { AudienceFilter } from "@/components/chord/AudienceFilter";
import { CreatePointForm } from "@/components/chord/CreatePointForm";
import { MemberPanel } from "@/components/chord/MemberPanel";
import { PointCard } from "@/components/point/PointCard";
import { Calendar } from "@/components/schedule/Calendar";
import { ActionForm } from "@/components/ui/ActionForm";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, EmptyState } from "@/components/ui/Card";
import { joinChord, createPoint } from "@/lib/api/actions";
import { getCurrentUser } from "@/lib/api/session";
import { getChord, listGoals, listPoints, listUsers } from "@/lib/database/repository";
import { matchesAudience, parseAudience } from "@/lib/domain/audience";
import { buildScheduleItems } from "@/lib/domain/schedule";
import { nextWeeklyOccurrence } from "@/lib/domain/time";

export async function generateMetadata({ params }: PageProps<"/chords/[chordId]">) {
  const { chordId } = await params;
  const chord = await getChord(chordId);
  return { title: `${chord?.name ?? "Chord"} · StudyCircle` };
}

export default async function ChordPage({ params, searchParams }: PageProps<"/chords/[chordId]">) {
  // Upcoming meetings are computed against "now"; the render is dynamic.
  await connection();
  const { chordId } = await params;
  const query = await searchParams;
  const audience = parseAudience(typeof query.audience === "string" ? query.audience : null);

  const chord = await getChord(chordId);
  if (!chord) notFound();

  const [allPoints, allGoals, users, viewer] = await Promise.all([
    listPoints(),
    listGoals(),
    listUsers(),
    getCurrentUser(),
  ]);

  const userById = new Map(users.map((user) => [user.id, user]));
  const chordPoints = allPoints.filter((point) => point.chordId === chord.id);
  const visiblePoints = chordPoints.filter((point) => matchesAudience(point.audience, audience));
  const chordGoals = allGoals.filter((goal) => chordPoints.some((point) => point.id === goal.pointId));
  const chordMembers = chord.memberIds.map((id) => userById.get(id)).filter((user) => user !== undefined);
  const isMember = viewer ? chord.memberIds.includes(viewer.id) : false;
  const timeZone = viewer?.timezone ?? "UTC";

  const upcoming = chordPoints
    .map((point) => ({ point, next: nextWeeklyOccurrence(point.schedule) }))
    .sort((a, b) => a.next.getTime() - b.next.getTime())
    .slice(0, 3);

  const currentGoalOf = (pointId: string) => {
    const goal = allGoals.find((g) => g.pointId === pointId && g.status !== "Completed");
    return goal?.title;
  };

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <Link href="/chords" className="text-sm text-muted hover:text-ink">
          ← All chords
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: chord.color }} />
              <h1 className="text-2xl font-semibold tracking-tight">{chord.name} Chord</h1>
            </div>
            <p className="mt-1 max-w-2xl text-muted">{chord.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone="brand">{chordMembers.length} members</Badge>
              <Badge tone="muted">{chordPoints.filter((p) => p.status !== "Paused").length} active points</Badge>
              <Badge tone="muted">{upcoming.length} upcoming meetings</Badge>
            </div>
          </div>

          {viewer ? (
            isMember ? (
              <Badge tone="mint">You&apos;re a member</Badge>
            ) : (
              <ActionForm action={joinChord.bind(null, chord.id)}>
                Join this chord
              </ActionForm>
            )
          ) : (
            <Button href="/login">Sign in to join</Button>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Chord schedule</h2>
        <Calendar items={buildScheduleItems(chordPoints, chordGoals)} timeZone={timeZone} days={7} />
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight">Upcoming meetings</h2>
        </div>
        {upcoming.length === 0 ? (
          <EmptyState title="No meetings scheduled yet" hint="Create the first point for this subject." />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-3">
            {upcoming.map(({ point, next }) => (
              <li key={point.id}>
                <Link href={`/points/${point.id}`} className="block">
                  <Card interactive>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted">
                      {next.toLocaleDateString("en-US", { weekday: "long", timeZone })}
                    </p>
                    <p className="mt-1 font-medium">{point.title}</p>
                    <p className="text-sm text-muted">{point.schedule.time}</p>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight">Points</h2>
          <AudienceFilter />
        </div>
        {visiblePoints.length === 0 ? (
          <EmptyState title="No points match this filter" hint="Try a different education level filter." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visiblePoints.map((point) => (
              <PointCard
                key={point.id}
                point={point}
                chord={chord}
                moderator={userById.get(point.moderatorId)}
                members={point.memberIds.map((id) => userById.get(id)).filter((user) => user !== undefined)}
                currentGoal={currentGoalOf(point.id)}
                timeZone={timeZone}
              />
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        <MemberPanel users={chordMembers} goals={chordGoals} timeZone={timeZone} />

        <div className="space-y-4">
          {viewer ? (
            <Card>
              <h2 className="mb-3 font-semibold tracking-tight">Start a point</h2>
              <CreatePointForm chordId={chord.id} chordAudience={chord.audience} action={createPoint} />
            </Card>
          ) : (
            <EmptyState title="Sign in to start a point" hint="Any student can create a weekly group in this chord." />
          )}

          {chordGoals.length > 0 ? (
            <Card>
              <h2 className="mb-3 font-semibold tracking-tight">Deadlines</h2>
              <ul className="space-y-2 text-sm">
                {chordGoals
                  .filter((goal) => goal.status !== "Completed")
                  .slice(0, 6)
                  .map((goal) => (
                    <li key={goal.id} className="flex items-start justify-between gap-2">
                      <Link href={`/points/${goal.pointId}`} className="truncate hover:text-brand">
                        {goal.title}
                      </Link>
                      <span className="shrink-0 text-muted">{goal.status}</span>
                    </li>
                  ))}
              </ul>
            </Card>
          ) : null}
        </div>
      </section>
    </div>
  );
}
