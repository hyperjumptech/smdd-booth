import Database from "better-sqlite3";
import type { Badge } from "@booth/shared";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  badges TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

export type SubmissionRow = {
  id: number;
  name: string;
  email: string;
  badges: Badge[];
  created_at: string;
};

export type CreateSubmissionInput = {
  name: string;
  email: string;
  badges: Badge[];
};

export function initDb(path: string): Database.Database {
  const db = new Database(path);
  db.exec(SCHEMA);

  const cols = db.prepare(`PRAGMA table_info(submissions)`).all() as {
    name: string;
  }[];
  const names = new Set(cols.map((c) => c.name));
  if (names.has("answers") || names.has("result_key")) {
    db.exec(`
      DROP TABLE IF EXISTS submissions;
      ${SCHEMA}
    `);
  }

  return db;
}

export function createSubmission(
  db: Database.Database,
  input: CreateSubmissionInput,
): { id: number } {
  const result = db
    .prepare(
      `INSERT INTO submissions (name, email, badges)
       VALUES (?, ?, ?)`,
    )
    .run(input.name, input.email, JSON.stringify(input.badges));

  return { id: Number(result.lastInsertRowid) };
}

export function listSubmissions(db: Database.Database): SubmissionRow[] {
  const rows = db
    .prepare(
      `SELECT id, name, email, badges, created_at
       FROM submissions
       ORDER BY id DESC`,
    )
    .all() as Array<{
    id: number;
    name: string;
    email: string;
    badges: string;
    created_at: string;
  }>;

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    badges: JSON.parse(row.badges) as Badge[],
    created_at: row.created_at,
  }));
}
