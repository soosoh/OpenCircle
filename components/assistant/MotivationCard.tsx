"use client";

import { useActionState } from "react";
import { Mascot } from "@/components/landing/mascot";
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
    <SubmitButton pending={pending} size="md" variant="ink" pendingLabel="Thinking…">
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
    <Card className="space-y-3 border-line bg-sun-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-paper"
          >
            <Mascot mood="wink" color="#C4462A" className="size-7 animate-bob" />
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-lg font-bold tracking-tight text-ink">
              A word of encouragement
            </h3>
            <p className="text-sm text-ink">A nudge built from your own points and goals.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {state.live === undefined ? null : state.live ? (
            <Badge tone="brand">Live model</Badge>
          ) : (
            <Badge tone="muted">Mock response (AI off)</Badge>
          )}
          <form action={formAction}>
            <NudgeButton pending={pending} />
          </form>
        </div>
      </div>

      {state.error ? (
        <p role="alert" className="rounded-xl border border-coral/30 bg-coral/10 px-3 py-2 text-sm text-coral">
          {state.error}
        </p>
      ) : null}

      {state.message ? (
        <p className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink">{state.message}</p>
      ) : null}
    </Card>
  );
}
