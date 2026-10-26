import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { MascotNote } from "@/components/chord/MascotNote";
import { BackLink, PageBand } from "@/components/chord/PageBand";
import { PillLink } from "@/components/chord/PillLink";
import { MeetingTranscriptPanel } from "@/components/point/MeetingTranscriptPanel";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { getCurrentUser } from "@/lib/api/session";
import { getChord, getPoint, listUsers } from "@/lib/database/repository";
import { WEEKDAY_NAMES, formatTime } from "@/lib/domain/time";

export const metadata = { title: "Meeting Room · StudyCircle" };

// The room chrome reads the session: block on the server rather than claiming
// to be instant (same opt-out as app/dashboard/page.tsx).
export const instant = false;

const CARD = "rounded-2xl border border-line bg-surface p-5";
const CARD_TITLE = "font-display text-lg font-bold tracking-tight text-ink";

/**
 * Meeting room for a point. With ENABLE_ZOOM_API false (or when Zoom creation failed),
 * this is the built-in demo room and no external calls happen here. With Zoom enabled,
 * participants join via the stored Zoom link; the transcript controls work for either provider.
 */
export default async function MeetingPage({ params }: PageProps<"/points/[pointId]/meeting">) {
  await connection();
  const { pointId } = await params;
  const point = await getPoint(pointId);
  if (!point) notFound();

  const viewer = await getCurrentUser();
  const isRoomMember = viewer !== null && (viewer.id === point.moderatorId || point.memberIds.includes(viewer.id));
  if (!isRoomMember) {
    // Room ID, passcode, Zoom link and the member list are for members only: nothing
    // below is read, let alone sent, for anyone else.
    return (
      <PageBand
        crumb={<BackLink href={`/points/${point.id}`}>{point.title}</BackLink>}
        title="Meeting room"
        description="Join this point to enter its meeting room."
        actions={
          <>
            <PillLink href={`/points/${point.id}`}>Back to the point</PillLink>
            {viewer ? null : (
              <PillLink href="/login" tone="outline">
                Sign in
              </PillLink>
            )}
          </>
        }
      />
    );
  }

  const [users, chord] = await Promise.all([listUsers(), getChord(point.chordId)]);
  const userById = new Map(users.map((user) => [user.id, user]));
  const memberIds = [...new Set([...point.memberIds, point.moderatorId])];
  const members = memberIds.map((id) => userById.get(id)).filter((user) => user !== undefined);
  const isModerator = viewer?.id === point.moderatorId;
  const isZoom = point.meeting.provider === "zoom";
  const zone = point.schedule.timezone.split("/").pop()?.replaceAll("_", " ") ?? point.schedule.timezone;

  return (
    <div className="space-y-8">
      <PageBand
        crumb={<BackLink href={`/points/${point.id}`}>{point.title}</BackLink>}
        title="Meeting room"
        description={`${point.title} · ${WEEKDAY_NAMES[point.schedule.weekday]} at ${formatTime(
          point.schedule.time,
          point.schedule.timezone,
        )} (${zone} time) · repeats weekly`}
        meta={<Badge tone={isZoom ? "mint" : "sun"} className={isZoom ? "" : "bg-surface"}>{isZoom ? "Zoom" : "Demo room"}</Badge>}
        actions={
          isZoom && point.meeting.meetingUrl ? (
            <PillLink href={point.meeting.meetingUrl} target="_blank" rel="noopener noreferrer">
              Join on Zoom
            </PillLink>
          ) : (
            <PillLink href={`/points/${point.id}#chat`}>Open point chat</PillLink>
          )
        }
      >
        <section aria-labelledby="in-the-room-heading">
          <h2 id="in-the-room-heading" className="mb-3 font-display text-lg font-bold tracking-tight text-ink">
            In the room{" "}
            <span className="tnum ml-1 rounded-full bg-surface px-2.5 py-0.5 font-sans text-xs font-bold">
              {members.length}
            </span>
          </h2>
          <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-4">
            {members.map((user, index) => (
              <li
                key={user.id}
                className="flex min-h-36 flex-col items-center justify-center gap-2 rounded-2xl bg-surface px-3 py-4 text-center animate-fade-up"
                style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
              >
                <Avatar name={user.name} color={user.avatarColor} size={56} />
                <span className="w-full text-sm font-semibold leading-tight text-ink">{user.name}</span>
                {user.id === point.moderatorId ? (
                  <span className="rounded-full bg-sage px-2 py-0.5 text-[11px] font-bold text-mint">Moderator</span>
                ) : (
                  <span className="py-0.5 text-[11px] text-muted">{user.gradeLevel}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      </PageBand>

      <div className="rise-in grid gap-6 [--i:1] lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="min-w-0 space-y-6">
          <section aria-labelledby="room-heading" className={`${CARD} space-y-4`}>
            <div>
              <h2 id="room-heading" className="font-display text-xl font-bold tracking-tight text-ink">
                {isZoom ? "Zoom meeting" : "Demo room"}
              </h2>
              <p className="mt-1 max-w-xl text-sm leading-6 text-ink">
                {isZoom
                  ? "This point meets on Zoom every week at its scheduled time. The link opens a new tab."
                  : "This room runs inside StudyCircle. Video and audio are not connected, and nothing is sent to Zoom."}
              </p>
            </div>

            {isZoom ? (
              <PillLink href={point.meeting.meetingUrl} target="_blank" rel="noopener noreferrer">
                Join on Zoom
              </PillLink>
            ) : (
              <MascotNote
                mood="wink"
                color={chord?.color}
                title="This is where the weekly session would open."
                hint="Bring your questions to the point chat first. When the session starts, your moderator leads the group from here."
                bare
                action={
                  <>
                    <PillLink href={`/points/${point.id}#chat`}>Open point chat</PillLink>
                    <PillLink href={`/points/${point.id}`} tone="outline">
                      Back to point
                    </PillLink>
                  </>
                }
              />
            )}
          </section>

          <section aria-labelledby="transcript-heading" className={`${CARD} space-y-3`}>
            <h2 id="transcript-heading" className="font-display text-xl font-bold tracking-tight text-ink">
              Transcript
            </h2>
            {isModerator ? (
              <>
                <p className="text-sm leading-6 text-ink">
                  End the meeting to close the room for everyone and save the transcript here. You can also fetch
                  the latest transcript without ending the session.
                </p>
                <MeetingTranscriptPanel pointId={point.id} />
              </>
            ) : (
              <>
                <p className="text-sm leading-6 text-ink">
                  Only the moderator can end the meeting and fetch the transcript. Ask them to share it in the
                  point chat.
                </p>
                <PillLink href={`/points/${point.id}#chat`} tone="outline">
                  Open point chat
                </PillLink>
              </>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <section aria-labelledby="meeting-details-heading" className={`${CARD} space-y-3`}>
            <h2 id="meeting-details-heading" className={CARD_TITLE}>
              Meeting details
            </h2>
            <dl className="space-y-2 text-sm">
              <div className="flex items-baseline justify-between gap-2">
                <dt className="text-muted">Provider</dt>
                <dd className="font-semibold text-ink">{isZoom ? "Zoom" : "Demo (in-app)"}</dd>
              </div>
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
            </dl>
            {!isZoom ? (
              <p className="text-xs leading-5 text-muted">
                Demo room codes come from the sample data. Nothing leaves StudyCircle.
              </p>
            ) : null}
          </section>

          <section aria-labelledby="before-session-heading" className="rounded-2xl bg-sun-wash p-5">
            <h2 id="before-session-heading" className={CARD_TITLE}>
              Before the session
            </h2>
            <p className="mt-1 text-sm leading-6 text-ink">
              Post what you want to cover in the point chat so the moderator can plan the hour.
            </p>
            <Link
              href={`/points/${point.id}#chat`}
              className="link mt-2 inline-flex min-h-10 items-center text-sm"
            >
              Go to the point chat
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
