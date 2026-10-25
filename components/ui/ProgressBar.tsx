export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const clamped = Math.min(100, Math.max(0, Math.round(value)));
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? "Progress"}
      className="h-2 w-full overflow-hidden rounded-full bg-mist"
    >
      <div
        className="h-full rounded-full bg-ink transition-[width] duration-500"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
