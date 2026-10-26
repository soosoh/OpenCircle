import type { ReactNode } from "react";

/** Shared surface: a white card on the warm page, separated by a hairline. */
export function Card({
  children,
  className = "",
  interactive = false,
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-line bg-surface p-5 ${
        interactive ? "lift-card" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionHeading({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="font-display text-xl font-bold tracking-tight text-ink">{title}</h2>
        {hint ? <p className="mt-1 text-sm text-muted">{hint}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  title,
  hint,
  action,
  art,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
  /** Optional friendly art (e.g. a Mascot) shown above the title. */
  art?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-surface px-6 py-10 text-center">
      {art ? <div className="mb-3 flex justify-center">{art}</div> : null}
      <p className="font-display text-lg font-bold text-ink">{title}</p>
      {hint ? <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink/80">{hint}</p> : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
