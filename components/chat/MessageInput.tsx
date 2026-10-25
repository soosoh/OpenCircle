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
      <Textarea
        name={name}
        aria-label={placeholder}
        placeholder={placeholder}
        className="min-h-16 bg-surface"
        required
        onKeyDown={(event) => {
          // Enter sends; Shift + Enter keeps the newline.
          if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
            if (!event.currentTarget.value.trim()) return;
            event.preventDefault();
            event.currentTarget.form?.requestSubmit();
          }
        }}
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-3">
          {showKinds ? (
            <label className="flex items-center gap-2 text-xs text-muted">
              Type
              <select
                name="kind"
                className="h-10 rounded-lg border border-line bg-surface px-2 text-xs text-ink transition-colors hover:border-ink/25 focus:border-ink/40 focus:outline-none"
              >
                <option value="message">Message</option>
                <option value="question">Question</option>
                <option value="resource">Resource</option>
              </select>
            </label>
          ) : null}
          <span className="text-[11px] text-muted">Enter to send · Shift + Enter for a new line</span>
        </div>
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
      className="inline-flex min-h-10 items-center rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#3A4452] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Sending…" : "Send"}
    </button>
  );
}
