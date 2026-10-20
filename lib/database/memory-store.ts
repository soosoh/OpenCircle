import type { DataStore, RowWithId, TableName } from "./store";

/** Default store. Lives in process memory, so data resets when the server restarts. */
export function createMemoryStore(seed: Record<TableName, RowWithId[]>): DataStore {
  const tables = new Map<TableName, Map<string, RowWithId>>();
  for (const [table, rows] of Object.entries(seed) as [TableName, RowWithId[]][]) {
    tables.set(table, new Map(rows.map((row) => [row.id, structuredClone(row)])));
  }
  const tableOf = (table: TableName) => {
    let map = tables.get(table);
    if (!map) {
      map = new Map();
      tables.set(table, map);
    }
    return map;
  };

  return {
    async list<T extends RowWithId>(table: TableName) {
      return [...tableOf(table).values()].map((row) => structuredClone(row) as T);
    },
    async get<T extends RowWithId>(table: TableName, id: string) {
      const row = tableOf(table).get(id);
      return row ? (structuredClone(row) as T) : null;
    },
    async insert<T extends RowWithId>(table: TableName, row: T) {
      if (tableOf(table).has(row.id)) throw new Error(`${table} already has id ${row.id}`);
      tableOf(table).set(row.id, structuredClone(row));
      return structuredClone(row);
    },
    async upsert<T extends RowWithId>(table: TableName, row: T) {
      tableOf(table).set(row.id, structuredClone(row));
      return structuredClone(row) as T;
    },
    async update<T extends RowWithId>(table: TableName, id: string, patch: Partial<T>) {
      const existing = tableOf(table).get(id);
      if (!existing) return null;
      const next = { ...existing, ...patch, id } as RowWithId;
      tableOf(table).set(id, next);
      return structuredClone(next) as T;
    },
  };
}
