import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { PointChat } from "@/components/chat/PointChat";
import { HelpRequestCard } from "@/components/point/HelpRequestCard";
import { ProgressUpdater } from "@/components/point/ProgressUpdater";
import { SOSButton } from "@/components/point/SOSButton";
import { SupportNotification } from "@/components/point/SupportNotification";
import { Calendar } from "@/components/schedule/Calendar";
import { GoalCard } from "@/components/schedule/GoalCard";
import { ActionForm } from "@/components/ui/ActionForm";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, EmptyState } from "@/components/ui/Card";
import { PointStatusBadge } from "@/components/ui/StatusBadge";
import { joinPoint, raiseSos, resolveHelpRequest, sendMessage, updateGoalProgress } from "@/lib/api/actions";
import { getCurrentUser } from "@/lib/api/session";
import { getChord, getPoint, listGoals, listHelpRequests, listMessages, listUsers } from "@/lib/database/repository";
import { audienceLabel, canJoinAudience } from "@/lib/domain/audience";
import { buildScheduleItems } from "@/lib/domain/schedule";
import { WEEKDAY_NAMES, formatDateTime, nextWeeklyOccurrence } from "@/lib/domain/time";

export async function generateMetadata({ params }: PageProps<"/points/[pointId]">) {
  const { pointId } = await params;
  const point = await getPoint(pointId);
  return { title: `${point?.title ?? "Point"} · StudyCircle` };
}

export default async function PointPage({ params }: PageProps<"/points/[pointId]">) {
  // The next occurrence is computed against "now"; the render is dynamic.
  await connection();
  const { pointId } = await params;
  const point = await getPoint(pointId);
  if (!point) notFound();

  const [chord, users, allGoals, messages, helpRequests, viewer] = await Promise.all([
    getChord(point.chordId),
    listUsers(),
    listGoals(),
    listMessages(),
    listHelpRequests(),
    getCurrentUser(),
  ]);

  const userById = new Map(users.map((user) => [user.id, user]));
  const timeZone = viewer?.timezone ?? "UTC";

  const memberIds = [...new Set([...point.memberIds, point.moderatorId])];
  const members = memberIds.map((id) => userById.get(id)).filter((user) => user !== undefined);
  const moderator = userById.get(point.moderatorId);

  const goals = allGoals.filter((goal) => goal.pointId === point.id);
  const pointMessages = messages
    .filter((message) => message.pointId === point.id)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  const pointRequests = helpRequests
    .filter((request) => request.pointId === point.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const openRequests = pointRequests.filter((request) => request.status === "open");

  const isMember = viewer !== null && memberIds.includes(viewer.id);
  const isModerator = viewer?.id === point.moderatorId;
  const joinCheck = viewer ? canJoinAudience(viewer, point.audience) : null;
  const next = nextWeeklyOccurrence(point.schedule);
  const meetingHref =
    point.meeting.provider === "zoom" && point.meeting.meetingUrl
      ? point.meeting.meetingUrl
      : `/points/${point.id}/meeting`;

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        {chord ? (
          <Link href={`/chords/${chord.id}`} className="text-sm text-muted hover:text-ink">
            ← {chord.name} Chord
          </Link>
        ) : null}

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">{point.title}</h1>
              <PointStatusBadge status={point.status} />
              {point.audience !== "all" ? <Badge tone="coral">{audienceLabel(point.audience)}</Badge> : null}
            </div>
            {point.description ? <p className="mt-1 max-w-2xl text-muted">{point.description}</p> : null}

            <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
              <div className="flex gap-1.5">
                <dt className="text-muted">Meets</dt>
                <dd className="font-medium">
                  {WEEKDAY_NAMES[point.schedule.weekday]} {point.schedule.time}
                </dd>
              </div>
              <div className="flex gap-1.5">
                <dt className="text-muted">Next</dt>
                <dd className="font-medium">{formatDateTime(next, timeZone)}</dd>
              </div>
              {moderator ? (
                <div className="flex items-center gap-1.5">
                  <dt className="text-muted">Moderator</dt>
                  <dd className="flex items-center gap-1.5 font-medium">
                    <Avatar name={moderator.name} color={moderator.avatarColor} size={20} />
                    {moderator.name}
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button href={meetingHref} variant="secondary">
              Join meeting
            </Button>
            {!viewer ? (
              <Button href="/login">Sign in</Button>
            ) : isMember ? (
              <Badge tone="mint">You&apos;re a member</Badge>
            ) : joinCheck?.ok ? (
              <ActionForm action={joinPoint.bind(null, point.id)}>Join point</ActionForm>
            ) : (
              <p className="max-w-60 text-sm text-coral">{joinCheck && !joinCheck.ok ? joinCheck.reason : ""}</p>
            )}
          </div>
        </div>
      </section>

      {isMember && openRequests.length > 0 ? (
        <div className="space-y-2">
          {openRequests.map((request) => (
            <SupportNotification
              key={request.id}
              request={request}
              user={userById.get(request.userId)}
              viewerId={viewer?.id}
            />
          ))}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
        <div className="space-y-6">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight">Goals</h2>
            {goals.length === 0 ? (
              <EmptyState
                title="No goals recorded yet"
                hint="Goals are set together at the end of each meeting and recorded by the moderator."
              />
            ) : (
              <div className="space-y-4">
                {goals.map((goal) => (
                  <div key={goal.id} className="space-y-2">
                    <GoalCard goal={goal} members={members} timeZone={timeZone} />
                    {isMember && viewer ? (
                      <ProgressUpdater
                        goal={goal}
                        userId={viewer.id}
                        action={updateGoalProgress.bind(null, goal.id)}
                      />
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </section>

          <PointChat
            messages={pointMessages}
            users={members}
            action={sendMessage.bind(null, point.id)}
            canPost={isMember}
          />

          {isMember ? (
            <SOSButton
              action={raiseSos.bind(null, point.id)}
              canRequest
              openRequests={openRequests.length}
            />
          ) : null}
        </div>

        <div className="space-y-4">
          <Card className="space-y-3">
            <h2 className="font-semibold tracking-tight">Meeting</h2>
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-muted">Provider</dt>
                <dd className="font-medium capitalize">{point.meeting.provider}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted">Meeting ID</dt>
                <dd className="font-mono text-xs">{point.meeting.meetingId}</dd>
              </div>
              {point.meeting.meetingPassword ? (
                <div className="flex justify-between gap-2">
                  <dt className="text-muted">Passcode</dt>
                  <dd className="font-mono text-xs">{point.meeting.meetingPassword}</dd>
                </div>
              ) : null}
            </dl>
            <Button href={meetingHref} className="w-full">
              Join meeting
            </Button>
          </Card>

          <Calendar items={buildScheduleItems([point], goals)} timeZone={timeZone} days={7} />

          <ChatSidebar
            participants={members.map((user) => ({
              id: user.id,
              name: user.name,
              avatarColor: user.avatarColor,
              educationLevel: user.educationLevel,
            }))}
            viewerId={viewer?.id}
            assignments={new Map(
              members.map((user) => [
                user.id,
                goals.flatMap((goal) => goal.assignments.filter((a) => a.userId === user.id)),
              ]),
            )}
          />

          {isMember && pointRequests.length > 0 ? (
            <Card>
              <h3 className="mb-3 font-semibold tracking-tight">Support requests</h3>
              <div className="space-y-3">
                {pointRequests.map((request) => (
                  <HelpRequestCard
                    key={request.id}
                    request={request}
                    user={userById.get(request.userId)}
                    timeZone={timeZone}
                    action={isModerator ? resolveHelpRequest.bind(null, request.id) : undefined}
                  />
                ))}
              </div>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
