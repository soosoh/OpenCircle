"use client";

import { AUDIENCE_OPTIONS } from "@/lib/domain/audience";
import { useAudienceFilter } from "@/hooks/useAudienceFilter";
import type { Audience } from "@/types";

/** Age filter. Shared by chord discovery, point discovery, and member search. */
export function AudienceFilter({ counts }: { counts?: Record<Audience, number> }) {
  const [current, setAudience] = useAudienceFilter();

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by education level">
      {AUDIENCE_OPTIONS.map((option) => {
        const active = current === option.value;
        const count = counts?.[option.value];
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setAudience(option.value)}
            aria-pressed={active}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ${
              active
                ? "border-brand bg-brand text-white shadow-sm"
                : "border-line bg-surface text-muted hover:border-brand/40 hover:text-ink"
            }`}
          >
            {option.label}
            {typeof count === "number" ? <span className={active ? "text-white/70" : "text-muted/70"}> · {count}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
