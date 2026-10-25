"use client";

import { useState } from "react";
import { MessageInput } from "@/components/chat/MessageInput";
import { PrivateMessage } from "@/components/chat/PrivateMessage";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { PrivateMessage as PrivateMessageRecord, User } from "@/types";

/**
 * Private moderator/student thread, collapsed by default so it does not crowd a page.
 * Members can only reply; moderators can start a thread with any member.
 */
export function SupportChat({
  thread,
  other,
  viewerId,
  action,
  canStart,
  recipientId,
}: {
  thread: PrivateMessageRecord[];
  other: User;
  viewerId: string;
  action: (formData: FormData) => void | Promise<void>;
  /** Only moderators may open a new thread. */
  canStart: boolean;
  recipientId: string;
}) {
  const [open, setOpen] = useState(thread.length === 0 && canStart);
  const last = thread[thread.length - 1];

  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex min-h-11 w-full items-center gap-3 text-left"
      >
        <Avatar name={other.name} color={other.avatarColor} size={32} />
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-semibold text-ink">{other.name}</span>
          <span className="mt-0.5 block truncate text-xs text-muted">
            {last ? last.content : "No messages yet"}
          </span>
        </span>
        <span className="shrink-0 text-xs font-semibold text-muted">{open ? "Hide" : "Open"}</span>
      </button>

      {open ? (
        <div className="mt-4 space-y-2 border-t border-line pt-4">
          {thread.length === 0 ? (
            <p className="py-3 text-center text-sm text-muted">
              {canStart ? "Start a private conversation." : "No messages yet. Your moderator can start this thread."}
            </p>
          ) : (
            thread.map((message) => (
              <PrivateMessage key={message.id} message={message} mine={message.senderId === viewerId} />
            ))
          )}

          {canStart || thread.length > 0 ? (
            <div className="pt-2">
              <MessageInput
                action={action}
                placeholder={`Message ${other.name}…`}
                hiddenFields={{ recipientId }}
              />
            </div>
          ) : (
            <Button variant="secondary" size="sm" disabled className="mt-2 min-h-10">
              Only the moderator can start this thread
            </Button>
          )}
        </div>
      ) : null}
    </Card>
  );
}
