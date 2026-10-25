import type { ReactNode } from "react";

export type Tone = "brand" | "mint" | "sun" | "coral" | "muted";

const TONES: Record<Tone, string> = {
  brand: "bg-sun text-ink",
  mint: "bg-sage text-[#2F5D3A]",
  sun: "bg-[#FFF1B8] text-[#6B5410]",
  coral: "bg-[#FBE3DC] text-[#8E3520]",
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
