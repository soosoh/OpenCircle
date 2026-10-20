"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Badge } from "@/components/ui/Badge";
import { SubmitButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type AssistantState = {
  error?: string;
  summary?: { summary: string; completed: string[]; needsSupport: string[]; suggestedGoals: string[] };
  goals?: { title: string; description: string }[];
  source?: "pasted" | "recording";
  live?: boolean;
};

type RunAction = (prev: AssistantState, formData: FormData) => Promise<AssistantState>;
type RecordAction = (formData: FormData) => void | Promise<void>;

function RunButton({ pending }: { pending: boolean }) {
  return (
    <SubmitButton pending={pending} pendingLabel="Reading the notes…">
      Summarize the meeting
    </SubmitButton>
  );
}

function RecordButton({ pending }: { pending: boolean }) {
  return (
    <SubmitButton pending={pending} size="sm" variant="secondary" pendingLabel="Recording…">
      Record this goal
    </SubmitButton>
  );
}

/**
 * Meeting notes in, summary and proposed goals out. The AI only proposes: recording a
 * goal goes through createGoal, which re-checks that the viewer moderates the point.
 */
export function AssistantPanel({
  pointId,
  action,
  recordGoalAction,
  hint,
}: {
  pointId: string;
  action: RunAction;
  recordGoalAction: RecordAction;
  hint: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [transcript, setTranscript] = useState("");
  const [deadline, setDeadline] = useState(() => {
    // Default new goals to one week out. Client component mounted once, so seeding
    // from the clock in the initializer is intentional.
    // eslint-disable-next-line react-hooks/purity
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().slice(0, 10);
  });

  return (
    <Card className="space-y-4" data-assistant={pointId}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold tracking-tight">AI meeting assistant</h3>
        {state.live === undefined ? (
          <Badge tone="muted">AI proposals</Badge>
        ) : state.live ? (
          <Badge tone="brand">Live model</Badge>
        ) : (
          <Badge tone="sun">Mock response (AI off)</Badge>
        )}
      </div>

      <p className="text-sm text-muted">
        Paste what the group covered, decided, or got stuck on. You can also pull the transcript from the
        meeting recording. The AI only proposes — you still choose what to record.
      </p>

      <form action={formAction} className="space-y-3">
        <textarea
          name="transcript"
          value={transcript}
          onChange={(event) => setTranscript(event.target.value)}
          rows={6}
          placeholder="We finished chapters 1-3. Priya got stuck on genetics and wants a walkthrough…"
          className="w-full resize-y rounded-xl border border-line bg-surface px-3 py-2 text-sm"
        />
        <label className="inline-flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" name="useRecording" className="size-4 accent-[#4f46e5]" />
          Use the meeting recording instead of pasting
        </label>
        <div className="flex items-center gap-3">
          <RunButton pending={pending} />
          {hint ? <span className="text-xs text-muted">{hint}</span> : null}
        </div>
      </form>

      {state.error ? (
        <p role="alert" className="rounded-xl border border-coral/40 bg-coral/8 px-3 py-2 text-sm text-coral">
          {state.error}
        </p>
      ) : null}

      {state.summary ? (
        <div className="space-y-4 border-t border-line pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-semibold tracking-tight">Summary</h4>
            <Badge tone="muted">
              {state.source === "recording" ? "From the recording" : "From your notes"}
            </Badge>
          </div>
          <p className="text-sm">{state.summary.summary}</p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h4 className="mb-1 text-sm font-semibold tracking-tight">Completed</h4>
              {state.summary.completed.length === 0 ? (
                <p className="text-sm text-muted">Nothing recorded.</p>
              ) : (
                <ul className="space-y-1 text-sm">
                  {state.summary.completed.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-mint" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <h4 className="mb-1 text-sm font-semibold tracking-tight">Needs support</h4>
              {state.summary.needsSupport.length === 0 ? (
                <p className="text-sm text-muted">No one flagged a blocker.</p>
              ) : (
                <ul className="space-y-1 text-sm">
                  {state.summary.needsSupport.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-coral" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {state.summary.suggestedGoals.length > 0 || (state.goals?.length ?? 0) > 0 ? (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold tracking-tight">Suggested goals</h4>
              <p className="text-xs text-muted">Nothing is recorded until you press the button.</p>
              {state.summary.suggestedGoals.map((goal, index) => (
                <form
                  key={`${pointId}-suggested-${index}`}
                  action={recordGoalAction}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line p-3"
                >
                  <input type="hidden" name="title" value={goal} />
                  <input type="hidden" name="description" value={state.goals?.[index]?.description ?? ""} />
                  <input type="hidden" name="deadline" value={deadline} />
                  <p className="min-w-0 flex-1 text-sm">{goal}</p>
                  <RecordButtonPending />
                </form>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}

function RecordButtonPending() {
  const { pending } = useFormStatus();
  return <RecordButton pending={pending} />;
}
