import { notFound } from "next/navigation";
import { connection } from "next/server";
import { CalendarClock, Clock } from "lucide-react";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { LockedChat } from "@/components/chat/LockedChat";
import { PointChat } from "@/components/chat/PointChat";
import { SupportChat } from "@/components/chat/SupportChat";
import { MascotNote } from "@/components/chord/MascotNote";
import { BackLink, PageBand } from "@/components/chord/PageBand";
import { PillForm } from "@/components/chord/PillForm";
import { PillLink } from "@/components/chord/PillLink";
import { HelpRequestCard } from "@/components/point/HelpRequestCard";
import { PointGoalCard } from "@/components/point/PointGoalCard";
import { ProgressUpdater } from "@/components/point/ProgressUpdater";
import { SOSButton } from "@/components/point/SOSButton";
import { SupportNotification } from "@/components/point/SupportNotification";
import { Avatar, AvatarStack } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { PointStatusBadge } from "@/components/ui/StatusBadge";
import {
  joinPoint,
  raiseSos,
  resolveHelpRequest,
  sendMessage,
  sendPrivateMessage,
  updateGoalProgress,
} from "@/lib/api/actions";
import { getCurrentUser } from "@/lib/api/session";
import {
  getChord,
  getPoint,
  listGoals,
  listHelpRequests,
  listMessages,
  listPrivateMessages,
  listUsers,
} from "@/lib/database/repository";
import { audienceLabel, canJoinAudience } from "@/lib/domain/audience";
import { WEEKDAY_NAMES, formatDateTime, formatTime, nextWeeklyOccurrence } from "@/lib/domain/time";

// Reads the session and "now" on every request: block on the server rather than
// claiming to be instant (same opt-out as app/dashboard/page.tsx).
export const instant = false;

export async function generateMetadata({ params }: PageProps<"/points/[pointId]">) {
  const { pointId } = await params;
  const point = await getPoint(pointId);
  return { title: `${point?.title ?? "Point"} · StudyCircle` };
}

const CARD = "rounded-2xl border border-line bg-surface p-5";
const CARD_TITLE = "font-display text-lg font-bold tracking-tight text-ink";

export default async function PointPage({ params }: PageProps<"/points/[pointId]">) {
  // The next occurrence is computed against "now"; the render is dynamic.
  await connection();
  const { pointId } = await params;
  const point = await getPoint(pointId);
  if (!point) notFound();

  const [chord, users, allGoals, viewer] = await Promise.all([
    getChord(point.chordId),
    listUsers(),
    listGoals(),
    getCurrentUser(),
  ]);

  const userById = new Map(users.map((user) => [user.id, user]));
  const timeZone = viewer?.timezone ?? "UTC";

  const memberIds = [...new Set([...point.memberIds, point.moderatorId])];
  const memberCount = memberIds.length;
  const moderator = userById.get(point.moderatorId);

  const isMember = viewer !== null && memberIds.includes(viewer.id);
  const isModerator = viewer?.id === point.moderatorId;
  const joinCheck = viewer ? canJoinAudience(viewer, point.audience) : null;
  const goals = allGoals.filter((goal) => goal.pointId === point.id);

  // Member-only data (chat, member list, progress, help requests, private thread) is
  // fetched and built only for members, so a visitor's response never carries it.
  const members = isMember ? memberIds.map((id) => userById.get(id)).filter((user) => user !== undefined) : [];
  const [allMessages, allRequests, allPrivate] = isMember
    ? await Promise.all([
        listMessages(),
        listHelpRequests(),
        !isModerator ? listPrivateMessages() : Promise.resolve([]),
      ])
    : [[], [], []];
  const pointMessages = allMessages
    .filter((message) => message.pointId === point.id)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  const pointRequests = allRequests
    .filter((request) => request.pointId === point.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const openRequests = pointRequests.filter((request) => request.status === "open");
  const privateThread =
    viewer && moderator && isMember && !isModerator
      ? allPrivate
          .filter(
            (message) =>
              message.pointId === point.id &&
              ((message.senderId === viewer.id && message.recipientId === moderator.id) ||
                (message.senderId === moderator.id && message.recipientId === viewer.id)),
          )
          .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
      : [];

  const next = nextWeeklyOccurrence(point.schedule);
  const scheduleZone = point.schedule.timezone.split("/").pop()?.replaceAll("_", " ") ?? point.schedule.timezone;
  const isZoom = point.meeting.provider === "zoom" && Boolean(point.meeting.meetingUrl);
  // Only built for members: visitors get no meeting link, not even the in-app room path.
  const meetingHref = !isMember
    ? undefined
    : point.meeting.provider === "zoom" && point.meeting.meetingUrl
      ? point.meeting.meetingUrl
      : `/points/${point.id}/meeting`;
  const externalProps = isZoom ? { target: "_blank", rel: "noopener noreferrer" } : {};
  const joinPrompt = !viewer ? (
    <PillLink href="/login">Sign in to join</PillLink>
  ) : joinCheck?.ok ? (
    <PillForm action={joinPoint.bind(null, point.id)} pendingLabel="Joining…">
      Join this point
    </PillForm>
  ) : null;

  return (
    <div className="space-y-8">
      <PageBand
        crumb={chord ? <BackLink href={`/chords/${chord.id}`}>{chord.name} chord</BackLink> : undefined}
        title={point.title}
        description={point.description}
        meta={
          <>
            <PointStatusBadge status={point.status} />
            <Badge tone={point.audience === "all" ? "muted" : "sun"} className="bg-surface">
              {audienceLabel(point.audience)}
            </Badge>
            <span className="tnum rounded-full bg-surface px-2.5 py-0.5 text-xs font-semibold text-ink">
              {memberCount} {memberCount === 1 ? "member" : "members"}
            </span>
            {isMember ? <Badge tone="mint">You&apos;re a member</Badge> : null}
          </>
        }
        actions={
          isMember ? (
            <PillLink href="#chat">Open point chat</PillLink>
          ) : joinPrompt ? (
            <>
              {joinPrompt}
              <p className="basis-full text-sm text-ink">
                {viewer ? "Join to see the chat and track goals." : "Members chat and track goals together."}
              </p>
            </>
          ) : (
            <p className="max-w-xs rounded-xl bg-surface px-4 py-3 text-sm leading-6 text-coral-ink">
              {joinCheck && !joinCheck.ok ? joinCheck.reason : ""}
            </p>
          )
        }
      >
        <section aria-label="Schedule and membership" className="overflow-hidden rounded-2xl bg-surface">
          <div className="grid gap-5 p-5 lg:grid-cols-3 lg:gap-0 lg:divide-x lg:divide-line">
            <div className="flex items-start gap-3 lg:pr-5">
              <span
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-mint text-white"
                aria-hidden="true"
              >
                <Clock size={18} strokeWidth={2.25} />
              </span>
              <div className="min-w-0">
                <p className="text-xs text-muted">Meets</p>
                <p className="mt-0.5 font-display text-xl font-bold leading-tight tracking-tight text-ink">
                  {WEEKDAY_NAMES[point.schedule.weekday]} · {formatTime(point.schedule.time, point.schedule.timezone)}
                </p>
                <p className="mt-0.5 text-xs text-muted">Repeats weekly · {scheduleZone} time</p>
              </div>
            </div>
            <div className="flex items-start gap-3 lg:px-5">
              <span
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sage text-mint"
                aria-hidden="true"
              >
                <CalendarClock size={18} strokeWidth={2.25} />
              </span>
              <div className="min-w-0">
                <p className="text-xs text-muted">Next session</p>
                <p className="mt-0.5 text-base font-bold leading-snug text-ink">{formatDateTime(next, timeZone)}</p>
                <p className="mt-0.5 text-xs text-muted">In your timezone</p>
              </div>
            </div>
            {moderator ? (
              <div className="flex items-start gap-3 lg:pl-5">
                <Avatar name={moderator.name} color={moderator.avatarColor} size={40} />
                <div className="min-w-0">
                  <p className="text-xs text-muted">Moderator</p>
                  <p className="mt-0.5 text-base font-bold leading-snug text-ink">{moderator.name}</p>
                  <p className="mt-0.5 text-xs text-muted">Runs this point</p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-sun-wash px-5 py-3">
            <div className="flex min-w-0 items-center gap-2.5">
              {members.length > 0 ? <AvatarStack people={members} size={28} /> : null}
              <span className="text-sm text-ink">
                {isMember
                  ? "The people you meet every week"
                  : `${memberCount} ${memberCount === 1 ? "person meets" : "people meet"} here every week`}
              </span>
            </div>
            {meetingHref ? (
              <PillLink href={meetingHref} {...externalProps}>
                {isZoom ? "Join on Zoom" : "Visit meeting room"}
              </PillLink>
            ) : null}
          </div>
        </section>
      </PageBand>

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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="min-w-0 space-y-8">
          <section aria-labelledby="goals-heading" id="goals" className="scroll-mt-24 space-y-4">
            <div>
              <h2 id="goals-heading" className="font-display text-2xl font-bold tracking-tight text-ink">
                Goals
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted">
                {moderator ? `Recorded by ${moderator.name}.` : "Set together at the end of each meeting."}
              </p>
            </div>
            {goals.length === 0 ? (
              <MascotNote
                mood="peek"
                color={chord?.color}
                title="No goals recorded yet."
                hint="Goals are set together at the end of each meeting and recorded by the moderator."
                action={
                  <PillLink href="#chat" tone="outline">
                    Talk it through in chat
                  </PillLink>
                }
              />
            ) : !isMember ? (
              <ul className="divide-y divide-line rounded-2xl border border-line bg-surface">
                {goals.map((goal) => (
                  <li key={goal.id} className="px-5 py-3.5">
                    <p className="font-display text-base font-bold leading-tight tracking-tight text-ink">
                      {goal.title}
                    </p>
                    <p className="mt-1 text-xs text-muted">Due {formatDateTime(goal.deadline, timeZone)}</p>
                  </li>
                ))}
              </ul>
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
            {isMember ? (
              <PointChat
                messages={pointMessages}
                users={members}
                action={sendMessage.bind(null, point.id)}
                canPost
                viewerId={viewer?.id}
              />
            ) : (
              <LockedChat action={joinPrompt} />
            )}
          </div>

          {viewer && moderator && isMember && !isModerator ? (
            <section aria-labelledby="private-thread-heading" className="space-y-3">
              <div>
                <h2
                  id="private-thread-heading"
                  className="font-display text-xl font-bold tracking-tight text-ink"
                >
                  Private thread with {moderator.name}
                </h2>
                <p className="mt-0.5 text-sm text-muted">
                  Only you and your moderator can see this. Your moderator starts the thread; you can reply.
                </p>
              </div>
              <SupportChat
                thread={privateThread}
                other={moderator}
                viewerId={viewer.id}
                action={sendPrivateMessage.bind(null, point.id)}
                canStart={false}
                recipientId={moderator.id}
                defaultOpen
              />
            </section>
          ) : null}

          {isMember ? (
            <SOSButton action={raiseSos.bind(null, point.id)} canRequest openRequests={openRequests.length} />
          ) : null}
        </div>

        <aside className="space-y-4">
          <section aria-labelledby="session-details-heading" className={`${CARD} space-y-3`}>
            <h2 id="session-details-heading" className={CARD_TITLE}>
              Session details
            </h2>
            <dl className="space-y-2 text-sm">
              <div className="flex items-baseline justify-between gap-2">
                <dt className="text-muted">Room</dt>
                <dd className="font-semibold text-ink">{isZoom ? "Zoom" : "Demo room"}</dd>
              </div>
              {isMember ? (
                <>
                  <div className="flex items-baseline justify-between gap-2">
                    <dt className="text-muted">Room ID</dt>
                    <dd className="rounded-md bg-mist px-1.5 py-0.5 font-mono text-xs text-ink">
                      {point.meeting.meetingId}
                    </dd>
                  </div>
                  {point.meeting.meetingPassword ? (
                    <div className="flex items-baseline justify-between gap-2">
                      <dt className="text-muted">Passcode</dt>
                      <dd className="rounded-md bg-mist px-1.5 py-0.5 font-mono text-xs text-ink">
                        {point.meeting.meetingPassword}
                      </dd>
                    </div>
                  ) : null}
                </>
              ) : null}
              <div className="flex items-baseline justify-between gap-2">
                <dt className="text-muted">Schedule</dt>
                <dd className="text-right font-semibold text-ink">Weekly</dd>
              </div>
            </dl>
            {meetingHref ? (
              <PillLink href={meetingHref} tone="outline" className="w-full justify-start" {...externalProps}>
                {isZoom ? "Join on Zoom" : "Open meeting room"}
              </PillLink>
            ) : (
              <p className="text-xs leading-5 text-muted">The room details are shared with members.</p>
            )}
          </section>

          {isMember ? (
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
          ) : null}

          {isMember && pointRequests.length > 0 ? (
            <section aria-labelledby="support-requests-heading" className={CARD}>
              <div className="flex items-center justify-between gap-2 border-b border-line pb-3">
                <h2 id="support-requests-heading" className={CARD_TITLE}>
                  Support requests
                </h2>
                <span className="tnum rounded-full bg-mist px-2.5 py-0.5 text-xs font-bold text-ink">
                  {pointRequests.length}
                </span>
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
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
