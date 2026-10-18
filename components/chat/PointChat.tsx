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
}: {
  messages: Message[];
  users: User[];
  /** Server action bound to this point. */
  action: (formData: FormData) => void | Promise<void>;
  canPost: boolean;
}) {
  const byId = new Map(users.map((u) => [u.id, u]));

  return (
    <Card className="flex h-full flex-col">
      <h3 className="mb-3 font-semibold tracking-tight">Point chat</h3>

      <div className="max-h-96 flex-1 space-y-1 overflow-y-auto pr-1">
        {messages.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">No messages yet. Say hello.</p>
        ) : (
          messages.map((message) => <ChatMessageRow key={message.id} message={message} sender={byId.get(message.senderId)} />)
        )}
      </div>

      <div className="mt-4 border-t border-line pt-4">
        {canPost ? (
          <MessageInput action={action} placeholder="Message your point…" showKinds />
        ) : (
          <p className="text-sm text-muted">Join this point to join the conversation.</p>
        )}
      </div>
    </Card>
  );
}

function ChatMessageRow({ message, sender }: { message: Message; sender?: User }) {
  return (
    <div className="border-b border-line/60 last:border-0">
      <ChatMessage message={message} sender={sender} compact />
    </div>
  );
}
