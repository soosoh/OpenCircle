import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { PointChat } from "@/components/chat/PointChat";
import { HelpRequestCard } from "@/components/point/HelpRequestCard";
import { PointGoalCard } from "@/components/point/PointGoalCard";
import { ProgressUpdater } from "@/components/point/ProgressUpdater";
import { SOSButton } from "@/components/point/SOSButton";
import { SupportNotification } from "@/components/point/SupportNotification";
import { ActionForm } from "@/components/ui/ActionForm";
import { Avatar, AvatarStack } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, EmptyState } from "@/components/ui/Card";
import { PointStatusBadge } from "@/components/ui/StatusBadge";
import { joinPoint, raiseSos, resolveHelpRequest, sendMessage, updateGoalProgress } from "@/lib/api/actions";
import { getCurrentUser } from "@/lib/api/session";
import { getChord, getPoint, listGoals, listHelpRequests, listMessages, listUsers } from "@/lib/database/repository";
import { audienceLabel, canJoinAudience } from "@/lib/domain/audience";
import { WEEKDAY_NAMES, formatDateTime, formatTime, nextWeeklyOccurrence } from "@/lib/domain/time";

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
  const scheduleZone = point.schedule.timezone.split("/").pop()?.replaceAll("_", " ") ?? point.schedule.timezone;
  const isZoom = point.meeting.provider === "zoom" && Boolean(point.meeting.meetingUrl);
  const meetingHref =
    point.meeting.provider === "zoom" && point.meeting.meetingUrl
      ? point.meeting.meetingUrl
      : `/points/${point.id}/meeting`;

  return (
    <div className="space-y-8">
      <div className="space-y-5">
        {chord ? (
          <Link
            href={`/chords/${chord.id}`}
            className="inline-flex min-h-10 items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
          >
            <span aria-hidden="true">←</span> {chord.name} chord
          </Link>
        ) : null}

        <header className="flex flex-wrap items-start justify-between gap-5">
          <div className="min-w-0 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">{point.title}</h1>
              <PointStatusBadge status={point.status} />
            </div>
            <p className="mt-2 text-[15px] leading-7 text-muted">{point.description}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Badge tone={point.audience === "all" ? "muted" : "sun"}>{audienceLabel(point.audience)}</Badge>
              <span className="tnum text-sm text-muted">
                {members.length} {members.length === 1 ? "member" : "members"}
              </span>
            </div>
          </div>

          <div className="flex max-w-xs flex-col gap-2 sm:items-end">
            <p className="text-xs text-muted">
              {isMember
                ? "You're a member of this point."
                : viewer
                  ? "Join to see the chat and track goals."
                  : "Members chat and track goals together."}
            </p>
            {!viewer ? (
              <Button href="/login">Sign in to join</Button>
            ) : isMember ? (
              <Button href="#chat">Open point chat</Button>
            ) : joinCheck?.ok ? (
              <ActionForm action={joinPoint.bind(null, point.id)} pendingLabel="Joining…">
                Join this point
              </ActionForm>
            ) : (
              <p className="text-left text-sm leading-6 text-coral sm:text-right">
                {joinCheck && !joinCheck.ok ? joinCheck.reason : ""}
              </p>
            )}
          </div>
        </header>

        <section
          aria-label="Schedule and membership"
          className="overflow-hidden rounded-2xl border border-line bg-surface"
        >
          <div className="grid gap-5 p-5 sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted">Meets</p>
              <p className="mt-1 font-display text-xl font-bold tracking-tight text-ink">
                {WEEKDAY_NAMES[point.schedule.weekday]} · {formatTime(point.schedule.time, point.schedule.timezone)}
              </p>
              <p className="mt-0.5 text-xs text-muted">
                Repeats weekly · {scheduleZone} time
              </p>
            </div>
            <div>
              <p className="text-xs text-muted">Next session</p>
              <p className="mt-1 text-sm font-medium text-ink">{formatDateTime(next, timeZone)}</p>
              <p className="mt-0.5 text-xs text-muted">In your timezone</p>
            </div>
            {moderator ? (
              <div>
                <p className="text-xs text-muted">Moderator</p>
                <p className="mt-1 flex items-center gap-2 text-sm font-medium text-ink">
                  <Avatar name={moderator.name} color={moderator.avatarColor} size={24} />
                  {moderator.name}
                </p>
                <p className="mt-0.5 text-xs text-muted">Runs this point</p>
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3">
            <div className="flex min-w-0 items-center gap-2.5">
              {members.length > 0 ? <AvatarStack people={members} size={24} /> : null}
              <span className="text-xs text-muted">The people you meet every week</span>
            </div>
            <Button
              href={meetingHref}
              variant="secondary"
              size="sm"
              className="min-h-10"
              {...(isZoom ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              {isZoom ? "Join on Zoom" : "Visit meeting room"}
            </Button>
          </div>
        </section>
      </div>

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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0 space-y-8">
          <section aria-labelledby="goals-heading" id="goals" className="scroll-mt-24 space-y-4">
            <div>
              <h2 id="goals-heading" className="font-display text-xl font-bold tracking-tight text-ink">
                Goals
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted">
                {moderator ? `Recorded by ${moderator.name}.` : "Set together at the end of each meeting."}
              </p>
            </div>
            {goals.length === 0 ? (
              <EmptyState
                title="No goals recorded yet"
                hint="Goals are set together at the end of each meeting and recorded by the moderator."
                action={
                  <Button href="#chat" variant="secondary" size="sm" className="min-h-10">
                    Talk it through in chat
                  </Button>
                }
              />
            ) : (
              <div className="space-y-4">
                {goals.map((goal) => (
                  <PointGoalCard
                    key={goal.id}
                    goal={goal}
                    members={members}
                    viewerId={viewer?.id}
                    timeZone={timeZone}
                    footer={
                      isMember && viewer ? (
                        <ProgressUpdater
                          goal={goal}
                          userId={viewer.id}
                          action={updateGoalProgress.bind(null, goal.id)}
                        />
                      ) : undefined
                    }
                  />
                ))}
              </div>
            )}
          </section>

          <div id="chat" className="scroll-mt-24">
            <PointChat
              messages={pointMessages}
              users={members}
              action={sendMessage.bind(null, point.id)}
              canPost={isMember}
              viewerId={viewer?.id}
            />
          </div>

          {isMember ? (
            <SOSButton action={raiseSos.bind(null, point.id)} canRequest openRequests={openRequests.length} />
          ) : null}
        </div>

        <aside className="space-y-4">
          <Card className="space-y-3">
            <h2 className="font-display text-base font-bold tracking-tight text-ink">Session details</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex items-baseline justify-between gap-2">
                <dt className="text-muted">Room</dt>
                <dd className="font-medium text-ink">{isZoom ? "Zoom" : "Demo room"}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <dt className="text-muted">Room ID</dt>
                <dd className="font-mono text-xs text-ink">{point.meeting.meetingId}</dd>
              </div>
              {point.meeting.meetingPassword ? (
                <div className="flex items-baseline justify-between gap-2">
                  <dt className="text-muted">Passcode</dt>
                  <dd className="font-mono text-xs text-ink">{point.meeting.meetingPassword}</dd>
                </div>
              ) : null}
              <div className="flex items-baseline justify-between gap-2">
                <dt className="text-muted">Schedule</dt>
                <dd className="text-right font-medium text-ink">Weekly</dd>
              </div>
            </dl>
            <Button
              href={meetingHref}
              variant="secondary"
              size="sm"
              className="w-full min-h-10"
              {...(isZoom ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              {isZoom ? "Join on Zoom" : "Open meeting room"}
            </Button>
          </Card>

          <ChatSidebar
            participants={members.map((user) => ({
              id: user.id,
              name: user.name,
              avatarColor: user.avatarColor,
              educationLevel: user.educationLevel,
            }))}
            viewerId={viewer?.id}
            assignments={
              new Map(
                members.map((user) => [
                  user.id,
                  goals.flatMap((goal) => goal.assignments.filter((a) => a.userId === user.id)),
                ]),
              )
            }
          />

          {isMember && pointRequests.length > 0 ? (
            <Card>
              <div className="flex items-baseline justify-between gap-2 border-b border-line pb-3">
                <h2 className="font-display text-base font-bold tracking-tight text-ink">Support requests</h2>
                <span className="tnum text-xs text-muted">{pointRequests.length}</span>
              </div>
              <div className="mt-3 space-y-3">
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
        </aside>
      </div>
    </div>
  );
}
