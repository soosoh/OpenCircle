"use client";

import { useFormStatus } from "react-dom";
import { SubmitButton } from "@/components/ui/Button";
import { Field, Select, TextInput, Textarea } from "@/components/ui/Field";
import { AUDIENCE_OPTIONS } from "@/lib/domain/audience";
import { WEEKDAY_NAMES } from "@/lib/domain/time";
import type { Point } from "@/types";

/** Create a point inside a chord. Available to chord members. */
export function CreatePointForm({
  chordId,
  chordAudience,
  action,
}: {
  chordId: string;
  chordAudience: Point["audience"];
  action: (chordId: string, formData: FormData) => Promise<void>;
}) {
  return (
    <form action={action.bind(null, chordId)} className="space-y-4 text-ink">
      <Field label="Point title">
        <TextInput name="title" required maxLength={80} placeholder="AP Biology Genetics Point" />
      </Field>
      <Field label="What is this group about?">
        <Textarea name="description" maxLength={400} placeholder="Weekly session on …" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Meets on">
          <Select name="weekday" defaultValue="0">
            {WEEKDAY_NAMES.map((day, index) => (
              <option key={day} value={index}>
                {day}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="At" hint="In your timezone.">
          <TextInput name="time" type="time" required defaultValue="19:00" />
        </Field>
      </div>
      <Field label="Who can join">
        <Select
          name="audience"
          defaultValue={chordAudience === "all" ? "all" : chordAudience}
          disabled={chordAudience !== "all"}
        >
          {AUDIENCE_OPTIONS.filter((option) => chordAudience === "all" || option.value === chordAudience).map(
            (option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ),
          )}
        </Select>
      </Field>
      {chordAudience !== "all" ? (
        <p className="text-xs leading-5 text-muted">
          This chord is limited to {chordAudience === "college" ? "college students" : "high school students"}.
        </p>
      ) : null}
      <CreateSubmit />
    </form>
  );
}

function CreateSubmit() {
  const { pending } = useFormStatus();
  return (
    <SubmitButton pending={pending} pendingLabel="Creating…" className="min-h-10">
      Create point
    </SubmitButton>
  );
}
