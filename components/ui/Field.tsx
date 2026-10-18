import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const FIELD =
  "w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink transition-colors placeholder:text-muted/70 hover:border-brand/30";

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return <input {...rest} className={`${FIELD} ${className}`} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = "", ...rest } = props;
  return <textarea {...rest} className={`${FIELD} min-h-24 resize-y ${className}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const { className = "", ...rest } = props;
  return <select {...rest} className={`${FIELD} ${className}`} />;
}

export function CheckboxGroup({ name, options }: { name: string; options: { value: string; label: string }[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <label
          key={option.value}
          className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line px-3 py-1.5 text-sm transition-colors hover:border-brand/40 has-checked:border-brand has-checked:bg-brand/10"
        >
          <input type="checkbox" name={name} value={option.value} className="size-3.5 accent-[#4f46e5]" />
          {option.label}
        </label>
      ))}
    </div>
  );
}
