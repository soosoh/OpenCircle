import type { PrivateMessage } from "@/types";

/**
 * A single private message between a moderator and a point member.
 * Renders just the bubble; the surrounding thread is SupportChat's job.
 */
export function PrivateMessage({ message, mine }: { message: PrivateMessage; mine: boolean }) {
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[80%] rounded-2xl px-3 py-2 ${mine ? "bg-brand text-white" : "bg-ink/5"}`}>
        <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>
        <p className={`mt-1 text-[11px] ${mine ? "text-white/70" : "text-muted"}`}>
          {new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(message.timestamp))}
        </p>
      </div>
    </div>
  );
}
