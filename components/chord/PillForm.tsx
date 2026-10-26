"use client";

import type { ReactNode } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { useFormStatus } from "react-dom";
import { pillClasses, pillDiscClasses, type PillTone } from "@/components/chord/PillLink";

/**
 * A server action wrapped in the landing's action pill. While the action runs
 * the disc turns into a spinner and the label says what is happening, so a slow
 * join never looks like a dead button. The action re-checks permission itself.
 */
export function PillForm({
  action,
  children,
  pendingLabel = "Working…",
  tone = "ink",
  className,
}: {
  action: () => void | Promise<void>;
  children: ReactNode;
  pendingLabel?: string;
  tone?: PillTone;
  className?: string;
}) {
  return (
    <form action={action} className={className}>
      <PillSubmit tone={tone} pendingLabel={pendingLabel}>
        {children}
      </PillSubmit>
    </form>
  );
}

function PillSubmit({
  children,
  pendingLabel,
  tone,
}: {
  children: ReactNode;
  pendingLabel: string;
  tone: PillTone;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-busy={pending} className={pillClasses(tone)}>
      <span className={pillDiscClasses(tone)} aria-hidden="true">
        {pending ? (
          <LoaderCircle size={15} strokeWidth={2.5} className="animate-spin" />
        ) : (
          <ArrowRight size={15} strokeWidth={2.5} />
        )}
      </span>
      {pending ? pendingLabel : children}
    </button>
  );
}
