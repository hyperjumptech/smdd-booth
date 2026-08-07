import Database from "better-sqlite3";
import type { Answer, Choice } from "@booth/shared";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  answers TEXT NOT NULL,
  result_key TEXT NOT NULL,
  result_label TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

export type SubmissionRow = {
  id: number;
  name: string;
  email: string;
  answers: Answer[];
  result_key: Choice;
  result_label: string;
  created_at: string;
};

export type CreateSubmissionInput = {
  name: string;
  email: string;
  answers: Answer[];
  resultKey: Choice;
  resultLabel: string;
};

export function initDb(path: string): Database.Database {
  const db = new Database(path);
  db.exec(SCHEMA);
  return db;
}

export function createSubmission(
  db: Database.Database,
  input: CreateSubmissionInput,
): { id: number } {
  const result = db
    .prepare(
      `INSERT INTO submissions (name, email, answers, result_key, result_label)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .run(
      input.name,
      input.email,
      JSON.stringify(input.answers),
      input.resultKey,
      input.resultLabel,
    );

  return { id: Number(result.lastInsertRowid) };
}

export function listSubmissions(db: Database.Database): SubmissionRow[] {
  const rows = db
    .prepare(
      `SELECT id, name, email, answers, result_key, result_label, created_at
       FROM submissions
       ORDER BY id DESC`,
    )
    .all() as Array<{
    id: number;
    name: string;
    email: string;
    answers: string;
    result_key: Choice;
    result_label: string;
    created_at: string;
  }>;

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    answers: JSON.parse(row.answers) as Answer[],
    result_key: row.result_key,
    result_label: row.result_label,
    created_at: row.created_at,
  }));
}
