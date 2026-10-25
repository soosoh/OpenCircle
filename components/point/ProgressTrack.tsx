/**
 * A 6px progress track used by goal rows and member summaries.
 * Numbers are always rendered separately so the percentage stays readable.
 */
export function ProgressTrack({
  value,
  label,
  tone = "ink",
}: {
  value: number;
  label: string;
  tone?: "ink" | "mint";
}) {
  const clamped = Math.min(100, Math.max(0, Math.round(value)));

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className="h-1.5 w-full overflow-hidden rounded-full bg-mist"
    >
      <div
        className={`h-full rounded-full transition-[width] duration-500 ${tone === "mint" ? "bg-mint" : "bg-ink"}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
