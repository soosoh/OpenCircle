"use client";

import { SubmitButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Field";
import { useFormStatus } from "react-dom";

/** SOS request form: tells the rest of the point that a member needs support. */
export function HelpRequest({ action }: { action: (formData: FormData) => void | Promise<void> }) {
  return (
    <Card className="space-y-3">
      <div>
        <h3 className="font-semibold tracking-tight">Need support?</h3>
        <p className="text-sm text-muted">
          Notifies everyone else in this point that you could use a hand.
        </p>
      </div>
      <form action={action} className="space-y-3">
        <Textarea
          name="reason"
          placeholder="Feeling unmotivated, falling behind, or need an explanation…"
          required
        />
        <SosSubmit />
      </form>
    </Card>
  );
}

function SosSubmit() {
  const { pending } = useFormStatus();
  return (
    <SubmitButton variant="danger" pending={pending}>
      Send SOS
    </SubmitButton>
  );
}
