"use client";

import { useFormStatus } from "react-dom";
import { Textarea } from "@/components/ui/Field";

/** Chat composer. Used for point chat and for moderator private messages. */
export function MessageInput({
  action,
  placeholder = "Write a message…",
  showKinds = false,
  name = "content",
  hiddenFields = {},
}: {
  action: (formData: FormData) => void | Promise<void>;
  placeholder?: string;
  showKinds?: boolean;
  name?: string;
  hiddenFields?: Record<string, string>;
}) {
  return (
    <form action={action} className="space-y-2">
      {Object.entries(hiddenFields).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}
      <Textarea name={name} placeholder={placeholder} className="min-h-16" required />
      <div className="flex flex-wrap items-center justify-between gap-2">
        {showKinds ? (
          <label className="flex items-center gap-2 text-xs text-muted">
            Type
            <select name="kind" className="rounded-lg border border-line bg-surface px-2 py-1 text-xs">
              <option value="message">Message</option>
              <option value="question">Question</option>
              <option value="resource">Resource</option>
            </select>
          </label>
        ) : (
          <span />
        )}
        <SendButton />
      </div>
    </form>
  );
}

function SendButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-brand px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#3f38c9] disabled:opacity-50"
    >
      {pending ? "Sending…" : "Send"}
    </button>
  );
}
