import { AssistantPanel } from "@/components/assistant/AssistantPanel";
import { RiskPanel } from "@/components/assistant/RiskPanel";
import { ModeratorPanel } from "@/components/moderator/ModeratorPanel";
import { UserCard } from "@/components/moderator/UserCard";
import { SupportChat } from "@/components/chat/SupportChat";
import { Badge } from "@/components/ui/Badge";
import { EmptyState, SectionHeading } from "@/components/ui/Card";
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
import { matchesUserAudience, parseAudience } from "@/lib/domain/audience";

export const metadata = { title: "Moderate · StudyCircle" };

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

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Moderator dashboard</h1>
          {FEATURES.ENABLE_AI_MODERATOR ? <Badge tone="brand">AI moderator on</Badge> : <Badge tone="muted">Human moderators only</Badge>}
        </div>
        <p className="max-w-2xl text-muted">
          Record goals, watch progress, and give one-on-one support. Every action here is checked against
          the points you actually moderate.
        </p>
      </section>

      {moderated.length === 0 ? (
        <EmptyState
          title="You do not moderate any points"
          hint="Points created in a chord you moderate will appear here. Creators moderate by default."
        />
      ) : null}

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

      {threads.some((thread) => thread.students.length > 0) ? (
        <section className="space-y-4">
          <SectionHeading
            title="One-on-one support"
            hint="Private messages. Members see replies on their point page."
          />
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

      <section className="space-y-3">
        <SectionHeading title="Find a student" hint="Searchable by education level, using the same age filter as chords and points." />
        {memberSearch.length === 0 ? (
          <p className="text-sm text-muted">No students match this filter.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {memberSearch.map((user) => (
              <UserCard key={user.id} user={user} detail={`${user.educationLevel} · ${user.gradeLevel}`} />
            ))}
          </div>
        )}
        <p className="text-xs text-muted">
          {chords.length} chords in the circle. Moderators are chosen from subject familiarity, experience,
          group success, and community reputation.
        </p>
      </section>
    </div>
  );
}
