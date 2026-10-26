import { MascotNote } from "@/components/chord/MascotNote";
import { MessageInput } from "@/components/chat/MessageInput";
import { ChatMessage } from "@/components/chat/ChatMessage";
import type { Message, User } from "@/types";

/** Point chat panel: member-to-member messages plus resource sharing. */
export function PointChat({
  messages,
  users,
  action,
  canPost,
  viewerId,
}: {
  messages: Message[];
  users: User[];
  /** Server action bound to this point. */
  action: (formData: FormData) => void | Promise<void>;
  canPost: boolean;
  viewerId?: string;
}) {
  const byId = new Map(users.map((u) => [u.id, u]));

  return (
    <section aria-labelledby="point-chat-heading" className="flex flex-col rounded-2xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 id="point-chat-heading" className="font-display text-xl font-bold tracking-tight text-ink">
            Point chat
          </h2>
          <p className="mt-0.5 text-sm text-muted">Questions and resources stay with the point.</p>
        </div>
        <span className="tnum rounded-full bg-mist px-3 py-1 text-xs font-bold text-ink">
          {messages.length} {messages.length === 1 ? "message" : "messages"}
        </span>
      </div>

      {/* column-reverse keeps the scroller pinned to the newest message with no script. */}
      <div
        role="log"
        aria-live="polite"
        aria-label="Point chat messages"
        className="mt-4 flex max-h-[28rem] min-h-40 flex-col-reverse overflow-y-auto scroll-thin rounded-xl bg-paper px-3 py-2"
      >
        <div>
          {messages.length === 0 ? (
            <MascotNote
              mood="wink"
              title="It is quiet in here."
              hint="Ask a question or share a resource to start the conversation."
              bare
              className="py-3"
            />
          ) : (
            messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                sender={byId.get(message.senderId)}
                compact
                mine={message.senderId === viewerId}
              />
            ))
          )}
        </div>
      </div>

      <div className="mt-4">
        {canPost ? (
          <MessageInput action={action} placeholder="Message your point…" showKinds />
        ) : (
          <p className="rounded-xl bg-sun-wash px-4 py-3 text-sm leading-6 text-ink">
            Join this point to join the conversation.
          </p>
        )}
      </div>
    </section>
  );
}
