import { buildSeed } from "./seed";
import { createMemoryStore } from "./memory-store";
import { createSupabaseStore } from "./supabase-store";
import type { DataStore } from "./store";

/**
 * Selects the backend with DATA_BACKEND:
 * - "memory" (default): seeded in-memory data. No external services.
 * - "supabase": needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (server-only).
 */
function createStore(): DataStore {
  const backend = process.env.DATA_BACKEND ?? "memory";
  if (backend === "supabase") {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error("DATA_BACKEND=supabase requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
    }
    return createSupabaseStore(url, key);
  }
  if (backend !== "memory") throw new Error(`Unknown DATA_BACKEND "${backend}". Use "memory" or "supabase".`);
  return createMemoryStore(buildSeed());
}

// Stored on globalThis so the in-memory data survives Next.js dev-mode module reloads.
const globalForStore = globalThis as unknown as { __studycircleStore?: DataStore };

export function getStore(): DataStore {
  globalForStore.__studycircleStore ??= createStore();
  return globalForStore.__studycircleStore;
}
