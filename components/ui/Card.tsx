import type { ReactNode } from "react";

/** Shared surface: rounded card with a soft border and optional hover lift. */
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
      className={`rounded-2xl border border-line bg-surface p-5 shadow-[0_1px_2px_rgba(30,32,48,0.04)] transition-all duration-200 ${
        interactive ? "hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-[0_8px_24px_rgba(30,32,48,0.08)]" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionHeading({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {hint ? <p className="text-sm text-muted">{hint}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-surface/60 px-6 py-10 text-center">
      <p className="font-medium">{title}</p>
      {hint ? <p className="mx-auto mt-1 max-w-sm text-sm text-muted">{hint}</p> : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}
