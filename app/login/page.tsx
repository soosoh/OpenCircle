import { UserCard } from "@/components/moderator/UserCard";
import { Card, SectionHeading } from "@/components/ui/Card";
import { SubmitButton } from "@/components/ui/Button";
import { signIn, signUp } from "@/lib/api/actions";
import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/api/session";
import { CHORD_CATALOG } from "@/config/chords";
import { TIMEZONES } from "@/config/timezones";
import { CheckboxGroup, Field, Select, TextInput, Textarea } from "@/components/ui/Field";
import { listUsers } from "@/lib/database/repository";

export default async function LoginPage() {
  if (await getSessionUserId()) redirect("/dashboard");
  const users = await listUsers();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome to StudyCircle</h1>
        <p className="text-muted">
          Sign in with a demo account to explore, or create your own profile.
        </p>
      </div>

      <section>
        <SectionHeading title="Demo accounts" hint="No password needed in this demo build." />
        <div className="grid gap-3 sm:grid-cols-2">
          {users.map((user) => (
            <form key={user.id} action={signIn}>
              <input type="hidden" name="userId" value={user.id} />
              <button type="submit" className="w-full text-left transition-transform hover:-translate-y-0.5">
                <UserCard
                  user={user}
                  role={user.isCreator ? "Creator" : undefined}
                  detail={`${user.educationLevel} · ${user.gradeLevel} · ${user.experienceLevel}`}
                />
              </button>
            </form>
          ))}
        </div>
      </section>

      <section>
        <SectionHeading title="Create an account" />
        <Card>
          <form action={signUp} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name">
                <TextInput name="name" required maxLength={60} placeholder="Alex Kim" />
              </Field>
              <Field label="Age">
                <TextInput name="age" type="number" required min={10} max={99} placeholder="17" />
              </Field>
              <Field label="Education level">
                <Select name="educationLevel" defaultValue="High School">
                  <option>High School</option>
                  <option>College</option>
                </Select>
              </Field>
              <Field label="Grade level or year">
                <TextInput name="gradeLevel" placeholder="Grade 11" maxLength={40} />
              </Field>
              <Field label="School (optional)">
                <TextInput name="school" maxLength={80} placeholder="Lincoln High" />
              </Field>
              <Field label="Experience level">
                <Select name="experienceLevel" defaultValue="Beginner">
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                  <option>Expert</option>
                </Select>
              </Field>
              <Field label="Timezone" hint="Used to show meetings and deadlines in your local time.">
                <Select name="timezone" defaultValue="America/New_York">
                  {TIMEZONES.map((zone) => (
                    <option key={zone}>{zone}</option>
                  ))}
                </Select>
              </Field>
            </div>

            <Field label="Subjects you're interested in">
              <CheckboxGroup
                name="subjects"
                options={CHORD_CATALOG.map((chord) => ({ value: chord.id, label: chord.name }))}
              />
            </Field>

            <Field label="Availability" hint="Pick the windows you usually study. Optional.">
              <CheckboxGroup
                name="availability"
                options={[
                  { value: "0|17:00|21:00", label: "Sun 5–9pm" },
                  { value: "2|18:00|21:00", label: "Tue 6–9pm" },
                  { value: "4|16:00|19:00", label: "Thu 4–7pm" },
                  { value: "6|09:00|13:00", label: "Sat 9am–1pm" },
                ]}
              />
            </Field>

            <Field label="Short bio (optional)">
              <Textarea name="bio" maxLength={280} placeholder="What are you working on?" />
            </Field>

            <SubmitButton>Create account</SubmitButton>
          </form>
        </Card>
      </section>
    </div>
  );
}
