import Link from "next/link";
import { connection } from "next/server";
import { PointCard } from "@/components/point/PointCard";
import { Calendar } from "@/components/schedule/Calendar";
import { DeadlineCard } from "@/components/schedule/DeadlineCard";
import { ScheduleEvent } from "@/components/schedule/ScheduleEvent";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { EmptyState, SectionHeading } from "@/components/ui/Card";import { requireUser } from "@/lib/api/session";
import { listChords, listGoals, listHelpRequests, listPoints, listUsers } from "@/lib/database/repository";
import { buildScheduleItems } from "@/lib/domain/schedule";
import { nextWeeklyOccurrence } from "@/lib/domain/time";

export const metadata = { title: "Dashboard · StudyCircle" };

export default async function DashboardPage() {
  await connection();
  const viewer = await requireUser();

  const [chords, points, goals, users, helpRequests] = await Promise.all([
    listChords(),
    listPoints(),
    listGoals(),
    listUsers(),
    listHelpRequests(),
  ]);

  const userById = new Map(users.map((user) => [user.id, user]));
  const chordById = new Map(chords.map((chord) => [chord.id, chord]));

  const myChords = chords.filter((chord) => chord.memberIds.includes(viewer.id));
  const myPoints = points.filter(
    (point) => point.memberIds.includes(viewer.id) || point.moderatorId === viewer.id,
  );
  const myGoals = goals.filter((goal) => goal.assignments.some((a) => a.userId === viewer.id));
  const myOpenGoals = myGoals.filter((goal) => goal.status !== "Completed");
  const myHelpRequests = helpRequests.filter(
    (request) => (request.userId === viewer.id || myPoints.some((p) => p.id === request.pointId)) && request.status === "open",
  );

  const upcoming = [...myPoints]
    .map((point) => ({ point, next: nextWeeklyOccurrence(point.schedule) }))
    .sort((a, b) => a.next.getTime() - b.next.getTime());

  const scheduleItems = buildScheduleItems(myPoints, myGoals).slice(0, 8);

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-center gap-4">
        <Avatar name={viewer.name} color={viewer.avatarColor} size={56} />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome, {viewer.name.split(" ")[0]}</h1>
          <p className="text-sm text-muted">
            {viewer.educationLevel} · {viewer.gradeLevel} · {viewer.experienceLevel}
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          {myHelpRequests.length > 0 ? <Badge tone="coral">{myHelpRequests.length} open support requests</Badge> : null}
          <Badge tone="brand">{myGoals.length} goals</Badge>
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeading
          title="Your chords"
          action={
            <Link href="/chords" className="text-sm font-medium text-brand hover:underline">
              Find more →
            </Link>
          }
        />
        {myChords.length === 0 ? (
          <EmptyState
            title="You haven't joined a chord yet"
            hint="Chords are subjects. Join one to find its points."
            action={
              <Link href="/chords" className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white">
                Browse chords
              </Link>
            }
          />
        ) : (
          <ul className="flex flex-wrap gap-2">
            {myChords.map((chord) => (
              <li key={chord.id}>
                <Link
                  href={`/chords/${chord.id}`}
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm font-medium transition-colors hover:border-brand/40"
                >
                  <span className="size-2 rounded-full" style={{ backgroundColor: chord.color }} />
                  {chord.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <SectionHeading title="Your points" hint="Groups you belong to, soonest meeting first." />
        {upcoming.length === 0 ? (
          <EmptyState title="No points yet" hint="Join a point from a chord to get a weekly group." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.slice(0, 6).map(({ point }) => {
              const chord = chordById.get(point.chordId);
              if (!chord) return null;
              return (
                <PointCard
                  key={point.id}
                  point={point}
                  chord={chord}
                  moderator={userById.get(point.moderatorId)}
                  members={point.memberIds.map((id) => userById.get(id)).filter((user) => user !== undefined)}
                  currentGoal={myGoals.find((g) => g.pointId === point.id && g.status !== "Completed")?.title}
                  timeZone={viewer.timezone}
                />
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <SectionHeading title="Current goals" />
        {myOpenGoals.length === 0 ? (
          <EmptyState title="No active goals" hint="Goals appear here once your group records them." />
        ) : (
          <div className="space-y-2">
            {myOpenGoals.map((goal) => (
              <DeadlineCard
                key={goal.id}
                title={goal.title}
                at={goal.deadline}
                timeZone={viewer.timezone}
                href={`/points/${goal.pointId}`}
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <SectionHeading title="Your schedule" hint="Meetings and deadlines in your timezone." />
        <Calendar items={scheduleItems} timeZone={viewer.timezone} days={14} />
      </section>

      {scheduleItems.length > 0 ? (
        <section className="space-y-3">
          <SectionHeading title="Next up" />
          <ul className="space-y-2">
            {scheduleItems.slice(0, 5).map((item) => (
              <li key={item.id}>
                <ScheduleEvent item={item} timeZone={viewer.timezone} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
