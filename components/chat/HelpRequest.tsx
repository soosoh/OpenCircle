"use client";

import { useFormStatus } from "react-dom";
import { SubmitButton } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Field";

/** Support note form. It tells the rest of the point that a member needs a hand. */
export function HelpRequest({ action }: { action: (formData: FormData) => void | Promise<void> }) {
  return (
    <div className="border-t border-coral/20 pt-4">
      <p className="text-sm leading-6 text-[#8E3520]/85">
        Everyone in this point will see your note, and your moderator can mark it resolved when things are back
        on track.
      </p>
      <form action={action} className="mt-3 space-y-3">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-[#8E3520]">What would help?</span>
          <Textarea
            name="reason"
            placeholder="Feeling stuck on a topic, falling behind, or need an explanation…"
            className="border-coral/30 bg-surface text-ink placeholder:text-muted/60"
            required
          />
        </label>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-[#8E3520]/70">Visible to your point</span>
          <SosSubmit />
        </div>
      </form>
    </div>
  );
}

function SosSubmit() {
  const { pending } = useFormStatus();
  return (
    <SubmitButton variant="danger" pending={pending} pendingLabel="Sending…" className="min-h-10">
      Send request
    </SubmitButton>
  );
}
