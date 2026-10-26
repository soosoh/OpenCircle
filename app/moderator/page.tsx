import Link from "next/link";
import { Mascot } from "@/components/landing/mascot";
import { BandPill, PageBand, Stage, StatRow, StatTile } from "@/components/surfaces/PageBand";
import { AssistantPanel } from "@/components/assistant/AssistantPanel";
import { RiskPanel } from "@/components/assistant/RiskPanel";
import { ModeratorPanel } from "@/components/moderator/ModeratorPanel";
import { UserCard } from "@/components/moderator/UserCard";
import { SupportChat } from "@/components/chat/SupportChat";
import { Button } from "@/components/ui/Button";
import { FEATURES } from "@/config/features";
import {
  analyzePointStudents,
  createGoal,
  resolveHelpRequest,
  runMeetingAssistant,
  sendPrivateMessage,
  updateGoalProgress,
} from "@/lib/api/actions";
import { requireUser } from "@/lib/api/session";
import {
  listChords,
  listGoals,
  listHelpRequests,
  listPoints,
  listPrivateMessages,
  listUsers,
} from "@/lib/database/repository";
import { AUDIENCE_OPTIONS, matchesUserAudience, parseAudience } from "@/lib/domain/audience";

export const metadata = { title: "Moderate · StudyCircle" };

// The page reads searchParams and the session, so it blocks on the server instead of
// pretending to be instant (same opt-out as app/dashboard/page.tsx).
export const instant = false;

export default async function ModeratorPage({ searchParams }: PageProps<"/moderator">) {
  const viewer = await requireUser();
  const params = await searchParams;
  const audience = parseAudience(typeof params.audience === "string" ? params.audience : null);

  const [chords, points, goals, users, helpRequests, privateMessages] = await Promise.all([
    listChords(),
    listPoints(),
    listGoals(),
    listUsers(),
    listHelpRequests(),
    listPrivateMessages(),
  ]);

  const userById = new Map(users.map((user) => [user.id, user]));
  const chordById = new Map(chords.map((chord) => [chord.id, chord]));
  const moderated = points.filter((point) => point.moderatorId === viewer.id);

  const entries = moderated.map((point) => {
    const memberIds = [...new Set([...point.memberIds, point.moderatorId])];
    const members = memberIds.map((id) => userById.get(id)).filter((user) => user !== undefined);
    const pointGoals = goals.filter((goal) => goal.pointId === point.id);
    const pointRequests = helpRequests
      .filter((request) => request.pointId === point.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const lastGoal = pointGoals[0];
    const openRequests = pointRequests.filter((request) => request.status === "open");
    const hint = [
      lastGoal ? `Last goal: ${lastGoal.title}` : null,
      openRequests.length > 0 ? `${openRequests.length} open support request${openRequests.length === 1 ? "" : "s"}` : null,
    ]
      .filter((part) => part !== null)
      .join(" · ");

    return {
      point,
      chordName: chordById.get(point.chordId)?.name ?? "Chord",
      members,
      goals: pointGoals,
      helpRequests: pointRequests,
      assistant: (
        <div className="grid gap-4 lg:grid-cols-2">
          <AssistantPanel
            pointId={point.id}
            action={runMeetingAssistant.bind(null, point.id)}
            recordGoalAction={createGoal.bind(null, point.id)}
            hint={hint}
          />
          <RiskPanel pointId={point.id} action={analyzePointStudents.bind(null, point.id)} />
        </div>
      ),
    };
  });

  // Threads grouped per moderated point.
  const threads = moderated.map((point) => {
    const members = [...new Set([...point.memberIds, point.moderatorId])].filter((id) => id !== viewer.id);
    return {
      point,
      students: members
        .map((id) => userById.get(id))
        .filter((user) => user !== undefined)
        .map((student) => ({
          student,
          thread: privateMessages
            .filter(
              (message) =>
                message.pointId === point.id &&
                ((message.senderId === viewer.id && message.recipientId === student.id) ||
                  (message.senderId === student.id && message.recipientId === viewer.id)),
            )
            .sort((a, b) => a.timestamp.localeCompare(b.timestamp)),
        })),
    };
  });

  const memberSearch = users.filter((user) => matchesUserAudience(user, audience) && user.id !== viewer.id);
  const moderatedMemberIds = new Set(moderated.flatMap((point) => [...point.memberIds, point.moderatorId]));
  const openRequestCount = helpRequests.filter(
    (request) => request.status === "open" && moderated.some((point) => point.id === request.pointId),
  ).length;

  const filterHref = (value: string) => (value === "all" ? "/moderator" : `/moderator?audience=${value}`);

  return (
    <>
      <PageBand
        title="Moderator dashboard"
        description="Record goals, watch progress, and give one-on-one support. Every action here is checked against the points you actually moderate."
        meta={<BandPill>{FEATURES.ENABLE_AI_MODERATOR ? "AI moderator on" : "Human moderators only"}</BandPill>}
        aside={<Mascot mood="wink" color="#C4462A" width={132} height={132} className="animate-float" />}
      >
        {moderated.length > 0 ? (
          <StatRow>
            <StatTile value={moderated.length} label={moderated.length === 1 ? "point you moderate" : "points you moderate"} />
            <StatTile value={moderatedMemberIds.size} label={moderatedMemberIds.size === 1 ? "member" : "members"} delay={60} />
            <StatTile
              value={openRequestCount}
              label={openRequestCount === 1 ? "open support request" : "open support requests"}
              delay={120}
            />
          </StatRow>
        ) : null}
      </PageBand>

      <Stage>
        {moderated.length === 0 ? (
          <section
            aria-labelledby="no-point"
            className="flex flex-col items-center rounded-2xl border border-line bg-surface px-6 py-10 text-center sm:py-14"
          >
            <Mascot mood="happy" color="#2E7D5B" width={80} height={80} />
            <h2 id="no-point" className="mt-4 font-display text-3xl font-bold tracking-tight text-ink">
              You don&rsquo;t moderate a point yet
            </h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-ink">
              Goal recording, member progress, resources and one-to-one messages appear only on points you
              moderate. Points created in a chord you moderate show up here; creators moderate by default.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button href="/chords" variant="ink" size="md" className="min-h-11">
                Browse chords
              </Button>
              <Button href="/dashboard" variant="secondary" size="md" className="min-h-11">
                Back to dashboard
              </Button>
            </div>
          </section>
        ) : (
          <ModeratorPanel
            entries={entries.map((entry) => ({
              ...entry,
              requesters: new Map(
                entry.helpRequests
                  .map((request) => {
                    const user = userById.get(request.userId);
                    return user ? ([request.userId, user] as const) : null;
                  })
                  .filter((pair): pair is readonly [string, (typeof users)[number]] => pair !== null),
              ),
            }))}
            timeZone={viewer.timezone}
            createGoalAction={createGoal}
            updateProgressAction={updateGoalProgress}
            resolveAction={resolveHelpRequest}
          />
        )}

        {threads.some((thread) => thread.students.length > 0) ? (
          <section aria-labelledby="one-on-one" className="space-y-4">
            <div>
              <h2 id="one-on-one" className="font-display text-2xl font-bold tracking-tight text-ink">
                One-on-one support
              </h2>
              <p className="mt-1 text-sm text-muted">
                Private threads with the members of your points. Replies show on their point page.
              </p>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {threads.flatMap((thread) =>
                thread.students.map(({ student, thread: messages }) => (
                  <SupportChat
                    key={`${thread.point.id}-${student.id}`}
                    thread={messages}
                    other={student}
                    viewerId={viewer.id}
                    action={sendPrivateMessage.bind(null, thread.point.id)}
                    canStart
                    recipientId={student.id}
                  />
                )),
              )}
            </div>
          </section>
        ) : null}

        {/* The directory lists every member, so it is only for people who moderate a point. */}
        {moderated.length > 0 ? (
        <section aria-labelledby="find-student" className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="find-student" className="font-display text-2xl font-bold tracking-tight text-ink">
                Find a student
              </h2>
              <p className="mt-1 text-sm text-muted">
                Filter by education level, using the same age rule as chords and points.
              </p>
            </div>
            <nav aria-label="Education level" className="flex gap-1 rounded-full border border-line bg-surface p-1">
              {AUDIENCE_OPTIONS.map((option) => (
                <Link
                  key={option.value}
                  href={filterHref(option.value)}
                  aria-current={audience === option.value ? "page" : undefined}
                  className={`inline-flex min-h-10 items-center rounded-full px-3.5 text-sm font-semibold transition-colors sm:px-4 ${
                    audience === option.value ? "bg-ink text-white" : "text-ink hover:bg-sun-wash"
                  }`}
                >
                  {option.label}
                </Link>
              ))}
            </nav>
          </div>
          {memberSearch.length === 0 ? (
            <div className="flex items-center gap-3 rounded-2xl border border-dashed border-ink/25 bg-sun-wash px-5 py-6">
              <Mascot mood="happy" color="#2E7D5B" width={48} height={48} />
              <div>
                <p className="font-display text-lg font-bold text-ink">No students match this filter</p>
                <p className="text-sm text-ink">Try a different education level.</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {memberSearch.map((user) => (
                <UserCard key={user.id} user={user} detail={`${user.educationLevel} · ${user.gradeLevel}`} />
              ))}
            </div>
          )}
          <p className="text-xs leading-relaxed text-muted">
            {chords.length} chords in the circle. Moderators are chosen from subject familiarity, experience,
            group success, and community reputation.
          </p>
        </section>
        ) : null}
      </Stage>
    </>
  );
}
