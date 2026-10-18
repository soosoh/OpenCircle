import { createClient } from "@supabase/supabase-js";
import type { DataStore, RowWithId, TableName } from "./store";

/**
 * Supabase (Postgres) store. Every table has the shape `id text primary key, data jsonb not null`
 * (see supabase/schema.sql). Each entity is stored as one JSON document.
 * Update is read-modify-write and not atomic. Acceptable for this stage, but revisit before
 * concurrent writes to the same row matter.
 */
export function createSupabaseStore(url: string, serviceRoleKey: string): DataStore {
  const client = createClient(url, serviceRoleKey, { auth: { persistSession: false } });

  const fail = (error: { message: string } | null) => {
    if (error) throw new Error(`Supabase error: ${error.message}`);
  };

  // `id` is a real column, so it is stored separately from the JSON document.
  const withoutId = (row: object): Record<string, unknown> =>
    Object.fromEntries(Object.entries(row).filter(([key]) => key !== "id"));

  return {
    async list<T extends RowWithId>(table: TableName) {
      const { data, error } = await client.from(table).select("id, data");
      fail(error);
      return (data ?? []).map((row) => ({ ...(row.data as object), id: row.id }) as T);
    },
    async get<T extends RowWithId>(table: TableName, id: string) {
      const { data, error } = await client.from(table).select("id, data").eq("id", id).maybeSingle();
      fail(error);
      return data ? ({ ...(data.data as object), id: data.id } as T) : null;
    },
    async insert<T extends RowWithId>(table: TableName, row: T) {
      const { error } = await client.from(table).insert({ id: row.id, data: withoutId(row) });
      fail(error);
      return row;
    },
    async update<T extends RowWithId>(table: TableName, id: string, patch: Partial<T>) {
      const current = await this.get<T>(table, id);
      if (!current) return null;
      const next = { ...current, ...patch, id } as T;
      const { error } = await client.from(table).update({ data: withoutId(next) }).eq("id", id);
      fail(error);
      return next;
    },
  };
}
