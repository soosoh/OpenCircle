"use client";

import { useState } from "react";
import { HelpRequest } from "@/components/chat/HelpRequest";
import { Button } from "@/components/ui/Button";

/**
 * Support request panel. Coral marks the moment without dressing it up as an
 * emergency service: one sentence explains who sees the note, and sending is
 * an explicit action.
 */
export function SOSButton({
  action,
  canRequest,
  openRequests,
}: {
  action: (formData: FormData) => void | Promise<void>;
  canRequest: boolean;
  /** Number of open requests in this point. */
  openRequests: number;
}) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!canRequest) {
    return (
      <p className="rounded-2xl border border-coral/30 bg-[#FBE3DC] px-4 py-3 text-sm text-[#8E3520]">
        Join this point to ask for support.
      </p>
    );
  }

  async function handleSubmit(formData: FormData) {
    setError(null);
    try {
      await action(formData);
      setOpen(false);
      setSent(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Your note could not be sent. Try again.");
    }
  }

  return (
    <section
      aria-labelledby="support-heading"
      className="rounded-2xl border border-coral/30 bg-[#FBE3DC] p-5 text-[#8E3520]"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-lg">
          <h2 id="support-heading" className="font-display text-lg font-bold tracking-tight">
            Need a hand with this point?
          </h2>
          <p className="mt-1 text-sm leading-6 text-[#8E3520]/85">
            Say what you are stuck on. Everyone in this point sees your note, and your moderator can mark it
            resolved.
          </p>
          {openRequests > 0 ? (
            <p className="tnum mt-1.5 text-xs text-[#8E3520]/70">
              {openRequests} open {openRequests === 1 ? "request" : "requests"} in this point.
            </p>
          ) : null}
        </div>
        <Button
          variant="danger"
          onClick={() => {
            setOpen((value) => !value);
            setSent(false);
          }}
          aria-expanded={open}
          aria-controls="support-form"
        >
          {open ? "Cancel" : sent ? "Send another note" : "Ask for support"}
        </Button>
      </div>

      {open ? (
        <div id="support-form" className="mt-4">
          <HelpRequest action={handleSubmit} />
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="mt-3 rounded-xl border border-coral/40 bg-surface px-3 py-2 text-sm">
          {error}
        </p>
      ) : null}

      {sent && !open ? (
        <p role="status" className="mt-4 rounded-xl border border-coral/25 bg-surface px-3 py-2 text-sm">
          Your request is open. Everyone in this point can see it now.
        </p>
      ) : null}
    </section>
  );
}
