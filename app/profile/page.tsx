import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { SubmitButton } from "@/components/ui/Button";
import { Card, SectionHeading } from "@/components/ui/Card";
import { Field, Select, TextInput, Textarea } from "@/components/ui/Field";
import { CHORD_CATALOG } from "@/config/chords";
import { TIMEZONES } from "@/config/timezones";
import { signOut, updateProfile } from "@/lib/api/actions";
import { requireUser } from "@/lib/api/session";
import { listChords, listPoints } from "@/lib/database/repository";
import { WEEKDAY_NAMES, formatTime } from "@/lib/domain/time";

export const metadata = { title: "Profile · StudyCircle" };

export default async function ProfilePage() {
  const user = await requireUser();
  const [chords, points] = await Promise.all([listChords(), listPoints()]);

  const chordById = new Map(chords.map((chord) => [chord.id, chord]));
  const myPoints = points.filter((point) => point.memberIds.includes(user.id) || point.moderatorId === user.id);
  const moderating = points.filter((point) => point.moderatorId === user.id);

  const slotKey = (weekday: number, start: string, end: string) => `${weekday}|${start}|${end}`;
  const mySlots = new Set(user.availability.map((slot) => slotKey(slot.weekday, slot.start, slot.end)));
  const mySubjects = new Set(user.subjects);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <section className="flex flex-wrap items-center gap-4">
        <Avatar name={user.name} color={user.avatarColor} size={64} />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{user.name}</h1>
          <p className="text-sm text-muted">
            {user.educationLevel} · {user.gradeLevel}
            {user.school ? ` · ${user.school}` : ""}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge tone="brand">{user.experienceLevel}</Badge>
            <Badge tone="muted">{user.timezone}</Badge>
            {user.isCreator ? <Badge tone="mint">Creator</Badge> : null}
            {moderating.length > 0 ? <Badge tone="mint">Moderates {moderating.length}</Badge> : null}
          </div>
        </div>
        <form action={signOut} className="ml-auto">
          <SubmitButton variant="secondary" size="sm">
            Sign out
          </SubmitButton>
        </form>
      </section>

      {user.bio ? <p className="text-muted">{user.bio}</p> : null}

      <section className="space-y-3">
        <SectionHeading title="Your points" />
        {myPoints.length === 0 ? (
          <p className="text-sm text-muted">You have not joined any points yet.</p>
        ) : (
          <ul className="space-y-2">
            {myPoints.map((point) => {
              const chord = chordById.get(point.chordId);
              return (
                <li key={point.id} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{point.title}</p>
                    <p className="text-xs text-muted">
                      {chord?.name} · {WEEKDAY_NAMES[point.schedule.weekday]} {formatTime(point.schedule.time, user.timezone)}
                    </p>
                  </div>
                  {point.moderatorId === user.id ? <Badge tone="mint">Moderator</Badge> : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <SectionHeading title="Edit profile" hint="Availability and subjects are used to match you with points." />
        <Card>
          <form action={updateProfile} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name">
                <TextInput name="name" required maxLength={60} defaultValue={user.name} />
              </Field>
              <Field label="Age">
                <TextInput name="age" type="number" required min={10} max={99} defaultValue={user.age} />
              </Field>
              <Field label="Education level">
                <Select name="educationLevel" defaultValue={user.educationLevel}>
                  <option>High School</option>
                  <option>College</option>
                </Select>
              </Field>
              <Field label="Grade level or year">
                <TextInput name="gradeLevel" maxLength={40} defaultValue={user.gradeLevel} />
              </Field>
              <Field label="School (optional)">
                <TextInput name="school" maxLength={80} defaultValue={user.school ?? ""} />
              </Field>
              <Field label="Experience level">
                <Select name="experienceLevel" defaultValue={user.experienceLevel}>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                  <option>Expert</option>
                </Select>
              </Field>
              <Field label="Timezone">
                <Select name="timezone" defaultValue={user.timezone}>
                  {TIMEZONES.map((zone) => (
                    <option key={zone}>{zone}</option>
                  ))}
                </Select>
              </Field>
            </div>

            <Field label="Subjects you're interested in">
              <div className="flex flex-wrap gap-2">
                {CHORD_CATALOG.map((chord) => (
                  <label
                    key={chord.id}
                    className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-sm has-checked:border-brand has-checked:bg-brand/10"
                  >
                    <input
                      type="checkbox"
                      name="subjects"
                      value={chord.id}
                      defaultChecked={mySubjects.has(chord.id)}
                      className="size-3.5 accent-[#4f46e5]"
                    />
                    {chord.name}
                  </label>
                ))}
              </div>
            </Field>

            <Field label="Availability" hint="Typical weekly windows you can study.">
              <div className="space-y-2">
                {WEEKDAY_NAMES.map((day, weekday) =>
                  [
                    { start: "17:00", end: "21:00", label: "5–9pm" },
                    { start: "18:00", end: "21:00", label: "6–9pm" },
                    { start: "16:00", end: "19:00", label: "4–7pm" },
                    { start: "09:00", end: "13:00", label: "9am–1pm" },
                  ].map((window) => {
                    const value = slotKey(weekday, window.start, window.end);
                    return (
                      <label key={value} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          name="availability"
                          value={value}
                          defaultChecked={mySlots.has(value)}
                          className="size-3.5 accent-[#4f46e5]"
                        />
                        <span className="w-24 text-muted">{day}</span>
                        {window.label}
                      </label>
                    );
                  }),
                )}
              </div>
            </Field>

            <Field label="Short bio (optional)">
              <Textarea name="bio" maxLength={280} defaultValue={user.bio ?? ""} />
            </Field>

            <SubmitButton>Save profile</SubmitButton>
          </form>
        </Card>
      </section>
    </div>
  );
}
