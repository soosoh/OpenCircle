import type { ReactNode } from "react";

export type Tone = "brand" | "mint" | "sun" | "coral" | "muted";

const TONES: Record<Tone, string> = {
  brand: "bg-sun text-ink",
  mint: "bg-sage text-sage-ink",
  sun: "bg-sun-soft text-sun-ink",
  coral: "bg-coral-soft text-coral-ink",
  muted: "bg-mist text-muted",
};

/** Small pill used for statuses, audiences, and tags. */
export function Badge({
  children,
  tone = "muted",
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
