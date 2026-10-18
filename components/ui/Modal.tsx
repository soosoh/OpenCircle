"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

/**
 * Dialog rendered with <dialog> for native focus trapping and Esc handling.
 * `trigger` renders a button that opens it.
 */
export function Modal({
  open,
  onClose,
  title,
  trigger,
  children,
}: {
  open?: boolean;
  onClose?: () => void;
  title: string;
  trigger?: ReactNode;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <>
      {trigger}
      <dialog
        ref={ref}
        onClose={onClose}
        onClick={(event) => {
          // Clicking the backdrop (the dialog element itself) closes it.
          if (event.target === ref.current) onClose?.();
        }}
        className="m-auto w-[min(34rem,92vw)] rounded-2xl border border-line bg-surface p-0 text-ink backdrop:bg-ink/30"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-semibold">{title}</h2>
          <button
            type="button"
            onClick={() => {
              ref.current?.close();
              onClose?.();
            }}
            className="rounded-full px-2 py-1 text-muted transition-colors hover:bg-ink/5 hover:text-ink"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </dialog>
    </>
  );
}
