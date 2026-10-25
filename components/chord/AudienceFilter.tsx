"use client";

import { AUDIENCE_OPTIONS } from "@/lib/domain/audience";
import { useAudienceFilter } from "@/hooks/useAudienceFilter";
import type { Audience } from "@/types";

/** Age filter. Shared by chord discovery, point discovery, and member search. */
export function AudienceFilter({ counts }: { counts?: Record<Audience, number> }) {
  const [current, setAudience] = useAudienceFilter();

  return (
    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter by education level">
      {AUDIENCE_OPTIONS.map((option) => {
        const active = current === option.value;
        const count = counts?.[option.value];
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setAudience(option.value)}
            aria-pressed={active}
            className={`inline-flex min-h-10 items-center rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${
              active
                ? "bg-ink text-white"
                : "border border-line bg-surface text-ink hover:border-ink/25 hover:bg-sun-wash"
            }`}
          >
            {option.label}
            {typeof count === "number" ? (
              <span className={`tnum ml-1.5 ${active ? "text-white/65" : "text-muted"}`}>{count}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
