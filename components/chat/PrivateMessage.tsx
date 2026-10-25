import type { PrivateMessage } from "@/types";

/**
 * A single private message between a moderator and a point member.
 * Renders just the bubble; the surrounding thread is SupportChat's job.
 */
export function PrivateMessage({ message, mine }: { message: PrivateMessage; mine: boolean }) {
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 ${
          mine
            ? "rounded-tr-md border border-sun-deep/40 bg-sun-soft text-ink"
            : "rounded-tl-md border border-line bg-surface text-ink"
        }`}
      >
        <p className="whitespace-pre-wrap break-words text-sm leading-6">{message.content}</p>
        <p className="mt-1 text-[11px] text-muted">
          {new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(message.timestamp))}
        </p>
      </div>
    </div>
  );
}
