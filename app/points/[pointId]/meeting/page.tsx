import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { MeetingTranscriptPanel } from "@/components/point/MeetingTranscriptPanel";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getCurrentUser } from "@/lib/api/session";
import { getPoint, listUsers } from "@/lib/database/repository";
import { WEEKDAY_NAMES, formatTime } from "@/lib/domain/time";

export const metadata = { title: "Meeting Room · StudyCircle" };

/**
 * Meeting room for a point. With ENABLE_ZOOM_API false (or when Zoom creation failed),
 * this is the built-in demo room and no external calls happen here. With Zoom enabled,
 * participants join via the stored Zoom link; the transcript controls work for either provider.
 */
export default async function MeetingPage({ params }: PageProps<"/points/[pointId]/meeting">) {
  // The room chrome reads the session; keep the route blocking rather than instant.
  await connection();
  const { pointId } = await params;
  const point = await getPoint(pointId);
  if (!point) notFound();

  const [users, viewer] = await Promise.all([listUsers(), getCurrentUser()]);
  const userById = new Map(users.map((user) => [user.id, user]));
  const memberIds = [...new Set([...point.memberIds, point.moderatorId])];
  const members = memberIds.map((id) => userById.get(id)).filter((user) => user !== undefined);
  const isModerator = viewer?.id === point.moderatorId;
  const isZoom = point.meeting.provider === "zoom";
  const zone = point.schedule.timezone.split("/").pop()?.replaceAll("_", " ") ?? point.schedule.timezone;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        href={`/points/${point.id}`}
        className="inline-flex min-h-10 items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
      >
        <span aria-hidden="true">←</span> {point.title}
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">Meeting room</h1>
          <p className="mt-2 text-[15px] leading-7 text-muted">
            {point.title} · {WEEKDAY_NAMES[point.schedule.weekday]} at{" "}
            {formatTime(point.schedule.time, point.schedule.timezone)} ({zone} time) · repeats weekly
          </p>
        </div>
        <Button href={`/points/${point.id}`} variant="secondary" size="sm" className="min-h-10">
          Back to point
        </Button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="min-w-0 space-y-6">
          <Card className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-bold tracking-tight text-ink">
                  {isZoom ? "Zoom meeting" : "Demo room"}
                </h2>
                <p className="mt-1 max-w-xl text-sm leading-6 text-muted">
                  {isZoom
                    ? "This point meets on Zoom every week at its scheduled time. The link opens a new tab."
                    : "This room runs inside StudyCircle. Video and audio are not connected, and nothing is sent to Zoom."}
                </p>
              </div>
              <Badge tone={isZoom ? "mint" : "sun"}>{isZoom ? "Zoom" : "Demo"}</Badge>
            </div>

            {isZoom ? (
              <Button
                href={point.meeting.meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-10"
              >
                Join on Zoom
              </Button>
            ) : (
              <div className="rounded-xl border border-dashed border-line bg-paper px-4 py-8 text-center">
                <p className="text-sm font-medium text-ink">This is where the weekly session would open</p>
                <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted">
                  Bring your questions to the point chat first. When the session starts, your moderator leads the
                  group from here.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <Button href={`/points/${point.id}#chat`} size="sm" variant="secondary" className="min-h-10">
                    Open point chat
                  </Button>
                  <Button href={`/points/${point.id}`} size="sm" variant="ghost" className="min-h-10">
                    Back to point
                  </Button>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-[13px] font-semibold text-ink">
                In the room · <span className="tnum font-normal text-muted">{members.length}</span>
              </h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {members.map((user) => (
                  <li
                    key={user.id}
                    className="flex min-h-10 items-center gap-2 rounded-full border border-line bg-paper py-1 pl-1 pr-3 text-sm text-ink"
                  >
                    <Avatar name={user.name} color={user.avatarColor} size={24} />
                    <span className="truncate">{user.name}</span>
                    {user.id === point.moderatorId ? (
                      <span className="text-xs text-muted">Moderator</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          <Card className="space-y-3">
            <h2 className="font-display text-xl font-bold tracking-tight text-ink">Transcript</h2>
            {isModerator ? (
              <>
                <p className="text-sm leading-6 text-muted">
                  End the meeting to close the room for everyone and save the transcript here. You can also fetch
                  the latest transcript without ending the session.
                </p>
                <MeetingTranscriptPanel pointId={point.id} />
              </>
            ) : (
              <>
                <p className="text-sm leading-6 text-muted">
                  Only the moderator can end the meeting and fetch the transcript. Ask them to share it in the
                  point chat.
                </p>
                <Button href={`/points/${point.id}#chat`} variant="secondary" size="sm" className="min-h-10">
                  Open point chat
                </Button>
              </>
            )}
          </Card>
        </div>

        <aside className="space-y-4">
          <Card className="space-y-3">
            <h2 className="font-display text-base font-bold tracking-tight text-ink">Meeting details</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex items-baseline justify-between gap-2">
                <dt className="text-muted">Provider</dt>
                <dd className="font-medium text-ink">{isZoom ? "Zoom" : "Demo (in-app)"}</dd>
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
            </dl>
            {!isZoom ? (
              <p className="text-xs leading-5 text-muted">
                Demo room codes come from the sample data. Nothing leaves StudyCircle.
              </p>
            ) : null}
          </Card>

          <Card className="space-y-2">
            <h2 className="font-display text-base font-bold tracking-tight text-ink">Before the session</h2>
            <p className="text-sm leading-6 text-muted">
              Post what you want to cover in the point chat so the moderator can plan the hour.
            </p>
            <Link
              href={`/points/${point.id}#chat`}
              className="inline-flex min-h-10 items-center text-sm font-semibold text-ink hover:underline"
            >
              Go to the point chat
            </Link>
          </Card>
        </aside>
      </div>
    </div>
  );
}
