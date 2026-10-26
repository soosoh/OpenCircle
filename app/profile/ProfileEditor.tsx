"use client";

import { useState, useTransition, type FormEvent } from "react";
import { SubmitButton } from "@/components/ui/Button";
import { Select, TextInput, Textarea } from "@/components/ui/Field";
import { ChipCheckbox, FormField } from "@/components/surfaces/FormField";
import { availabilityOptions } from "@/components/surfaces/profileFields";
import { CHORD_CATALOG } from "@/config/chords";
import { TIMEZONES } from "@/config/timezones";
import { MIN_COLLEGE_AGE } from "@/lib/domain/audience";
import type { AvailabilitySlot, EducationLevel, ExperienceLevel } from "@/types";
import { saveProfile } from "./actions";
import type { ProfileSaveState } from "./state";

type Initial = {
  name: string;
  age: number;
  educationLevel: EducationLevel;
  gradeLevel: string;
  school: string;
  experienceLevel: ExperienceLevel;
  timezone: string;
  bio: string;
  subjects: string[];
  availability: AvailabilitySlot[];
};

type Errors = Partial<Record<"name" | "age" | "gradeLevel", string>>;

const BIO_MAX = 280;
const INVALID = "aria-invalid:border-coral aria-invalid:ring-2 aria-invalid:ring-coral/20";

/** Mirrors parseProfileForm so the member sees the problem beside the field; the server re-checks everything. */
function validate(data: FormData): Errors {
  const errors: Errors = {};
  if (!String(data.get("name") ?? "").trim()) errors.name = "Add your name so your point knows who you are.";
  const ageText = String(data.get("age") ?? "").trim();
  const age = Number(ageText);
  if (!ageText || !Number.isInteger(age) || age < 10 || age > 99) {
    errors.age = "Enter an age between 10 and 99.";
  } else if (data.get("educationLevel") === "College" && age < MIN_COLLEGE_AGE) {
    errors.age = `College groups are for ${MIN_COLLEGE_AGE} and older. Switch to High School or check the age.`;
  }
  return errors;
}

/**
 * Edits the member's own profile. The write goes through `saveProfile`, which wraps the
 * updateProfile server action (session, validation and audience re-checks all live there).
 * Submitting by hand rather than through <form action> keeps what you typed when a save
 * is refused: React would otherwise reset the form after a failed action.
 */
export function ProfileEditor({
  initial,
  onSaved,
  onCancel,
}: {
  initial: Initial;
  /** Called after the server accepted the save (the dialog closes itself). */
  onSaved?: () => void;
  /** Shows a Cancel button beside Save when the editor lives in a dialog. */
  onCancel?: () => void;
}) {
  const [errors, setErrors] = useState<Errors>({});
  const [result, setResult] = useState<ProfileSaveState>({});
  const [touched, setTouched] = useState(false);
  const [pending, startTransition] = useTransition();
  const [bioLength, setBioLength] = useState(initial.bio.length);

  const zones = TIMEZONES.includes(initial.timezone) ? TIMEZONES : [initial.timezone, ...TIMEZONES];
  const slots = availabilityOptions(initial.availability);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next = validate(data);
    setTouched(true);
    setErrors(next);
    setResult({});
    if (Object.keys(next).length > 0) return;
    startTransition(async () => {
      const saved = await saveProfile(data);
      setResult(saved);
      if (saved.ok) onSaved?.();
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      onChange={(event) => {
        // Once someone has tried to save, errors update as they fix them.
        if (touched) setErrors(validate(new FormData(event.currentTarget)));
        if (result.ok || result.error) setResult({});
      }}
      className="space-y-8"
    >
      <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
        <FormField label="Name" required error={errors.name}>
          {(p) => (
            <TextInput {...p} name="name" defaultValue={initial.name} maxLength={60} autoComplete="name" className={INVALID} />
          )}
        </FormField>
        <FormField
          label="Age"
          required
          hint="Keeps high-school and college points separate. Never shown to other members."
          error={errors.age}
        >
          {(p) => (
            <TextInput
              {...p}
              name="age"
              type="number"
              inputMode="numeric"
              min={10}
              max={99}
              defaultValue={initial.age}
              className={INVALID}
            />
          )}
        </FormField>
        <FormField
          label="Education level"
          hint="Changing this or your age re-checks every chord and point you are in."
        >
          {(p) => (
            <Select {...p} name="educationLevel" defaultValue={initial.educationLevel}>
              <option>High School</option>
              <option>College</option>
            </Select>
          )}
        </FormField>
        <FormField label="Grade level or year">
          {(p) => (
            <TextInput {...p} name="gradeLevel" defaultValue={initial.gradeLevel} maxLength={40} placeholder="Grade 11" />
          )}
        </FormField>
        <FormField label="School" optional hint="Only you see this.">
          {(p) => <TextInput {...p} name="school" defaultValue={initial.school} maxLength={80} placeholder="Lincoln High" />}
        </FormField>
        <FormField label="Experience level">
          {(p) => (
            <Select {...p} name="experienceLevel" defaultValue={initial.experienceLevel}>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
              <option>Expert</option>
            </Select>
          )}
        </FormField>
        <FormField
          label="Timezone"
          hint="Meetings and deadlines show in your local time."
          className="sm:col-span-2"
        >
          {(p) => (
            <Select {...p} name="timezone" defaultValue={initial.timezone}>
              {zones.map((zone) => (
                <option key={zone}>{zone}</option>
              ))}
            </Select>
          )}
        </FormField>
        <FormField
          label="Short bio"
          optional
          hint={`${bioLength} of ${BIO_MAX} characters. Other members can read this.`}
          className="sm:col-span-2"
        >
          {(p) => (
            <Textarea
              {...p}
              name="bio"
              defaultValue={initial.bio}
              maxLength={BIO_MAX}
              placeholder="What are you working on?"
              onChange={(event) => setBioLength(event.currentTarget.value.length)}
            />
          )}
        </FormField>
      </div>

      <fieldset aria-describedby="subjects-hint">
        <legend className="mb-1.5 text-sm font-semibold text-ink">Subjects you are interested in</legend>
        <p id="subjects-hint" className="mb-3 text-xs leading-snug text-muted">
          Interests only. Joining or leaving a chord happens on its chord page.
        </p>
        <div className="flex flex-wrap gap-2">
          {CHORD_CATALOG.map((chord) => (
            <ChipCheckbox
              key={chord.id}
              name="subjects"
              value={chord.id}
              label={chord.name}
              dot={chord.color}
              defaultChecked={initial.subjects.includes(chord.id)}
            />
          ))}
        </div>
      </fieldset>

      <fieldset aria-describedby="availability-hint">
        <legend className="mb-1.5 text-sm font-semibold text-ink">Study windows</legend>
        <p id="availability-hint" className="mb-3 text-xs leading-snug text-muted">
          When you usually study, in {initial.timezone}. Only you see these.
        </p>
        <div className="flex flex-wrap gap-2">
          {slots.map((slot) => (
            <ChipCheckbox key={slot.value} name="availability" value={slot.value} label={slot.label} defaultChecked={slot.checked} />
          ))}
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-line pt-5">
        <SubmitButton variant="ink" size="lg" pending={pending} pendingLabel="Saving…" className="min-h-11 min-w-36">
          Save profile
        </SubmitButton>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold text-ink transition-colors hover:bg-sun-wash"
          >
            Cancel
          </button>
        ) : null}
        <div aria-live="polite" className="min-w-0 flex-1 text-sm">
          {result.ok ? (
            <p role="status" className="inline-flex items-center gap-2 rounded-full bg-sage px-3 py-1.5 font-semibold text-sage-ink">
              Saved. Your profile is up to date.
            </p>
          ) : null}
          {result.error ? (
            <p role="alert" className="font-semibold leading-snug text-coral">
              {result.error}
            </p>
          ) : null}
          {Object.keys(errors).length > 0 ? (
            <p className="font-medium text-ink">Fix the highlighted {Object.keys(errors).length === 1 ? "field" : "fields"} to save.</p>
          ) : null}
        </div>
      </div>
    </form>
  );
}
