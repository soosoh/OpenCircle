"use client";

import { useId, type ReactNode } from "react";

type ControlProps = {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
  "aria-required"?: true;
};

/**
 * Label + helper text + inline error, wired together: the control gets an id,
 * `aria-describedby` pointing at the hint and the error, and `aria-invalid`.
 */
export function FormField({
  label,
  hint,
  error,
  required,
  optional,
  className = "",
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  optional?: boolean;
  className?: string;
  children: (props: ControlProps) => ReactNode;
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 flex items-baseline gap-2 text-sm font-semibold text-ink">
        {label}
        {optional ? <span className="text-xs font-normal text-muted">optional</span> : null}
      </label>
      {children({
        id,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
        "aria-required": required ? true : undefined,
      })}
      {hint ? (
        <p id={hintId} className="mt-1.5 text-xs leading-snug text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="mt-1.5 text-xs font-semibold leading-snug text-coral">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** A checkbox rendered as a chip; the checked chip takes the soft-yellow fill. */
export function ChipCheckbox({
  name,
  value,
  label,
  defaultChecked,
  dot,
}: {
  name: string;
  value: string;
  label: string;
  defaultChecked?: boolean;
  dot?: string;
}) {
  return (
    <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-line bg-surface px-3.5 text-sm font-medium text-ink transition-colors duration-150 ease-out-quart hover:border-ink/30 has-checked:border-ink has-checked:bg-sun-soft">
      <input
        type="checkbox"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="size-4 accent-ink"
      />
      {dot ? <span aria-hidden="true" className="size-2 rounded-full" style={{ backgroundColor: dot }} /> : null}
      {label}
    </label>
  );
}
