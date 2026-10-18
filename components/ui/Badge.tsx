export type Tone = "brand" | "mint" | "sun" | "coral" | "muted";

const TONES: Record<Tone, string> = {
  brand: "bg-brand/10 text-brand",
  mint: "bg-mint/12 text-mint",
  sun: "bg-sun/15 text-[#a15c06]",
  coral: "bg-coral/12 text-coral",
  muted: "bg-ink/8 text-muted",
};

/** Small pill used for statuses, audiences, and tags. */
export function Badge({ children, tone = "muted", className = "" }: { children: React.ReactNode; tone?: Tone; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${TONES[tone]} ${className}`}>
      {children}
    </span>
  );
}
