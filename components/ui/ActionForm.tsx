"use client";

import { useFormStatus } from "react-dom";
import { SubmitButton } from "@/components/ui/Button";

/** Wraps a server action in a form and disables the button while it runs. */
export function ActionForm({
  action,
  children,
  pendingLabel,
  variant = "primary",
  size = "md",
  className = "",
  confirm,
}: {
  action: () => void | Promise<void>;
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
  confirm?: string;
}) {
  return (
    <form
      action={action}
      className={className}
      onSubmit={(event) => {
        if (confirm && !window.confirm(confirm)) event.preventDefault();
      }}
    >
      <PendingSubmit variant={variant} size={size} pendingLabel={pendingLabel}>
        {children}
      </PendingSubmit>
    </form>
  );
}

function PendingSubmit({
  children,
  pendingLabel,
  variant,
  size,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  variant: "primary" | "secondary" | "ghost" | "danger";
  size: "sm" | "md" | "lg";
}) {
  const { pending } = useFormStatus();
  return (
    <SubmitButton pending={pending} variant={variant} size={size}>
      {pending && pendingLabel ? pendingLabel : children}
    </SubmitButton>
  );
}
