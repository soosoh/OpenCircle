"use client";

import { useId, useState } from "react";
import { useFormStatus } from "react-dom";
import { SubmitButton } from "@/components/ui/Button";
import { Select, TextInput } from "@/components/ui/Field";
import type { GoalStatus } from "@/types";

/**
 * Inline progress editor for one member. Validation sits next to the fields;
 * the server action still re-checks permissions and clamps the value.
 */
export function ProgressUpdateForm({
  action,
  memberId,
  memberName,
  status,
  progress,
}: {
  action: (formData: FormData) => void | Promise<void>;
  memberId: string;
  memberName: string;
  status: GoalStatus;
  progress: number;
}) {
  const [error, setError] = useState<string | null>(null);
  const uid = useId();
  const errorId = `${uid}-error`;
  const statusId = `${uid}-status`;
  const progressId = `${uid}-progress`;

  return (
    <form
      action={action}
      noValidate
      onSubmit={(event) => {
        const value = String(new FormData(event.currentTarget).get("progress") ?? "").trim();
        const parsed = Number(value);
        if (value === "" || Number.isNaN(parsed) || parsed < 0 || parsed > 100) {
          event.preventDefault();
          setError("Enter a number from 0 to 100.");
          return;
        }
        setError(null);
      }}
      className="space-y-2"
    >
      <input type="hidden" name="userId" value={memberId} />
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor={statusId} className="mb-1 block text-xs font-semibold text-ink">
            Status
          </label>
          <div className="w-44">
            <Select id={statusId} name="status" defaultValue={status} className="min-h-10 py-2 text-sm">
              <option>On track</option>
              <option>Needs assistance</option>
              <option>Completed</option>
            </Select>
          </div>
        </div>
        <div>
          <label htmlFor={progressId} className="mb-1 block text-xs font-semibold text-ink">
            Progress %
          </label>
          <div className="w-24">
            <TextInput
              id={progressId}
              name="progress"
              type="number"
              inputMode="numeric"
              min={0}
              max={100}
              defaultValue={progress}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
              className="min-h-10 py-2 text-sm aria-invalid:border-coral aria-invalid:ring-2 aria-invalid:ring-coral/20"
            />
          </div>
        </div>
        <UpdateSubmit memberName={memberName} />
      </div>
      {error ? (
        <p id={errorId} role="alert" className="text-xs font-semibold text-coral">
          {error}
        </p>
      ) : null}
    </form>
  );
}

function UpdateSubmit({ memberName }: { memberName: string }) {
  const { pending } = useFormStatus();
  return (
    <SubmitButton variant="ink" size="sm" pending={pending} pendingLabel="Saving…" className="min-h-10 px-4">
      Update<span className="sr-only"> progress for {memberName}</span>
    </SubmitButton>
  );
}
