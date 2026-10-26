"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { SubmitButton } from "@/components/ui/Button";
import { TextInput, Textarea } from "@/components/ui/Field";
import { FormField } from "@/components/surfaces/FormField";

type Errors = { title?: string; deadline?: string };

const INVALID = "aria-invalid:border-coral aria-invalid:ring-2 aria-invalid:ring-coral/20";

/**
 * Goal recorder. Field-level validation is repeated here so the moderator sees
 * the problem next to the field; createGoal still re-checks permission and input.
 */
export function GoalForm({
  action,
  members,
}: {
  action: (formData: FormData) => void | Promise<void>;
  members: { id: string; name: string }[];
}) {
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);

  function check(data: FormData): Errors {
    const next: Errors = {};
    if (!String(data.get("title") ?? "").trim()) next.title = "Give the goal a name.";
    if (!String(data.get("deadline") ?? "").trim()) next.deadline = "Choose a deadline.";
    return next;
  }

  return (
    <form
      action={action}
      noValidate
      onSubmit={(event) => {
        const next = check(new FormData(event.currentTarget));
        setSubmitted(true);
        setErrors(next);
        if (next.title || next.deadline) event.preventDefault();
      }}
      onChange={(event) => {
        if (submitted) setErrors(check(new FormData(event.currentTarget)));
      }}
      className="space-y-5"
    >
      <FormField label="Goal title" required error={errors.title}>
        {(p) => <TextInput {...p} name="title" maxLength={120} placeholder="Finish Biology Chapter 5" className={INVALID} />}
      </FormField>

      <FormField label="What the group should accomplish" optional hint="Helps members know what done looks like.">
        {(p) => (
          <Textarea
            {...p}
            name="description"
            maxLength={500}
            placeholder="Read Chapter 5 and answer the end-of-chapter questions."
            className="min-h-20"
          />
        )}
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <FormField label="Deadline" required error={errors.deadline}>
          {(p) => <TextInput {...p} type="date" name="deadline" className={`min-h-11 ${INVALID}`} />}
        </FormField>
        <FormField label="Resources" optional hint="One per line: a handout, link or worksheet.">
          {(p) => <Textarea {...p} name="resources" placeholder={"Chapter 5 PDF\nPractice set 3"} className="min-h-20" />}
        </FormField>
      </div>

      <fieldset>
        <legend className="mb-1.5 text-sm font-semibold text-ink">Assign to</legend>
        <div className="flex flex-wrap gap-2">
          {members.map((member) => (
            <label
              key={member.id}
              className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-line bg-surface px-3.5 text-sm font-medium text-ink transition-colors duration-150 ease-out-quart hover:border-ink/30 has-checked:border-ink has-checked:bg-sun-soft"
            >
              <input type="checkbox" name="assignees" value={member.id} defaultChecked className="size-4 accent-ink" />
              {member.name}
            </label>
          ))}
          {members.length === 0 ? <p className="text-sm text-muted">No members yet.</p> : null}
        </div>
      </fieldset>

      <GoalSubmit />
    </form>
  );
}

function GoalSubmit() {
  const { pending } = useFormStatus();
  return (
    <SubmitButton variant="ink" size="lg" pending={pending} pendingLabel="Recording…" className="min-h-11 w-full sm:w-auto">
      Record goal
    </SubmitButton>
  );
}
