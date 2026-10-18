import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/ui/ActionForm";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getCurrentUser } from "@/lib/api/session";
import { endPointMeeting } from "@/lib/api/actions";
import { getPoint, listUsers } from "@/lib/database/repository";
import { FEATURES } from "@/config/features";

export const metadata = { title: "Demo Meeting Room · StudyCircle" };

/**
 * Mock meeting room used when ENABLE_ZOOM_API is false. No external calls happen here.
 */
export default async function DemoMeetingPage({ params }: PageProps<"/points/[pointId]/meeting">) {
  const { pointId } = await params;
  const point = await getPoint(pointId);
  if (!point) notFound();

  const [users, viewer] = await Promise.all([listUsers(), getCurrentUser()]);
  const userById = new Map(users.map((user) => [user.id, user]));
  const memberIds = [...new Set([...point.memberIds, point.moderatorId])];
  const isModerator = viewer?.id === point.moderatorId;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href={`/points/${point.id}`} className="text-sm text-muted hover:text-ink">
        ← Back to point
      </Link>

      <Card className="space-y-5 text-center">
        <Badge tone="brand">Demo Meeting Room</Badge>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{point.title}</h1>
          <p className="mt-1 text-muted">
            This is the built-in demo room. It runs entirely inside StudyCircle, so nothing is sent to Zoom.
          </p>
        </div>

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

        {isModerator ? (
          <ActionForm
            action={endPointMeeting.bind(null, point.id)}
            variant="danger"
            confirm="End the meeting for everyone?"
          >
            End meeting
          </ActionForm>
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
            <dt className="text-muted">Zoom integration</dt>
            <dd className="font-medium">{FEATURES.ENABLE_ZOOM_API ? "Enabled" : "Disabled (demo mode)"}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
