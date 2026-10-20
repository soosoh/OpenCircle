"use client";

import { useActionState, useState } from "react";
import { signInWithPassword, signUp } from "@/lib/api/actions";
import { SubmitButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CheckboxGroup, Field, Select, TextInput, Textarea } from "@/components/ui/Field";
import { CHORD_CATALOG } from "@/config/chords";
import { TIMEZONES } from "@/config/timezones";

/**
 * Sign-up (and, on the Supabase backend, sign-in) form for /login.
 * Presentation only — every credential check happens in the server actions.
 */
export function AuthForm({ passwordAuth }: { passwordAuth: boolean }) {
  const [mode, setMode] = useState<"signin" | "signup">(passwordAuth ? "signin" : "signup");
  const [signInState, signInAction, signInPending] = useActionState(signInWithPassword, {});
  const [signUpState, signUpAction, signUpPending] = useActionState(signUp, {});
  const state = mode === "signin" ? signInState : signUpState;

  return (
    <Card>
      {passwordAuth ? (
        <div className="mb-4 flex gap-2">
          <TabButton active={mode === "signin"} onClick={() => setMode("signin")}>
            Sign in
          </TabButton>
          <TabButton active={mode === "signup"} onClick={() => setMode("signup")}>
            Create account
          </TabButton>
        </div>
      ) : null}

      {state.error ? (
        <p role="alert" className="mb-4 rounded-xl border border-coral/30 bg-coral/10 px-3 py-2 text-sm text-ink">
          {state.error}
        </p>
      ) : null}

      {mode === "signin" ? (
        <form action={signInAction} className="space-y-4">
          <Field label="Email">
            <TextInput name="email" type="email" required maxLength={120} autoComplete="email" placeholder="you@example.com" />
          </Field>
          <Field label="Password">
            <TextInput name="password" type="password" required maxLength={100} autoComplete="current-password" />
          </Field>
          <SubmitButton pending={signInPending}>Sign in</SubmitButton>
        </form>
      ) : (
        <form action={signUpAction} className="space-y-4">
          {passwordAuth ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email">
                <TextInput name="email" type="email" required maxLength={120} autoComplete="email" placeholder="you@example.com" />
              </Field>
              <Field label="Password" hint="At least 6 characters.">
                <TextInput name="password" type="password" required minLength={6} maxLength={100} autoComplete="new-password" />
              </Field>
            </div>
          ) : null}

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

          <SubmitButton pending={signUpPending}>Create account</SubmitButton>
        </form>
      )}
    </Card>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
        active ? "bg-brand text-white" : "text-muted hover:bg-ink/5 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
