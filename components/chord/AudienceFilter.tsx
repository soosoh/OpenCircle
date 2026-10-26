"use client";

import { useTransition } from "react";
import { AUDIENCE_OPTIONS } from "@/lib/domain/audience";
import { useAudienceFilter } from "@/hooks/useAudienceFilter";
import type { Audience } from "@/types";

/** Age filter. Shared by chord discovery, point discovery, and member search. */
export function AudienceFilter({ counts }: { counts?: Record<Audience, number> }) {
  const [current, setAudience] = useAudienceFilter();
  // The URL change re-renders the server page; keep the chips responsive meanwhile.
  const [pending, startTransition] = useTransition();

  return (
    <div
      className="flex flex-wrap items-center gap-1.5"
      role="group"
      aria-label="Filter by education level"
      aria-busy={pending}
    >
      {AUDIENCE_OPTIONS.map((option) => {
        const active = current === option.value;
        const count = counts?.[option.value];
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => startTransition(() => setAudience(option.value))}
            aria-pressed={active}
            className={`press inline-flex min-h-10 items-center rounded-full px-4 py-2 text-sm font-semibold ${
              active
                ? "bg-ink text-white"
                : "border border-line bg-surface text-ink hover:border-ink/30 hover:bg-sun-wash"
            } ${pending && !active ? "opacity-70" : ""}`}
          >
            {option.label}
            {typeof count === "number" ? (
              <span
                className={`tnum ml-2 rounded-full px-1.5 text-xs font-bold ${
                  active ? "bg-sun text-ink" : "bg-mist text-muted"
                }`}
              >
                {count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
