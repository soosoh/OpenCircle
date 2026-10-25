"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/ui/Button";
import { endPointMeeting, fetchPointMeetingTranscript } from "@/lib/api/actions";

/** Structural mirror of the state returned by the meeting actions in lib/api/actions.ts. */
interface MeetingActionState {
  error?: string;
  ended?: boolean;
  transcript?: string;
}

const INITIAL_STATE: MeetingActionState = {};

/** Moderator-only controls: end the meeting (returning its transcript) or fetch the transcript. */
export function MeetingTranscriptPanel({ pointId }: { pointId: string }) {
  const [endState, endAction, endPending] = useActionState(endPointMeeting.bind(null, pointId), INITIAL_STATE);
  const [fetchState, fetchAction, fetchPending] = useActionState(
    fetchPointMeetingTranscript.bind(null, pointId),
    INITIAL_STATE,
  );

  const error = endState.error ?? fetchState.error;
  const transcript = endState.transcript ?? fetchState.transcript;
  const ended = endState.ended === true;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <form
          action={endAction}
          onSubmit={(event) => {
            if (!window.confirm("End the meeting for everyone?")) event.preventDefault();
          }}
        >
          <SubmitButton variant="danger" pending={endPending} pendingLabel="Ending…" className="min-h-10">
            End meeting
          </SubmitButton>
        </form>
        <form action={fetchAction}>
          <SubmitButton variant="secondary" pending={fetchPending} pendingLabel="Fetching…" className="min-h-10">
            Fetch transcript
          </SubmitButton>
        </form>
      </div>

      <div role="status" aria-live="polite" className="space-y-1">
        {ended ? <p className="text-sm font-medium text-ink">The meeting has ended.</p> : null}
        {error ? <p className="text-sm text-coral">{error}</p> : null}
      </div>

      {transcript ? (
        <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-xl border border-line bg-paper p-4 font-mono text-sm leading-6 text-ink/80">
          {transcript}
        </pre>
      ) : ended ? (
        <p className="text-sm text-muted">No transcript is available for this meeting yet.</p>
      ) : null}
    </div>
  );
}
