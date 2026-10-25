import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { AudienceFilter } from "@/components/chord/AudienceFilter";
import { CreatePointForm } from "@/components/chord/CreatePointForm";
import { MemberPanel } from "@/components/chord/MemberPanel";
import { PointCard } from "@/components/point/PointCard";
import { ActionForm } from "@/components/ui/ActionForm";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, EmptyState } from "@/components/ui/Card";
import { joinChord, createPoint } from "@/lib/api/actions";
import { getCurrentUser } from "@/lib/api/session";
import { getChord, listGoals, listPoints, listUsers } from "@/lib/database/repository";
import { audienceLabel, matchesAudience, parseAudience } from "@/lib/domain/audience";
import { formatDateTime } from "@/lib/domain/time";

export async function generateMetadata({ params }: PageProps<"/chords/[chordId]">) {
  const { chordId } = await params;
  const chord = await getChord(chordId);
  return { title: `${chord?.name ?? "Chord"} · StudyCircle` };
}

export default async function ChordPage({ params, searchParams }: PageProps<"/chords/[chordId]">) {
  // Deadlines are rendered in "now"; the render is dynamic.
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

  const activePoints = chordPoints.filter((point) => point.status !== "Paused");
  const openDeadlines = chordGoals
    .filter((goal) => goal.status !== "Completed")
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  const moderators = [...new Set(chordPoints.map((point) => point.moderatorId))]
    .map((id) => {
      const user = userById.get(id);
      if (!user) return null;
      const titles = chordPoints.filter((point) => point.moderatorId === id).map((point) => point.title);
      return { user, titles };
    })
    .filter((entry) => entry !== null);

  const currentGoalOf = (pointId: string) =>
    allGoals.find((goal) => goal.pointId === pointId && goal.status !== "Completed")?.title;

  return (
    <div className="space-y-8">
      <Link
        href="/chords"
        className="inline-flex min-h-10 items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
      >
        <span aria-hidden="true">←</span> All chords
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-5">
        <div className="max-w-2xl min-w-0">
          <div className="flex items-center gap-2.5">
            <span
              className="size-3 shrink-0 rounded-full"
              style={{ backgroundColor: chord.color }}
              aria-hidden="true"
            />
            <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">{chord.name}</h1>
          </div>
          <p className="mt-2 text-[15px] leading-7 text-muted">{chord.description}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Badge tone={chord.audience === "all" ? "muted" : "sun"}>{audienceLabel(chord.audience)}</Badge>
            <p className="tnum text-sm text-muted">
              {chordMembers.length} {chordMembers.length === 1 ? "member" : "members"} · {activePoints.length}{" "}
              active {activePoints.length === 1 ? "point" : "points"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isMember ? <Badge tone="mint">You&apos;re a member</Badge> : null}
          {viewer ? (
            isMember ? (
              <Button href="#start-a-point">Start a point</Button>
            ) : (
              <ActionForm action={joinChord.bind(null, chord.id)} pendingLabel="Joining…">
                Join this chord
              </ActionForm>
            )
          ) : (
            <Button href="/login">Sign in to join</Button>
          )}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-6">
          <section aria-labelledby="points-heading" id="points" className="scroll-mt-24 space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 id="points-heading" className="font-display text-xl font-bold tracking-tight text-ink">
                  Points
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted">
                  Weekly groups inside this chord. Each one has a moderator and a fixed meeting time.
                </p>
              </div>
              <AudienceFilter />
            </div>

            {chordPoints.length === 0 ? (
              <EmptyState
                title="No points in this chord yet"
                hint="A point is a weekly group. A member can start the first one for this subject."
                action={
                  isMember ? (
                    <Button href="#start-a-point" size="sm" className="min-h-10">
                      Start a point
                    </Button>
                  ) : undefined
                }
              />
            ) : visiblePoints.length === 0 ? (
              <EmptyState
                title="No points match this filter"
                hint="Try all students, or start a point for this education level."
                action={
                  <Button href={`/chords/${chord.id}`} variant="secondary" size="sm" className="min-h-10">
                    Show all points
                  </Button>
                }
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {visiblePoints.map((point) => (
                  <PointCard
                    key={point.id}
                    point={point}
                    chord={chord}
                    moderator={userById.get(point.moderatorId)}
                    members={point.memberIds
                      .map((id) => userById.get(id))
                      .filter((user) => user !== undefined)}
                    currentGoal={currentGoalOf(point.id)}
                    timeZone={timeZone}
                  />
                ))}
              </div>
            )}
          </section>

          <section aria-labelledby="how-points-work" className="rounded-2xl border border-line bg-sun-wash p-5">
            <h2 id="how-points-work" className="font-display text-base font-bold tracking-tight text-ink">
              How a point works
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-ink/70">
              A point is one weekly hour with the same small group. Everyone sets goals, reports their own
              progress, and asks for help in the point chat.
            </p>
            <dl className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-[13px] font-semibold text-ink">Meet</dt>
                <dd className="mt-0.5 text-xs leading-5 text-muted">Show up at the same time each week.</dd>
              </div>
              <div>
                <dt className="text-[13px] font-semibold text-ink">Track</dt>
                <dd className="mt-0.5 text-xs leading-5 text-muted">Update your progress on the point&apos;s goals.</dd>
              </div>
              <div>
                <dt className="text-[13px] font-semibold text-ink">Ask</dt>
                <dd className="mt-0.5 text-xs leading-5 text-muted">Use the point chat or ask for support.</dd>
              </div>
            </dl>
          </section>
        </div>

        <aside className="space-y-4">
          <MemberPanel users={chordMembers} goals={chordGoals} />

          <Card>
            <h2 className="font-display text-base font-bold tracking-tight text-ink">Point moderators</h2>
            <p className="mt-1 text-xs leading-5 text-muted">
              Each point has one moderator, chosen for subject fit, experience, and reliability.
            </p>
            {moderators.length === 0 ? (
              <p className="mt-3 text-sm text-muted">No point has a moderator yet.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {moderators.map(({ user, titles }) => (
                  <li key={user.id} className="flex gap-3">
                    <Avatar name={user.name} color={user.avatarColor} size={32} />
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-ink">{user.name}</p>
                      <p className="mt-0.5 text-xs leading-5 text-muted">
                        Runs {titles.slice(0, 2).join(" and ")}
                        {titles.length > 2 ? ` and ${titles.length - 2} more` : ""}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {openDeadlines.length > 0 ? (
            <Card>
              <h2 className="font-display text-base font-bold tracking-tight text-ink">Deadlines</h2>
              <ul className="mt-3 divide-y divide-line">
                {openDeadlines.slice(0, 6).map((goal) => (
                  <li key={goal.id} className="py-2.5 first:pt-0 last:pb-0">
                    <Link href={`/points/${goal.pointId}`} className="group block min-h-10">
                      <p className="truncate text-[13px] font-medium text-ink group-hover:underline">
                        {goal.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">{formatDateTime(goal.deadline, timeZone)}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          {viewer ? (
            isMember ? (
              <div id="start-a-point" className="scroll-mt-24">
                <Card>
                  <h2 className="font-display text-base font-bold tracking-tight text-ink">Start a point</h2>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    Pick a weekly time. A moderator is chosen from the chord&apos;s members.
                  </p>
                  <div className="mt-4">
                    <CreatePointForm chordId={chord.id} chordAudience={chord.audience} action={createPoint} />
                  </div>
                </Card>
              </div>
            ) : (
              <Card>
                <h2 className="font-display text-base font-bold tracking-tight text-ink">Start a point</h2>
                <p className="mt-1 text-sm leading-6 text-muted">
                  Join this chord first, then you can start a weekly point of your own.
                </p>
              </Card>
            )
          ) : (
            <Card>
              <h2 className="font-display text-base font-bold tracking-tight text-ink">Start a point</h2>
              <p className="mt-1 text-sm leading-6 text-muted">
                Sign in to start a weekly point in this chord.
              </p>
              <Button href="/login" variant="secondary" size="sm" className="mt-3 min-h-10">
                Sign in
              </Button>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
