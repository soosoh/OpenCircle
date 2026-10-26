import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { CalendarCheck, MessagesSquare, Target } from "lucide-react";
import { AudienceFilter } from "@/components/chord/AudienceFilter";
import { CreatePointForm } from "@/components/chord/CreatePointForm";
import { MascotNote } from "@/components/chord/MascotNote";
import { MemberPanel } from "@/components/chord/MemberPanel";
import { BackLink, PageBand, StatRow, StatTile } from "@/components/surfaces/PageBand";
import { PillForm } from "@/components/chord/PillForm";
import { PillLink } from "@/components/chord/PillLink";
import { PointCard } from "@/components/point/PointCard";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { joinChord, createPoint } from "@/lib/api/actions";
import { getCurrentUser } from "@/lib/api/session";
import { getChord, listGoals, listPoints, listUsers } from "@/lib/database/repository";
import { audienceLabel, matchesAudience, parseAudience } from "@/lib/domain/audience";
import { formatDateTime } from "@/lib/domain/time";

// Reads the session, searchParams and "now": block on the server rather than
// claiming to be instant (same opt-out as app/dashboard/page.tsx).
export const instant = false;

export async function generateMetadata({ params }: PageProps<"/chords/[chordId]">) {
  const { chordId } = await params;
  const chord = await getChord(chordId);
  return { title: `${chord?.name ?? "Chord"} · StudyCircle` };
}

const CARD = "rounded-2xl border border-line bg-surface p-5";
const CARD_TITLE = "font-display text-lg font-bold tracking-tight text-ink";

export default async function ChordPage({ params, searchParams }: PageProps<"/chords/[chordId]">) {
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
      <PageBand
        crumb={<BackLink href="/chords">All chords</BackLink>}
        mark={
          <span
            className="flex size-12 shrink-0 items-center justify-center rounded-full border border-ink/15 font-display text-2xl font-bold text-white sm:size-14"
            style={{ backgroundColor: chord.color }}
            aria-hidden="true"
          >
            {chord.name[0]}
          </span>
        }
        title={chord.name}
        description={chord.description}
        meta={
          <>
            <Badge tone={chord.audience === "all" ? "muted" : "sun"} className="bg-surface">
              {audienceLabel(chord.audience)}
            </Badge>
            {isMember ? <Badge tone="mint">You&apos;re a member</Badge> : null}
          </>
        }
        actions={
          viewer ? (
            isMember ? (
              <PillLink href="#start-a-point">Start a point</PillLink>
            ) : (
              <PillForm action={joinChord.bind(null, chord.id)} pendingLabel="Joining…">
                Join this chord
              </PillForm>
            )
          ) : (
            <PillLink href="/login">Sign in to join</PillLink>
          )
        }
      >
        {/* Counts only: names stay behind chord membership (see MemberPanel below). */}
        <StatRow className="max-w-md">
          <StatTile value={chordMembers.length} label={chordMembers.length === 1 ? "member" : "members"} />
          <StatTile
            value={activePoints.length}
            label={activePoints.length === 1 ? "active point" : "active points"}
            delay={60}
          />
        </StatRow>
      </PageBand>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-8">
          <section aria-labelledby="points-heading" id="points" className="scroll-mt-24 space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
              <div>
                <h2 id="points-heading" className="font-display text-2xl font-bold tracking-tight text-ink">
                  Points
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted">
                  Weekly groups inside this chord. Each one has a moderator and a fixed meeting time.
                </p>
              </div>
              <AudienceFilter />
            </div>

            {chordPoints.length === 0 ? (
              <MascotNote
                mood="peek"
                color={chord.color}
                title="No points in this chord yet."
                hint="A point is a weekly group. A member can start the first one for this subject."
                action={
                  isMember ? (
                    <PillLink href="#start-a-point">Start a point</PillLink>
                  ) : undefined
                }
              />
            ) : visiblePoints.length === 0 ? (
              <MascotNote
                mood="peek"
                color={chord.color}
                title="No points match this filter."
                hint="Try all students, or start a point for this education level."
                action={
                  <PillLink href={`/chords/${chord.id}`} tone="outline">
                    Show all points
                  </PillLink>
                }
              />
            ) : (
              <div
                className={`grid gap-4 ${
                  visiblePoints.length > 1 ? "md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2" : ""
                }`}
              >
                {visiblePoints.map((point, index) => (
                  <div key={point.id} className="animate-fade-up" style={{ animationDelay: `${index * 60}ms` }}>
                    <PointCard
                      point={point}
                      chord={chord}
                      moderator={userById.get(point.moderatorId)}
                      memberCount={point.memberIds.length}
                      members={
                        isMember
                          ? point.memberIds.map((id) => userById.get(id)).filter((user) => user !== undefined)
                          : []
                      }
                      currentGoal={currentGoalOf(point.id)}
                      timeZone={timeZone}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>

          <section aria-labelledby="how-points-work" className="rounded-2xl bg-sun-wash p-5 sm:p-6">
            <h2 id="how-points-work" className="font-display text-xl font-bold tracking-tight text-ink">
              How a point works
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-ink">
              A point is one weekly hour with the same small group. Everyone sets goals, reports their own
              progress, and asks for help in the point chat.
            </p>
            <dl className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { icon: CalendarCheck, term: "Meet", text: "Show up at the same time each week." },
                { icon: Target, term: "Track", text: "Update your progress on the point's goals." },
                { icon: MessagesSquare, term: "Ask", text: "Use the point chat or ask for support." },
              ].map(({ icon: Icon, term, text }) => (
                <div key={term} className="rounded-xl bg-surface p-4">
                  <span
                    className="flex size-9 items-center justify-center rounded-full bg-mint text-white"
                    aria-hidden="true"
                  >
                    <Icon size={16} strokeWidth={2.25} />
                  </span>
                  <dt className="mt-3 font-display text-base font-bold text-ink">{term}</dt>
                  <dd className="mt-0.5 text-sm leading-6 text-ink">{text}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        <aside className="space-y-4">
          <MemberPanel count={chordMembers.length} users={isMember ? chordMembers : undefined} />

          <section aria-labelledby="moderators-heading" className={CARD}>
            <h2 id="moderators-heading" className={CARD_TITLE}>
              Point moderators
            </h2>
            <p className="mt-1 text-xs leading-5 text-muted">
              Each point has one moderator, chosen for subject fit, experience, and reliability.
            </p>
            {moderators.length === 0 ? (
              <p className="mt-3 text-sm text-ink">No point has a moderator yet.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {moderators.map(({ user, titles }) => (
                  <li key={user.id} className="flex gap-3">
                    <Avatar name={user.name} color={user.avatarColor} size={36} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink">{user.name}</p>
                      <p className="mt-0.5 text-xs leading-5 text-muted">
                        Runs {titles.slice(0, 2).join(" and ")}
                        {titles.length > 2 ? ` and ${titles.length - 2} more` : ""}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {openDeadlines.length > 0 ? (
            <section aria-labelledby="deadlines-heading" className={CARD}>
              <h2 id="deadlines-heading" className={CARD_TITLE}>
                Deadlines
              </h2>
              <ul className="mt-3 divide-y divide-line">
                {openDeadlines.slice(0, 6).map((goal) => (
                  <li key={goal.id} className="py-1 first:pt-0 last:pb-0">
                    <Link
                      href={`/points/${goal.pointId}`}
                      className="group block min-h-11 rounded-lg py-1.5 transition-colors hover:bg-sun-wash"
                    >
                      <p className="truncate text-sm font-semibold text-ink">{goal.title}</p>
                      <p className="mt-0.5 text-xs text-muted">{formatDateTime(goal.deadline, timeZone)}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {viewer ? (
            isMember ? (
              <section
                id="start-a-point"
                aria-labelledby="start-point-heading"
                className="scroll-mt-24 rounded-2xl border border-line bg-surface p-5"
              >
                <h2 id="start-point-heading" className={CARD_TITLE}>
                  Start a point
                </h2>
                <p className="mt-1 text-xs leading-5 text-muted">
                  Pick a weekly time. A moderator is chosen from the chord&apos;s members.
                </p>
                <div className="mt-4">
                  <CreatePointForm chordId={chord.id} chordAudience={chord.audience} action={createPoint} />
                </div>
              </section>
            ) : (
              <section aria-labelledby="start-point-heading" className={CARD}>
                <h2 id="start-point-heading" className={CARD_TITLE}>
                  Start a point
                </h2>
                <p className="mt-1 text-sm leading-6 text-ink">
                  Join this chord first, then you can start a weekly point of your own.
                </p>
              </section>
            )
          ) : (
            <section aria-labelledby="start-point-heading" className={CARD}>
              <h2 id="start-point-heading" className={CARD_TITLE}>
                Start a point
              </h2>
              <p className="mt-1 text-sm leading-6 text-ink">Sign in to start a weekly point in this chord.</p>
              <PillLink href="/login" tone="outline" className="mt-3">
                Sign in
              </PillLink>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
