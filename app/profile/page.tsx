import Link from "next/link";
import { Lock } from "lucide-react";
import { getCurrentUser } from "@/lib/api/session";
import { listChords, listPoints } from "@/lib/database/repository";
import { Mascot } from "@/components/landing/mascot";
import { BandPill, PageBand, Stage, StatTile } from "@/components/surfaces/PageBand";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { PointStatusBadge } from "@/components/ui/StatusBadge";
import { formatTime, WEEKDAY_NAMES } from "@/lib/domain/time";
import { EditProfileDialog } from "./EditProfileDialog";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** "7:00 PM" reads as "7 PM"; minutes are kept when they matter. */
function compactTime(value: string, timeZone: string) {
  return formatTime(value, timeZone).replace(":00", "");
}

export const metadata = { title: "Profile · StudyCircle" };

/** Pale card chrome shared by this page: white, hairline border, no resting shadow. */
const PANEL = "rounded-2xl border border-line bg-surface p-5 sm:p-6";

function PanelTitle({ title, hint, id }: { title: string; hint?: string; id?: string }) {
  return (
    <div className="mb-4">
      <h2 id={id} className="font-display text-xl font-bold tracking-tight text-ink">
        {title}
      </h2>
      {hint ? <p className="mt-1 text-sm text-muted">{hint}</p> : null}
    </div>
  );
}

function EmptyPanel({ title, hint, action }: { title: string; hint: string; action: { href: string; label: string } }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-ink/25 bg-sun-wash px-6 py-8 text-center">
      <Mascot mood="happy" color="#2E7D5B" width={56} height={56} />
      <p className="mt-3 font-display text-lg font-bold text-ink">{title}</p>
      <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-ink">{hint}</p>
      <Button href={action.href} variant="ink" size="md" className="mt-5 min-h-11">
        {action.label}
      </Button>
    </div>
  );
}

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center rounded-2xl border border-line bg-surface p-8 text-center">
        <Mascot mood="happy" color="#2E7D5B" width={72} height={72} />
        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink">Not signed in</h1>
        <p className="mt-2 text-base leading-relaxed text-ink">Sign in to see your profile, chords and points.</p>
        <Button href="/login" variant="ink" size="lg" className="mt-6 min-h-11">
          Sign in
        </Button>
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

  const successRate = Math.round(user.groupSuccessRate * 100);
  const editorInitial = {
    name: user.name,
    age: user.age,
    educationLevel: user.educationLevel,
    gradeLevel: user.gradeLevel,
    school: user.school ?? "",
    experienceLevel: user.experienceLevel,
    timezone: user.timezone,
    bio: user.bio ?? "",
    subjects: user.subjects,
    availability: user.availability,
  };

  return (
    <>
      <PageBand
        lead={<Avatar name={user.name} color={user.avatarColor} size={88} className="ring-4 ring-white" />}
        title={user.name}
        description={user.bio ?? "Your study profile. Only you can see this page."}
        meta={
          <>
            {user.isCreator ? (
              <span className="inline-flex items-center rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white">
                Creator
              </span>
            ) : null}
            <BandPill>{user.educationLevel}</BandPill>
            <BandPill>{user.gradeLevel}</BandPill>
            <BandPill>{user.experienceLevel}</BandPill>
          </>
        }
        actions={
          <EditProfileDialog initial={editorInitial} />
        }
        aside={<Mascot mood="cheer" color="#2E7D5B" width={132} height={132} className="animate-float" />}
      >
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          <StatTile value={user.reputation} label="reputation, out of 100" />
          <StatTile value={userPoints.length} label={userPoints.length === 1 ? "point" : "points"} delay={60} />
          <StatTile value={userChords.length} label={userChords.length === 1 ? "chord" : "chords"} delay={120} />
          <StatTile value={successRate} label="% of meetings held" delay={180} />
        </div>
      </PageBand>

      <Stage>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:items-start">
          <div className="space-y-8">
            <section aria-labelledby="your-points">
              <PanelTitle id="your-points" title="Your points" hint="Weekly groups you belong to, with their local meeting time." />
              {userPoints.length === 0 ? (
                <EmptyPanel
                  title="No points yet"
                  hint="Points are weekly study groups inside a chord. Pick one that fits your schedule."
                  action={{ href: "/chords", label: "Find a point" }}
                />
              ) : (
                <ul className="grid gap-3 sm:grid-cols-2">
                  {userPoints.map((p) => {
                    const chord = chordById.get(p.chordId);
                    return (
                      <li key={p.id} className={`${PANEL} flex flex-col gap-3 transition-colors hover:border-ink/30`}>
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-display text-lg font-bold leading-snug text-ink">{p.title}</h3>
                          <PointStatusBadge status={p.status} />
                        </div>
                        <p className="text-sm leading-relaxed text-ink">{p.description}</p>
                        <p className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-muted">
                          <span className="rounded-full bg-sun-soft px-2.5 py-1 font-semibold text-ink">
                            {WEEKDAYS[p.schedule.weekday]} <span className="tnum">{compactTime(p.schedule.time, p.schedule.timezone)}</span>
                          </span>
                          {chord ? <span>{chord.name}</span> : null}
                          {p.moderatorId === user.id ? (
                            <span className="rounded-full bg-sage px-2.5 py-1 font-semibold text-sage-ink">You moderate</span>
                          ) : null}
                        </p>
                        <Link
                          href={`/points/${p.id}`}
                          className="mt-auto inline-flex min-h-11 items-center self-start rounded-full bg-ink px-4 text-sm font-semibold text-white transition-colors hover:bg-ink-soft"
                        >
                          Open point
                          <span aria-hidden="true" className="ml-2">→</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section aria-labelledby="private-details" className={PANEL}>
              <PanelTitle id="private-details" title="Private details" />
              <dl className="space-y-3 text-sm">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-muted">Age</dt>
                  <dd className="tnum font-semibold text-ink">{user.age}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-muted">School</dt>
                  <dd className="min-w-0 break-words text-right font-semibold text-ink">{user.school ?? "Not added"}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-muted">Timezone</dt>
                  <dd className="min-w-0 break-words text-right font-semibold text-ink">{user.timezone}</dd>
                </div>
              </dl>
              <p className="mt-4 flex gap-2 rounded-xl bg-sun-wash p-3 text-xs leading-relaxed text-ink">
                <Lock aria-hidden="true" size={14} className="mt-0.5 shrink-0" />
                <span>
                  Only you see this.{" "}
                  {user.educationLevel === "High School"
                    ? "Other members see your name, year, subjects and reputation, never your exact age, school or study windows."
                    : "Moderators see your year, experience and reputation when they pick a point's group, but not your age or school."}
                </span>
              </p>
            </section>
          </div>

          <div className="space-y-8">
            <section aria-labelledby="availability" className={PANEL}>
              <PanelTitle id="availability" title="Availability" hint={`Your usual study windows, in ${user.timezone}.`} />
              <ul className="divide-y divide-line">
                {WEEKDAYS.map((day, weekday) => {
                  const slots = slotsByWeekday.get(weekday) ?? [];
                  return (
                    <li key={day} className="grid grid-cols-[3.25rem_minmax(0,1fr)] items-center gap-3 py-2">
                      <span className={`text-sm ${slots.length > 0 ? "font-semibold text-ink" : "text-muted"}`}>
                        {WEEKDAY_NAMES[weekday]?.slice(0, 3) ?? day}
                      </span>
                      {slots.length === 0 ? (
                        <>
                          <span className="sr-only">No windows</span>
                          <span aria-hidden="true" className="h-1.5 rounded-full bg-mist" />
                        </>
                      ) : (
                        <span className="flex flex-wrap gap-1.5">
                          {slots.map((slot, index) => (
                            <span
                              key={`${slot.weekday}-${slot.start}-${index}`}
                              className="tnum rounded-full bg-sun-soft px-2.5 py-1 text-xs font-semibold text-ink"
                            >
                              {compactTime(slot.start, user.timezone)} – {compactTime(slot.end, user.timezone)}
                            </span>
                          ))}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
              <p className="mt-4 text-xs leading-relaxed text-muted">
                Only you see these windows. Point members see the point&rsquo;s weekly meeting time, not your
                personal study hours.
              </p>
            </section>

            <section aria-labelledby="your-chords" className={PANEL}>
              <PanelTitle id="your-chords" title="Your chords" hint="Subject communities you belong to." />
              {userChords.length === 0 ? (
                <EmptyPanel
                  title="No chords yet"
                  hint="Join a chord to find its points and study alongside people on the same path."
                  action={{ href: "/chords", label: "Browse chords" }}
                />
              ) : (
                <ul className="flex flex-wrap gap-2">
                  {userChords.map((chord) => (
                    <li key={chord.id}>
                      <Link
                        href={`/chords/${chord.id}`}
                        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-semibold text-ink transition-colors hover:border-ink/30 hover:bg-sun-wash"
                      >
                        <span className="size-2.5 rounded-full" style={{ backgroundColor: chord.color }} aria-hidden="true" />
                        {chord.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      </Stage>
    </>
  );
}
