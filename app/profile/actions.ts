"use server";

import { updateProfile } from "@/lib/api/actions";
import type { ProfileSaveState } from "./state";

/**
 * Presentation wrapper around the real mutation. `updateProfile` (lib/api/actions.ts)
 * re-checks the session, validates the form and re-validates every chord and point the
 * member belongs to; it reports problems by throwing. A thrown message is redacted in
 * production, so this turns it into state the editor can show next to the form.
 */
export async function saveProfile(formData: FormData): Promise<ProfileSaveState> {
  try {
    await updateProfile(formData);
    return { ok: true };
  } catch (error) {
    // requireUser() redirects signed-out visitors by throwing: let that through.
    const digest = (error as { digest?: unknown } | null)?.digest;
    if (typeof digest === "string" && digest.startsWith("NEXT_REDIRECT")) throw error;
    return { error: error instanceof Error && error.message ? error.message : "Could not save your profile." };
  }
}
