"use client";

import { useFormStatus } from "react-dom";
import { SubmitButton } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { Goal } from "@/types";

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
    <form action={action} className="flex flex-wrap items-center gap-2 rounded-xl border border-line p-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">Your progress</p>
        <div className="mt-1.5">
          <ProgressBar value={assignment.progress} label="Your progress" />
        </div>
      </div>
      <input
        type="number"
        name="progress"
        min={0}
        max={100}
        defaultValue={assignment.progress}
        className="w-20 rounded-lg border border-line bg-surface px-2 py-1 text-sm"
        aria-label="Progress percent"
      />
      <select
        name="status"
        defaultValue={assignment.status}
        className="rounded-lg border border-line bg-surface px-2 py-1 text-sm"
        aria-label="Status"
      >
        <option>On track</option>
        <option>Needs assistance</option>
        <option>Completed</option>
      </select>
      <ProgressSubmit />
    </form>
  );
}

function ProgressSubmit() {
  const { pending } = useFormStatus();
  return (
    <SubmitButton size="sm" pending={pending}>
      Save
    </SubmitButton>
  );
}
