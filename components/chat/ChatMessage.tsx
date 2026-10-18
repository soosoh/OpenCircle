import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import type { Message, MessageKind, User } from "@/types";

const KIND_TONES: Record<MessageKind, { tone: "muted" | "sun" | "mint"; label: string }> = {
  message: { tone: "muted", label: "" },
  question: { tone: "sun", label: "Question" },
  resource: { tone: "mint", label: "Resource" },
};

/** One chat bubble. Used by point chat and by moderator private messaging. */
export function ChatMessage({ message, sender, compact }: { message: Message | { content: string; timestamp: string }; sender?: User; compact?: boolean }) {
  const kind = "kind" in message ? message.kind : "message";
  const meta = KIND_TONES[kind as MessageKind];
  const time = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(message.timestamp));

  return (
    <div className={`flex gap-3 ${compact ? "py-1.5" : "py-2"}`}>
      {sender ? <Avatar name={sender.name} color={sender.avatarColor} size={compact ? 28 : 34} /> : null}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-2">
          {sender ? <span className="text-sm font-semibold">{sender.name}</span> : null}
          <span className="text-xs text-muted">{time}</span>
          {meta.label ? <Badge tone={meta.tone}>{meta.label}</Badge> : null}
        </div>
        <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-ink/90">{message.content}</p>
      </div>
    </div>
  );
}
