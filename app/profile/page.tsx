import { getCurrentUser } from "@/lib/api/session";
import { listPoints, listChords } from "@/lib/database/repository";
import { Avatar } from "@/components/ui/Avatar";
import { Card, SectionHeading } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) return (
    <div className="mx-auto max-w-3xl py-16 text-center">
      <h1 className="text-2xl font-semibold">Not signed in</h1>
      <p className="mt-2 text-muted"><Link href="/login" className="underline">Sign in</Link> to view your profile.</p>
    </div>
  );

  const [points, chords] = await Promise.all([listPoints(), listChords()]);
  const userPoints = points.filter((p) => p.memberIds.includes(user.id) || p.moderatorId === user.id);
  const userChords = chords.filter((c) => (c.memberIds ?? []).includes(user.id));

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div className="flex items-center gap-6">
        <Avatar name={user.name} color={user.avatarColor} size={80} />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
          <p className="text-muted">{user.educationLevel} · {user.gradeLevel} · {user.experienceLevel}</p>
          {user.school && <p className="text-sm text-white/60">{user.school}</p>}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <Card><h3 className="font-semibold">Age</h3><p className="mt-1 text-2xl">{user.age}</p></Card>
        <Card><h3 className="font-semibold">Timezone</h3><p className="mt-1 text-2xl">{user.timezone}</p></Card>
        <Card><h3 className="font-semibold">Reputation</h3><p className="mt-1 text-2xl">{user.reputation}/100</p></Card>
      </div>

      <section>
        <SectionHeading title="Subjects" />
        <div className="flex flex-wrap gap-2">
          {user.subjects.map((s) => <Badge key={s}>{s}</Badge>)}
        </div>
      </section>

      <section>
        <SectionHeading title="Your Points" />
        <div className="grid gap-3 sm:grid-cols-2">
          {userPoints.map((p) => (
            <Card key={p.id}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{p.title}</h3>
                <Badge>{p.status}</Badge>
              </div>
              <p className="text-sm text-muted">{p.description}</p>
              <Link href={`/points/${p.id}`} className="mt-2 inline-block text-sm font-medium text-mint hover:underline">Open point →</Link>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <SectionHeading title="Availability" />
        <div className="space-y-2">
          {user.availability.map((a, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-white/[0.05] p-3 text-sm">
              Weekday {a.weekday} · {a.start} – {a.end}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
