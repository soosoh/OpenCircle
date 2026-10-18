"use client";

import { useState } from "react";
import { HelpRequest } from "@/components/chat/HelpRequest";
import { Button } from "@/components/ui/Button";

/** SOS button. Expands into the help request form. */
export function SOSButton({
  action,
  canRequest,
  openRequests,
}: {
  action: (formData: FormData) => void | Promise<void>;
  canRequest: boolean;
  /** Number of open requests from other members. */
  openRequests: number;
}) {
  const [open, setOpen] = useState(false);

  if (!canRequest) {
    return (
      <p className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-muted">
        Join this point to ask for support.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <Button variant="danger" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        {open ? "Close" : "I need support"}
        {openRequests > 0 ? (
          <span className="rounded-full bg-white/25 px-2 py-0.5 text-xs">
            {openRequests} open
          </span>
        ) : null}
      </Button>
      {open ? <HelpRequest action={action} /> : null}
    </div>
  );
}
