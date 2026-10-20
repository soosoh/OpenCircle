import { buildSeed } from "./seed";
import { createMemoryStore } from "./memory-store";
import { createSupabaseStore } from "./supabase-store";
import { TABLES, type DataStore, type RowWithId, type TableName } from "./store";

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
    return seedEmptyTables(createSupabaseStore(url, key));
  }
  if (backend !== "memory") throw new Error(`Unknown DATA_BACKEND "${backend}". Use "memory" or "supabase".`);
  return createMemoryStore(buildSeed());
}

/**
 * Supabase tables start empty (schema.sql creates no rows). On first access, fill any
 * table that has no rows with buildSeed() via upsert. Tables that already contain rows
 * (user data, auth-created profiles) are never touched, so this is idempotent and safe
 * to run on every boot. Runs once per process; a failed seeding retries on next access.
 */
function seedEmptyTables(store: DataStore): DataStore {
  let seeding: Promise<void> | null = null;
  const ensureSeeded = (): Promise<void> => {
    if (!seeding) {
      seeding = (async () => {
        const seed = buildSeed();
        for (const table of TABLES) {
          if ((await store.list(table)).length > 0) continue;
          for (const row of seed[table]) await store.upsert(table, row);
        }
      })();
      seeding.catch(() => {
        seeding = null;
      });
    }
    return seeding;
  };

  return {
    async list<T extends RowWithId>(table: TableName) {
      await ensureSeeded();
      return store.list<T>(table);
    },
    async get<T extends RowWithId>(table: TableName, id: string) {
      await ensureSeeded();
      return store.get<T>(table, id);
    },
    async insert<T extends RowWithId>(table: TableName, row: T) {
      await ensureSeeded();
      return store.insert<T>(table, row);
    },
    async upsert<T extends RowWithId>(table: TableName, row: T) {
      await ensureSeeded();
      return store.upsert<T>(table, row);
    },
    async update<T extends RowWithId>(table: TableName, id: string, patch: Partial<T>) {
      await ensureSeeded();
      return store.update<T>(table, id, patch);
    },
  };
}

// Stored on globalThis so the in-memory data survives Next.js dev-mode module reloads.
const globalForStore = globalThis as unknown as { __studycircleStore?: DataStore };

export function getStore(): DataStore {
  globalForStore.__studycircleStore ??= createStore();
  return globalForStore.__studycircleStore;
}
