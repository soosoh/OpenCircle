import fs from "node:fs";
import path from "node:path";
import { SEED_VERSION, type SeedData } from "./seed";
import { TABLES, type DataStore, type RowWithId, type TableName } from "./store";

/**
 * File persistence for the in-memory backend, so joins, goals and chat survive a server
 * restart during development and on a single-process `next start`.
 *
 * - Default file: .data/studycircle.json (git-ignored). Override with DATA_FILE; set
 *   DATA_PERSIST=off to keep the old reset-on-restart behaviour.
 * - A save is only reused when its seed version matches, so new demo data is never hidden.
 * - Serverless hosts (Vercel) have no durable disk and one copy of the store per instance:
 *   persistence is skipped there. Deploy with DATA_BACKEND=supabase instead.
 */

const FILE = process.env.DATA_FILE ?? path.join(process.cwd(), ".data", "studycircle.json");
const SAVE_DELAY_MS = 150;

export const persistenceEnabled = process.env.DATA_PERSIST !== "off" && !process.env.VERCEL;

/** The saved tables, or null when there is no usable save (missing, unreadable, or an older seed). */
export function loadSaved(): SeedData | null {
  if (!persistenceEnabled) return null;
  try {
    const parsed = JSON.parse(fs.readFileSync(FILE, "utf8")) as { version?: number; tables?: Record<string, unknown> };
    if (parsed.version !== SEED_VERSION || !parsed.tables) return null;
    const tables = {} as SeedData;
    for (const table of TABLES) {
      const rows = parsed.tables[table];
      if (!Array.isArray(rows)) return null;
      tables[table] = rows as RowWithId[];
    }
    return tables;
  } catch {
    return null;
  }
}

/** Wraps a store so every write is saved to disk shortly after (coalesced, atomic rename). */
export function withFileSave(store: DataStore): DataStore {
  if (!persistenceEnabled) return store;

  let timer: ReturnType<typeof setTimeout> | null = null;
  let warned = false;

  async function save() {
    timer = null;
    try {
      const tables: Record<string, RowWithId[]> = {};
      for (const table of TABLES) tables[table] = await store.list(table);
      fs.mkdirSync(path.dirname(FILE), { recursive: true });
      const tmp = `${FILE}.${process.pid}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify({ version: SEED_VERSION, savedAt: new Date().toISOString(), tables }));
      fs.renameSync(tmp, FILE);
    } catch (error) {
      if (!warned) {
        warned = true;
        console.warn("StudyCircle could not save its data to disk; changes will reset on restart.", error);
      }
    }
  }
  const queueSave = () => {
    if (!timer) timer = setTimeout(save, SAVE_DELAY_MS);
  };

  return {
    list: <T extends RowWithId>(table: TableName) => store.list<T>(table),
    get: <T extends RowWithId>(table: TableName, id: string) => store.get<T>(table, id),
    async insert<T extends RowWithId>(table: TableName, row: T) {
      const saved = await store.insert<T>(table, row);
      queueSave();
      return saved;
    },
    async upsert<T extends RowWithId>(table: TableName, row: T) {
      const saved = await store.upsert<T>(table, row);
      queueSave();
      return saved;
    },
    async update<T extends RowWithId>(table: TableName, id: string, patch: Partial<T>) {
      const saved = await store.update<T>(table, id, patch);
      if (saved) queueSave();
      return saved;
    },
  };
}
