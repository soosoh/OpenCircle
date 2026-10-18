/** Table-level storage contract. Both the in-memory and Supabase stores implement this. */

export const TABLES = ["users", "chords", "points", "goals", "messages", "help_requests", "private_messages"] as const;
export type TableName = (typeof TABLES)[number];

export interface RowWithId {
  id: string;
}

export interface DataStore {
  list<T extends RowWithId>(table: TableName): Promise<T[]>;
  get<T extends RowWithId>(table: TableName, id: string): Promise<T | null>;
  insert<T extends RowWithId>(table: TableName, row: T): Promise<T>;
  /** Shallow merge. Returns null when the row does not exist. */
  update<T extends RowWithId>(table: TableName, id: string, patch: Partial<T>): Promise<T | null>;
}
