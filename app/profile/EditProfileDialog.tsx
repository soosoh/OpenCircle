"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ProfileEditor } from "./ProfileEditor";

type EditorInitial = Parameters<typeof ProfileEditor>[0]["initial"];

/**
 * "Edit profile" as a button that opens the editor in a dialog, instead of a form far
 * down the page. Uses the native <dialog> so focus is trapped, Escape closes it and focus
 * returns to the button. The editor is only mounted while open, so every opening starts
 * from the saved profile rather than from an abandoned edit.
 */
export function EditProfileDialog({ initial }: { initial: EditorInitial }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [savedNote, setSavedNote] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!savedNote) return;
    const timer = setTimeout(() => setSavedNote(false), 3500);
    return () => clearTimeout(timer);
  }, [savedNote]);

  return (
    <>
      <Button variant="ink" size="md" className="min-h-11" onClick={() => setOpen(true)} aria-haspopup="dialog">
        Edit profile
      </Button>
      {savedNote ? (
        <p role="status" className="inline-flex min-h-8 items-center rounded-full bg-surface px-3 text-sm font-semibold text-sage-ink">
          Profile saved
        </p>
      ) : null}

      <dialog
        ref={dialogRef}
        aria-labelledby="edit-profile-title"
        onClose={() => setOpen(false)}
        onClick={(event) => {
          // A click on the dialog element itself is a click on the backdrop.
          if (event.target === dialogRef.current) setOpen(false);
        }}
        className="m-auto max-h-[92dvh] w-[min(46rem,94vw)] overflow-y-auto overscroll-contain rounded-2xl border border-line bg-surface p-0 text-ink backdrop:bg-ink/45 open:animate-fade-up"
      >
        {open ? (
          <div className="p-5 sm:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 id="edit-profile-title" className="font-display text-2xl font-bold tracking-tight text-ink">
                  Edit your profile
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Update how you appear to your points. You can change any of this later.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-ink transition-colors hover:bg-sun-wash"
              >
                <X size={18} strokeWidth={2.25} aria-hidden="true" />
              </button>
            </div>
            <ProfileEditor
              initial={initial}
              onCancel={() => setOpen(false)}
              onSaved={() => {
                setOpen(false);
                setSavedNote(true);
              }}
            />
          </div>
        ) : null}
      </dialog>
    </>
  );
}
