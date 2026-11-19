import { createClient, type Client } from "@libsql/client";

const globalForDb = globalThis as unknown as {
  turso?: Client;
  tursoReady?: Promise<void>;
  /** Schema the ready promise was built for; a changed schema (hot reload) runs it again. */
  tursoSchema?: string;
};

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

function client() {
  if (globalForDb.turso) return globalForDb.turso;

  globalForDb.turso = createClient({
    url: requireEnv("TURSO_DATABASE_URL"),
    authToken: requireEnv("TURSO_AUTH_TOKEN"),
  });

  return globalForDb.turso;
}

const schema = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS subscriptions (
  user_id INTEGER PRIMARY KEY REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'none',
  trial_ends_at TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

export async function getDb() {
  const db = client();

  if (!globalForDb.tursoReady || globalForDb.tursoSchema !== schema) {
    globalForDb.tursoSchema = schema;
    globalForDb.tursoReady = db.executeMultiple(schema).catch((error: unknown) => {
      globalForDb.tursoReady = undefined;
      throw error;
    });
  }

  await globalForDb.tursoReady;
  return db;
}
