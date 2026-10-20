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
    <div className="space-y-4 text-left">
      <div className="flex flex-wrap justify-center gap-2">
        <form
          action={endAction}
          onSubmit={(event) => {
            if (!window.confirm("End the meeting for everyone?")) event.preventDefault();
          }}
        >
          <SubmitButton variant="danger" pending={endPending} pendingLabel="Ending…">
            End meeting
          </SubmitButton>
        </form>
        <form action={fetchAction}>
          <SubmitButton variant="secondary" pending={fetchPending} pendingLabel="Fetching…">
            Fetch transcript
          </SubmitButton>
        </form>
      </div>

      {ended ? <p className="text-sm font-medium text-ink">The meeting has ended.</p> : null}
      {error ? <p className="text-sm text-coral">{error}</p> : null}

      {transcript ? (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold tracking-tight">Meeting transcript</h3>
          <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-xl border border-line bg-paper px-4 py-3 text-sm text-ink">
            {transcript}
          </pre>
        </div>
      ) : ended ? (
        <p className="text-sm text-muted">No transcript is available for this meeting yet.</p>
      ) : null}
    </div>
  );
}
