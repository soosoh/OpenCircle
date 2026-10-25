"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { SubmitButton } from "@/components/ui/Button";
import { Field, TextInput, Textarea } from "@/components/ui/Field";

type Errors = { title?: string; deadline?: string };

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

  return (
    <form
      action={action}
      noValidate
      onSubmit={(event) => {
        const data = new FormData(event.currentTarget);
        const next: Errors = {};
        if (!String(data.get("title") ?? "").trim()) next.title = "Give the goal a name.";
        if (!String(data.get("deadline") ?? "").trim()) next.deadline = "Choose a deadline.";
        setErrors(next);
        if (next.title || next.deadline) event.preventDefault();
      }}
      className="space-y-4"
    >
      <Field label="Goal title">
        <TextInput
          name="title"
          required
          maxLength={120}
          placeholder="Finish Biology Chapter 5"
          aria-invalid={errors.title ? true : undefined}
          aria-describedby={errors.title ? "goal-title-error" : undefined}
        />
        {errors.title ? (
          <span id="goal-title-error" role="alert" className="mt-1.5 block text-xs font-medium text-coral">
            {errors.title}
          </span>
        ) : null}
      </Field>

      <Field label="What the group should accomplish" hint="Optional, but it helps members know what done looks like.">
        <Textarea name="description" maxLength={500} placeholder="Read Chapter 5 and answer the end-of-chapter questions." className="min-h-20" />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Deadline">
          <TextInput
            type="date"
            name="deadline"
            required
            aria-invalid={errors.deadline ? true : undefined}
            aria-describedby={errors.deadline ? "goal-deadline-error" : undefined}
          />
          {errors.deadline ? (
            <span id="goal-deadline-error" role="alert" className="mt-1.5 block text-xs font-medium text-coral">
              {errors.deadline}
            </span>
          ) : null}
        </Field>
        <Field label="Resources" hint="One per line: a handout, link or worksheet.">
          <Textarea name="resources" placeholder={"Chapter 5 PDF\nPractice set 3"} className="min-h-20" />
        </Field>
      </div>

      <fieldset>
        <legend className="mb-1.5 block text-sm font-semibold text-ink">Assign to</legend>
        <div className="flex flex-wrap gap-2">
          {members.map((member) => (
            <label
              key={member.id}
              className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border border-line bg-surface px-2.5 text-xs font-medium text-ink transition-colors hover:border-ink/25 hover:bg-sun-wash has-checked:border-ink has-checked:bg-sun-soft"
            >
              <input
                type="checkbox"
                name="assignees"
                value={member.id}
                defaultChecked
                className="size-3.5 accent-[#29313D]"
              />
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
    <SubmitButton pending={pending} pendingLabel="Recording…">
      Record goal
    </SubmitButton>
  );
}
