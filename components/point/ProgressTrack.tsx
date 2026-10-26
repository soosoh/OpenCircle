/**
 * A progress track used by goal rows and member summaries. The fill is the
 * true ratio; numbers are always rendered separately so the percentage stays
 * readable.
 */
export function ProgressTrack({
  value,
  label,
  tone = "ink",
  size = "sm",
}: {
  value: number;
  label: string;
  tone?: "ink" | "mint";
  size?: "sm" | "md";
}) {
  const clamped = Math.min(100, Math.max(0, Math.round(value)));

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={`w-full overflow-hidden rounded-full bg-line ${size === "md" ? "h-2.5" : "h-1.5"}`}
    >
      <div
        className={`h-full rounded-full transition-[width] duration-500 ease-out-expo ${tone === "mint" ? "bg-mint" : "bg-ink"}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
