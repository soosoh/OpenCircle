"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { parseAudience } from "@/lib/domain/audience";
import type { Audience } from "@/types";

/** Reads and writes the `?audience=` search param so filtered pages stay shareable. */
export function useAudienceFilter(): [Audience, (audience: Audience) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const current = parseAudience(params.get("audience"));

  const setAudience = useCallback(
    (audience: Audience) => {
      const next = new URLSearchParams(params.toString());
      if (audience === "all") next.delete("audience");
      else next.set("audience", audience);
      const query = next.toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  return [current, setAudience];
}
