"use client";

import { useActionState, useState, useTransition, type FormEvent } from "react";
import { signInWithPassword, signUp } from "@/lib/api/actions";
import { SubmitButton } from "@/components/ui/Button";
import { Select, TextInput, Textarea } from "@/components/ui/Field";
import { ChipCheckbox, FormField } from "@/components/surfaces/FormField";
import { AVAILABILITY_PRESETS, slotLabel, slotValue } from "@/components/surfaces/profileFields";
import { CHORD_CATALOG } from "@/config/chords";
import { TIMEZONES } from "@/config/timezones";
import { MIN_COLLEGE_AGE } from "@/lib/domain/audience";

type Errors = Partial<Record<"email" | "password" | "name" | "age", string>>;

const INVALID = "aria-invalid:border-coral aria-invalid:ring-2 aria-invalid:ring-coral/20";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Mirrors the server's rules so the problem shows beside the field; every action re-checks. */
function validate(data: FormData, mode: "signin" | "signup", passwordAuth: boolean): Errors {
  const errors: Errors = {};
  if (passwordAuth) {
    const email = String(data.get("email") ?? "").trim();
    if (!email) errors.email = "Enter your email.";
    else if (!EMAIL.test(email)) errors.email = "That email does not look right.";
    const password = String(data.get("password") ?? "");
    if (!password) errors.password = mode === "signin" ? "Enter your password." : "Choose a password.";
    else if (mode === "signup" && password.length < 6) errors.password = "Use at least 6 characters.";
  }
  if (mode === "signup") {
    if (!String(data.get("name") ?? "").trim()) errors.name = "Add your name so your point knows who you are.";
    const ageText = String(data.get("age") ?? "").trim();
    const age = Number(ageText);
    if (!ageText || !Number.isInteger(age) || age < 10 || age > 99) errors.age = "Enter an age between 10 and 99.";
    else if (data.get("educationLevel") === "College" && age < MIN_COLLEGE_AGE) {
      errors.age = `College groups are for ${MIN_COLLEGE_AGE} and older. Choose High School or check the age.`;
    }
  }
  return errors;
}

/**
 * Sign-up (and, on the Supabase backend, sign-in) form for /login.
 * Presentation only: every credential check happens in the server actions.
 * Forms submit by hand so a refused sign-up keeps what was typed (React resets
 * a <form action> after it finishes, even when the action returns an error).
 */
export function AuthForm({ passwordAuth }: { passwordAuth: boolean }) {
  const [mode, setMode] = useState<"signin" | "signup">(passwordAuth ? "signin" : "signup");
  const [signInState, signInAction, signInPending] = useActionState(signInWithPassword, {});
  const [signUpState, signUpAction, signUpPending] = useActionState(signUp, {});
  const [, startTransition] = useTransition();
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState(false);
  const [bioLength, setBioLength] = useState(0);

  const state = mode === "signin" ? signInState : signUpState;
  const pending = mode === "signin" ? signInPending : signUpPending;

  function switchMode(next: "signin" | "signup") {
    setMode(next);
    setErrors({});
    setTouched(false);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next = validate(data, mode, passwordAuth);
    setTouched(true);
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    startTransition(() => {
      if (mode === "signin") signInAction(data);
      else signUpAction(data);
    });
  }

  const onChange = (event: FormEvent<HTMLFormElement>) => {
    if (touched) setErrors(validate(new FormData(event.currentTarget), mode, passwordAuth));
  };

  return (
    <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
      {passwordAuth ? (
        <div role="group" aria-label="Account mode" className="mb-6 flex gap-1 rounded-full bg-mist p-1">
          <TabButton active={mode === "signin"} onClick={() => switchMode("signin")}>
            Sign in
          </TabButton>
          <TabButton active={mode === "signup"} onClick={() => switchMode("signup")}>
            Create account
          </TabButton>
        </div>
      ) : null}

      <div>
        <h2 className="font-display text-3xl font-bold tracking-tight text-ink">
          {mode === "signin" ? "Welcome back" : passwordAuth ? "Create your profile" : "Or create your own profile"}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink">
          {mode === "signin"
            ? "Pick up where your point left off."
            : "A profile gets you into a point. You can change any of this later."}
        </p>
      </div>

      {mode === "signin" ? (
        <form key="signin" onSubmit={onSubmit} onChange={onChange} noValidate className="mt-6 space-y-5">
          <FormField label="Email" required error={errors.email}>
            {(p) => (
              <TextInput {...p} name="email" type="email" maxLength={120} autoComplete="email" placeholder="you@example.com" className={INVALID} />
            )}
          </FormField>
          <FormField label="Password" required error={errors.password}>
            {(p) => (
              <TextInput {...p} name="password" type="password" maxLength={100} autoComplete="current-password" placeholder="Your password" className={INVALID} />
            )}
          </FormField>

          <FormError message={state.error} />

          <SubmitButton variant="ink" pending={pending} size="lg" className="min-h-12 w-full" pendingLabel="Signing in…">
            Sign in
          </SubmitButton>
        </form>
      ) : (
        <form key="signup" onSubmit={onSubmit} onChange={onChange} noValidate className="mt-6 space-y-6">
          {passwordAuth ? (
            <div className="grid gap-5">
              <FormField label="Email" required error={errors.email}>
                {(p) => (
                  <TextInput {...p} name="email" type="email" maxLength={120} autoComplete="email" placeholder="you@example.com" className={INVALID} />
                )}
              </FormField>
              <FormField label="Password" required hint="At least 6 characters." error={errors.password}>
                {(p) => (
                  <TextInput {...p} name="password" type="password" maxLength={100} autoComplete="new-password" placeholder="Choose a password" className={INVALID} />
                )}
              </FormField>
            </div>
          ) : null}

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Name" required error={errors.name}>
              {(p) => <TextInput {...p} name="name" maxLength={60} placeholder="Alex Kim" autoComplete="name" className={INVALID} />}
            </FormField>
            <FormField label="Age" required hint="Never shown on member lists." error={errors.age}>
              {(p) => <TextInput {...p} name="age" type="number" min={10} max={99} inputMode="numeric" placeholder="17" className={INVALID} />}
            </FormField>
            <FormField label="Education level" hint="Keeps high-school and college points separate.">
              {(p) => (
                <Select {...p} name="educationLevel" defaultValue="High School">
                  <option>High School</option>
                  <option>College</option>
                </Select>
              )}
            </FormField>
            <FormField label="Grade level or year">
              {(p) => <TextInput {...p} name="gradeLevel" placeholder="Grade 11" maxLength={40} />}
            </FormField>
            <FormField label="School" optional>
              {(p) => <TextInput {...p} name="school" maxLength={80} placeholder="Lincoln High" />}
            </FormField>
            <FormField label="Experience level">
              {(p) => (
                <Select {...p} name="experienceLevel" defaultValue="Beginner">
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                  <option>Expert</option>
                </Select>
              )}
            </FormField>
          </div>

          <FormField label="Timezone" hint="Used to show meetings and deadlines in your local time.">
            {(p) => (
              <Select {...p} name="timezone" defaultValue="America/New_York">
                {TIMEZONES.map((zone) => (
                  <option key={zone}>{zone}</option>
                ))}
              </Select>
            )}
          </FormField>

          <fieldset>
            <legend className="mb-1.5 text-sm font-semibold text-ink">Subjects you are interested in</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {CHORD_CATALOG.map((chord) => (
                <ChipCheckbox key={chord.id} name="subjects" value={chord.id} label={chord.name} dot={chord.color} />
              ))}
            </div>
          </fieldset>

          <fieldset aria-describedby="signup-availability-hint">
            <legend className="mb-1.5 text-sm font-semibold text-ink">
              Study windows <span className="ml-1 text-xs font-normal text-muted">optional</span>
            </legend>
            <p id="signup-availability-hint" className="mb-3 text-xs leading-snug text-muted">
              When you usually study. Only you see these.
            </p>
            <div className="flex flex-wrap gap-2">
              {AVAILABILITY_PRESETS.map((slot) => (
                <ChipCheckbox key={slotValue(slot)} name="availability" value={slotValue(slot)} label={slotLabel(slot)} />
              ))}
            </div>
          </fieldset>

          <FormField label="Short bio" optional hint={`${bioLength} of 280 characters.`}>
            {(p) => (
              <Textarea
                {...p}
                name="bio"
                maxLength={280}
                placeholder="What are you working on?"
                onChange={(event) => setBioLength(event.currentTarget.value.length)}
              />
            )}
          </FormField>

          <FormError message={state.error} />

          <SubmitButton variant="ink" pending={pending} size="lg" className="min-h-12 w-full" pendingLabel="Creating your profile…">
            Create account
          </SubmitButton>
        </form>
      )}
    </div>
  );
}

function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-xl border border-coral/40 bg-coral-soft px-4 py-3 text-sm font-semibold leading-snug text-ink">
      {message}
    </p>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-11 flex-1 rounded-full px-4 text-sm font-semibold transition-colors duration-200 ease-out-quart active:scale-[0.98] ${
        active ? "bg-ink text-white" : "text-ink hover:bg-surface"
      }`}
    >
      {children}
    </button>
  );
}
