"use client";

import { useActionState } from "react";
import { Badge } from "@/components/ui/Badge";
import { SubmitButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type RiskState = {
  error?: string;
  risks?: { userId: string; name: string; risk: "low" | "medium" | "high"; notes: string }[];
  live?: boolean;
};

type RiskAction = (prev: RiskState, formData: FormData) => Promise<RiskState>;

const TONES = { low: "mint", medium: "sun", high: "coral" } as const;

function AnalyzeButton({ pending }: { pending: boolean }) {
  return (
    <SubmitButton pending={pending} size="sm" variant="secondary" pendingLabel="Checking…">
      Analyze students
    </SubmitButton>
  );
}

/**
 * Batched risk check: one model call for the whole point, on demand rather than on page
 * load, because the free model tier allows only tens of requests a day.
 */
export function RiskPanel({ pointId, action }: { pointId: string; action: RiskAction }) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <Card className="space-y-3" data-risk={pointId}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold tracking-tight">Who may need a check-in</h3>
        {state.live === undefined ? null : state.live ? (
          <Badge tone="brand">Live model</Badge>
        ) : (
          <Badge tone="sun">Mock response (AI off)</Badge>
        )}
      </div>

      <p className="text-sm text-muted">
        One request covers everyone in this point. Risk is a prompt for a human check-in, not a verdict.
      </p>

      <form action={formAction}>
        <AnalyzeButton pending={pending} />
      </form>

      {state.error ? (
        <p role="alert" className="rounded-xl border border-coral/40 bg-coral/8 px-3 py-2 text-sm text-coral">
          {state.error}
        </p>
      ) : null}

      {state.risks ? (
        <ul className="space-y-2">
          {state.risks.map((entry) => (
            <li key={entry.userId} className="rounded-xl border border-line p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-medium">{entry.name}</p>
                <Badge tone={TONES[entry.risk]}>{entry.risk} risk</Badge>
              </div>
              {entry.notes ? <p className="mt-1 text-sm text-muted">{entry.notes}</p> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </Card>
  );
}
