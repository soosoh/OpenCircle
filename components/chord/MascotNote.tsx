import type { ReactNode } from "react";
import { Mascot } from "@/components/landing/mascot";

type Mood = "happy" | "cheer" | "wink" | "peek";

/**
 * A circle mascot with a speech bubble: the designed empty state and the
 * occasional hint. Used sparingly, one per surface at most. The bubble's tail
 * always points at the mascot (left on wide screens, up when stacked).
 */
export function MascotNote({
  title,
  hint,
  action,
  mood = "peek",
  color = "#2E7D5B",
  bare = false,
  className = "",
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
  mood?: Mood;
  color?: string;
  /** Drop the white card around it (when it sits inside another card). */
  bare?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5 ${
        bare ? "" : "rounded-2xl border border-line bg-surface p-5 sm:p-6"
      } ${className}`}
    >
      <Mascot mood={mood} color={color} className="size-20 animate-bob" width={80} height={80} />
      <div className="relative min-w-0 flex-1 rounded-2xl bg-sun-wash px-5 py-4">
        <span
          aria-hidden="true"
          className="absolute -top-1.5 left-9 size-3 rotate-45 border-l border-t border-line bg-sun-wash sm:-left-1.5 sm:top-1/2 sm:-mt-1.5 sm:border-b sm:border-t-0"
        />
        <p className="font-display text-lg font-bold leading-snug tracking-tight text-ink">{title}</p>
        {hint ? <p className="mt-1 text-sm leading-6 text-ink">{hint}</p> : null}
        {action ? <div className="mt-3 flex flex-wrap gap-2">{action}</div> : null}
      </div>
    </div>
  );
}
