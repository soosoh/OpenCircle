import Link from "next/link";
import { getCurrentUser } from "@/lib/api/session";
import { listChords, listPoints } from "@/lib/database/repository";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, EmptyState, SectionHeading } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PointStatusBadge } from "@/components/ui/StatusBadge";
import { formatTime, WEEKDAY_NAMES } from "@/lib/domain/time";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** "7:00 PM" reads as "7 PM"; minutes are kept when they matter. */
function compactTime(value: string, timeZone: string) {
  return formatTime(value, timeZone).replace(":00", "");
}

export const metadata = { title: "Profile · StudyCircle" };

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-line bg-surface p-8 text-center">
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink">Not signed in</h1>
        <p className="mt-2 text-sm text-muted">Sign in to see your profile, chords and points.</p>
        <div className="mt-5 flex justify-center">
          <Button href="/login" variant="primary">
            Sign in
          </Button>
        </div>
      </div>
    );
  }

  const [points, chords] = await Promise.all([listPoints(), listChords()]);
  const userPoints = points.filter((p) => p.memberIds.includes(user.id) || p.moderatorId === user.id);
  const userChords = chords.filter((c) => (c.memberIds ?? []).includes(user.id));
  const chordById = new Map(chords.map((chord) => [chord.id, chord]));

  const slotsByWeekday = new Map<number, typeof user.availability>();
  for (const slot of user.availability) {
    const list = slotsByWeekday.get(slot.weekday) ?? [];
    list.push(slot);
    slotsByWeekday.set(slot.weekday, list);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <Avatar name={user.name} color={user.avatarColor} size={80} className="ring-4 ring-sun" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-bold tracking-tight text-ink">{user.name}</h1>
              {user.isCreator ? <Badge tone="sun">Creator</Badge> : null}
            </div>
            <p className="mt-1 text-sm text-muted">
              {user.educationLevel} · {user.gradeLevel} · {user.experienceLevel}
            </p>
            {user.bio ? <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink">{user.bio}</p> : null}
          </div>

          <div className="w-36 sm:ml-auto sm:shrink-0">
            <p className="text-xs text-muted">Reputation</p>
            <p className="mt-0.5 flex items-baseline gap-1">
              <span className="tnum font-display text-xl font-semibold leading-none text-ink">{user.reputation}</span>
              <span className="text-xs text-muted">/ 100</span>
            </p>
            <div className="mt-2">
              <ProgressBar value={user.reputation} label={`${user.name} reputation`} />
            </div>
          </div>
        </div>

        {user.educationLevel === "High School" ? (
          <p className="mt-5 border-t border-line pt-4 text-xs leading-relaxed text-muted">
            Only you see this page. Other members see your name, year, subjects and reputation — never
            your exact age, school or study windows.
          </p>
        ) : null}
      </section>

      <section aria-label="Profile at a glance" className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-mist p-4">
          <p className="text-xs text-muted">Points</p>
          <p className="mt-1 tnum font-display text-2xl font-semibold leading-none text-ink">{userPoints.length}</p>
          <p className="mt-2 text-xs text-muted">weekly groups</p>
        </div>
        <div className="rounded-2xl border border-line bg-mist p-4">
          <p className="text-xs text-muted">Chords</p>
          <p className="mt-1 tnum font-display text-2xl font-semibold leading-none text-ink">{userChords.length}</p>
          <p className="mt-2 text-xs text-muted">subject communities</p>
        </div>
        <div className="rounded-2xl border border-line bg-mist p-4">
          <p className="text-xs text-muted">Group success</p>
          <p className="mt-1 tnum font-display text-2xl font-semibold leading-none text-ink">
            {Math.round(user.groupSuccessRate * 100)}%
          </p>
          <p className="mt-2 text-xs text-muted">meetings that held</p>
        </div>
      </section>

      <section>
        <SectionHeading title="Chords" hint="Subject communities you belong to." />
        {userChords.length === 0 ? (
          <EmptyState
            title="No chords yet"
            hint="Join a chord to find its points and study alongside people on the same path."
            action={
              <Button href="/chords" variant="secondary" size="sm">
                Browse chords
              </Button>
            }
          />
        ) : (
          <ul className="flex flex-wrap gap-2">
            {userChords.map((chord) => (
              <li key={chord.id}>
                <Link
                  href={`/chords/${chord.id}`}
                  className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line bg-surface px-3.5 text-sm font-semibold text-ink transition-colors hover:border-ink/25 hover:bg-sun-wash"
                >
                  <span className="size-2 rounded-full" style={{ backgroundColor: chord.color }} aria-hidden="true" />
                  {chord.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <SectionHeading title="Your points" hint="Weekly groups you belong to, with their local meeting time." />
        {userPoints.length === 0 ? (
          <EmptyState
            title="No points yet"
            hint="Points are weekly study groups inside a chord. Pick one that fits your schedule."
            action={
              <Button href="/chords" variant="secondary" size="sm">
                Find a point
              </Button>
            }
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {userPoints.map((p) => {
              const chord = chordById.get(p.chordId);
              return (
                <Card key={p.id} interactive className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-base font-bold text-ink">{p.title}</h3>
                    <PointStatusBadge status={p.status} />
                  </div>
                  <p className="text-sm leading-relaxed text-muted">{p.description}</p>
                  <p className="text-xs text-muted">
                    {chord ? `${chord.name} · ` : ""}
                    {WEEKDAYS[p.schedule.weekday]} at{" "}
                    <span className="tnum">{formatTime(p.schedule.time, p.schedule.timezone)}</span>
                    {p.moderatorId === user.id ? " · you moderate" : ""}
                  </p>
                  <Link
                    href={`/points/${p.id}`}
                    className="mt-auto inline-flex min-h-10 items-center text-sm font-semibold text-ink underline decoration-line underline-offset-4 transition-colors hover:decoration-ink"
                  >
                    Open point →
                  </Link>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <SectionHeading title="Availability" hint={`Your usual study windows, in ${user.timezone}.`} />
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {WEEKDAYS.map((day, weekday) => {
            const slots = slotsByWeekday.get(weekday) ?? [];
            return (
              <li
                key={day}
                className={`rounded-xl border border-line p-2.5 ${slots.length > 0 ? "bg-sun-wash" : "bg-surface"}`}
              >
                <p className="text-xs font-semibold text-ink">
                  {WEEKDAY_NAMES[weekday]?.slice(0, 3) ?? day}
                </p>
                {slots.length === 0 ? (
                  <>
                    <span className="sr-only">No windows</span>
                    <p aria-hidden="true" className="mt-1 text-sm text-muted/60">
                      —
                    </p>
                  </>
                ) : (
                  <ul className="mt-1 space-y-0.5">
                    {slots.map((slot, index) => (
                      <li
                        key={`${slot.weekday}-${slot.start}-${index}`}
                        className="tnum text-xs leading-snug text-ink"
                      >
                        {compactTime(slot.start, user.timezone)} – {compactTime(slot.end, user.timezone)}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          Only you see these windows. Point members see the point&rsquo;s weekly meeting time, not your
          personal study hours.
        </p>
      </section>

      <section>
        <SectionHeading title="Private details" hint="Facts kept on your own profile." />
        <dl className="grid gap-x-6 gap-y-4 rounded-2xl border border-line bg-surface p-5 sm:grid-cols-3">
          <div>
            <dt className="text-xs text-muted">Age</dt>
            <dd className="tnum mt-1 text-sm font-semibold text-ink">{user.age}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">School</dt>
            <dd className="mt-1 text-sm font-semibold text-ink">{user.school ?? "Not added"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Timezone</dt>
            <dd className="mt-1 break-words text-sm font-semibold text-ink">{user.timezone}</dd>
          </div>
        </dl>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          Only you see this. Moderators see your year, experience and reputation when they pick a
          point&rsquo;s group, but not your age or school.
        </p>
      </section>
    </div>
  );
}
