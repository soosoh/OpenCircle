"use client";

import { useActionState } from "react";
import { Badge } from "@/components/ui/Badge";
import { SubmitButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type MotivationState = {
  error?: string;
  message?: string;
  live?: boolean;
};

type MotivationAction = (prev: MotivationState, formData: FormData) => Promise<MotivationState>;

function NudgeButton({ pending }: { pending: boolean }) {
  return (
    <SubmitButton pending={pending} size="sm" variant="secondary" pendingLabel="Thinking…">
      Get encouragement
    </SubmitButton>
  );
}

/**
 * On-demand encouragement built from the viewer's own points and goals. Called from a
 * button, never on page load, because the free model tier allows tens of requests a day.
 */
export function MotivationCard({ action }: { action: MotivationAction }) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <Card className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold tracking-tight">A word of encouragement</h3>
        {state.live === undefined ? null : state.live ? (
          <Badge tone="brand">Live model</Badge>
        ) : (
          <Badge tone="sun">Mock response (AI off)</Badge>
        )}
      </div>

      <form action={formAction}>
        <NudgeButton pending={pending} />
      </form>

      {state.error ? (
        <p role="alert" className="rounded-xl border border-coral/40 bg-coral/8 px-3 py-2 text-sm text-coral">
          {state.error}
        </p>
      ) : null}

      {state.message ? (
        <p className="rounded-xl border border-line bg-brand/5 px-4 py-3 text-sm">{state.message}</p>
      ) : null}
    </Card>
  );
}
