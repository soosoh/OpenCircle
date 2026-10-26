"use client";

import { useFormStatus } from "react-dom";
import { SubmitButton } from "@/components/ui/Button";
import type { Goal } from "@/types";

const INPUT =
  "h-10 w-full rounded-xl border border-line bg-surface px-3 text-sm text-ink transition-colors hover:border-ink/25 focus:border-ink/40 focus:outline-none focus:ring-2 focus:ring-sun/50";

/** Lets an assigned member report progress on a goal. */
export function ProgressUpdater({
  goal,
  userId,
  action,
}: {
  goal: Goal;
  userId: string;
  /** Bound server action: (goalId, formData) => … */
  action: (formData: FormData) => void | Promise<void>;
}) {
  const assignment = goal.assignments.find((a) => a.userId === userId);
  if (!assignment) return null;

  return (
    <form action={action} className="grid gap-3 sm:grid-cols-[6rem_minmax(0,1fr)_auto] sm:items-end">
      <label>
        <span className="mb-1.5 block text-xs font-semibold text-ink">Set progress</span>
        <input
          type="number"
          name="progress"
          min={0}
          max={100}
          defaultValue={assignment.progress}
          className={INPUT}
        />
      </label>
      <label>
        <span className="mb-1.5 block text-xs font-semibold text-ink">Status</span>
        <select name="status" defaultValue={assignment.status} className={INPUT}>
          <option>On track</option>
          <option>Needs assistance</option>
          <option>Completed</option>
        </select>
      </label>
      <ProgressSubmit />
    </form>
  );
}

function ProgressSubmit() {
  const { pending } = useFormStatus();
  return (
    <SubmitButton
      variant="ink"
      pending={pending}
      pendingLabel="Saving…"
      className="min-h-10 w-full justify-self-start sm:w-auto sm:justify-self-end"
    >
      Save
    </SubmitButton>
  );
}
