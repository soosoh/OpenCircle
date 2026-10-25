import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import type { Message, MessageKind, User } from "@/types";

const KIND_TONES: Record<MessageKind, { tone: "muted" | "sun" | "mint"; label: string }> = {
  message: { tone: "muted", label: "" },
  question: { tone: "sun", label: "Question" },
  resource: { tone: "mint", label: "Resource" },
};

/** One chat bubble. Own messages sit on the right in the sun-soft tone. */
export function ChatMessage({
  message,
  sender,
  compact = false,
  mine = false,
}: {
  message: Message | { content: string; timestamp: string };
  sender?: User;
  compact?: boolean;
  mine?: boolean;
}) {
  const kind = "kind" in message ? message.kind : "message";
  const meta = KIND_TONES[kind as MessageKind];
  const sent = new Date(message.timestamp);
  const time = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(sent);
  const who = mine ? "You" : sender?.name;

  return (
    <article className={`flex gap-2.5 ${mine ? "flex-row-reverse" : ""} ${compact ? "py-2" : "py-3"}`}>
      {sender && !mine ? <Avatar name={sender.name} color={sender.avatarColor} size={30} className="mt-5" /> : null}
      <div className={`flex min-w-0 max-w-[85%] flex-col ${mine ? "items-end" : "items-start"}`}>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 px-1">
          {who ? <span className="text-[13px] font-semibold text-ink">{who}</span> : null}
          <time dateTime={sent.toISOString()} className="text-[11px] text-muted">
            {time}
          </time>
          {meta.label ? <Badge tone={meta.tone}>{meta.label}</Badge> : null}
        </div>
        <div
          className={`mt-1.5 rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${
            mine
              ? "rounded-tr-md border border-sun-deep/40 bg-sun-soft text-ink"
              : "rounded-tl-md border border-line bg-surface text-ink"
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
      </div>
    </article>
  );
}
