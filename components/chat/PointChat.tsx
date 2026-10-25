import { Card } from "@/components/ui/Card";
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
    <Card className="flex h-full flex-col">
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-line pb-3">
        <div>
          <h2 className="font-display text-lg font-bold tracking-tight text-ink">Point chat</h2>
          <p className="mt-0.5 text-xs text-muted">Questions and resources stay with the point.</p>
        </div>
        <span className="tnum text-xs text-muted">
          {messages.length} {messages.length === 1 ? "message" : "messages"}
        </span>
      </div>

      <div
        role="log"
        aria-live="polite"
        aria-label="Point chat messages"
        className="max-h-96 flex-1 overflow-y-auto py-2 pr-1"
      >
        {messages.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line bg-paper px-4 py-8 text-center">
            <p className="text-sm font-medium text-ink">No messages yet</p>
            <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-muted">
              Ask a question or share a resource to start the conversation.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessageRow
              key={message.id}
              message={message}
              sender={byId.get(message.senderId)}
              mine={message.senderId === viewerId}
            />
          ))
        )}
      </div>

      <div className="mt-4 border-t border-line pt-4">
        {canPost ? (
          <MessageInput action={action} placeholder="Message your point…" showKinds />
        ) : (
          <p className="text-sm leading-6 text-muted">Join this point to join the conversation.</p>
        )}
      </div>
    </Card>
  );
}

function ChatMessageRow({ message, sender, mine }: { message: Message; sender?: User; mine: boolean }) {
  return <ChatMessage message={message} sender={sender} compact mine={mine} />;
}
