import Link from "next/link";
import { notFound } from "next/navigation";
import { MeetingTranscriptPanel } from "@/components/point/MeetingTranscriptPanel";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getCurrentUser } from "@/lib/api/session";
import { getPoint, listUsers } from "@/lib/database/repository";

export const metadata = { title: "Meeting Room · StudyCircle" };

/**
 * Meeting room for a point. With ENABLE_ZOOM_API false (or when Zoom creation failed),
 * this is the built-in demo room and no external calls happen here. With Zoom enabled,
 * participants join via the stored Zoom link; the transcript controls work for either provider.
 */
export default async function MeetingPage({ params }: PageProps<"/points/[pointId]/meeting">) {
  const { pointId } = await params;
  const point = await getPoint(pointId);
  if (!point) notFound();

  const [users, viewer] = await Promise.all([listUsers(), getCurrentUser()]);
  const userById = new Map(users.map((user) => [user.id, user]));
  const memberIds = [...new Set([...point.memberIds, point.moderatorId])];
  const isModerator = viewer?.id === point.moderatorId;
  const isZoom = point.meeting.provider === "zoom";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href={`/points/${point.id}`} className="text-sm text-muted hover:text-ink">
        ← Back to point
      </Link>

      <Card className="space-y-5 text-center">
        <Badge tone="brand">{isZoom ? "Zoom Meeting" : "Demo Meeting Room"}</Badge>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{point.title}</h1>
          {isZoom ? (
            <p className="mt-1 text-muted">This point meets on Zoom every week at its scheduled time.</p>
          ) : (
            <p className="mt-1 text-muted">
              This is the built-in demo room. It runs entirely inside StudyCircle, so nothing is sent to Zoom.
            </p>
          )}
        </div>

        {isZoom ? (
          <div className="flex flex-wrap justify-center gap-2">
            <Button href={point.meeting.meetingUrl} target="_blank" rel="noopener noreferrer">
              Join Zoom meeting
            </Button>
          </div>
        ) : (
          <>
            <div className="rounded-xl border border-dashed border-line bg-paper px-4 py-10">
              <p className="text-sm text-muted">Camera and microphone preview would appear here.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Button variant="secondary" size="sm">Mute</Button>
                <Button variant="secondary" size="sm">Camera off</Button>
                <Button variant="secondary" size="sm">Share screen</Button>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {memberIds.map((id) => {
                const user = userById.get(id);
                if (!user) return null;
                return (
                  <span key={user.id} className="flex items-center gap-2 rounded-full border border-line py-1 pl-1 pr-3 text-sm">
                    <Avatar name={user.name} color={user.avatarColor} size={24} />
                    {user.name.split(" ")[0]}
                  </span>
                );
              })}
            </div>
          </>
        )}

        {isModerator ? (
          <div className="border-t border-line pt-4">
            <MeetingTranscriptPanel pointId={point.id} />
          </div>
        ) : null}
      </Card>

      <Card className="space-y-2">
        <h2 className="font-semibold tracking-tight">Meeting details</h2>
        <dl className="grid gap-1.5 text-sm sm:grid-cols-3">
          <div className="flex justify-between gap-2 sm:block">
            <dt className="text-muted">Meeting ID</dt>
            <dd className="font-mono text-xs">{point.meeting.meetingId}</dd>
          </div>
          <div className="flex justify-between gap-2 sm:block">
            <dt className="text-muted">Passcode</dt>
            <dd className="font-mono text-xs">{point.meeting.meetingPassword}</dd>
          </div>
          <div className="flex justify-between gap-2 sm:block">
            <dt className="text-muted">Provider</dt>
            <dd className="font-medium">{isZoom ? "Zoom" : "Demo (in-app)"}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
