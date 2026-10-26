import type { ReactNode } from "react";
import { Lock } from "lucide-react";

/**
 * What a visitor sees where the point chat would be. It holds no messages: the page
 * never fetches them for a non-member, so there is nothing here to leak.
 */
export function LockedChat({ action }: { action?: ReactNode }) {
  return (
    <section
      aria-labelledby="point-chat-heading"
      className="flex flex-col items-start gap-3 rounded-2xl border border-line bg-surface p-5 sm:flex-row sm:items-center sm:gap-4"
    >
      <span
        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sage text-mint"
        aria-hidden="true"
      >
        <Lock size={18} strokeWidth={2.25} />
      </span>
      <div className="min-w-0 flex-1">
        <h2 id="point-chat-heading" className="font-display text-xl font-bold tracking-tight text-ink">
          Point chat
        </h2>
        <p className="mt-0.5 text-sm leading-6 text-ink">
          The chat is for members of this point. Join to read it and say hello.
        </p>
      </div>
      {action ? <div className="flex flex-wrap gap-2">{action}</div> : null}
    </section>
  );
}
