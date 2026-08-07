import {
  QUESTIONS,
  RESULTS,
  type Answer,
  type Choice,
  resolveResultKey,
} from "@booth/shared";
import { serveStatic } from "@hono/node-server/serve-static";
import fs from "node:fs";
import path from "node:path";
import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import type { Context } from "hono";
import type Database from "better-sqlite3";
import {
  ADMIN_COOKIE_NAME,
  signAdminSession,
  verifyAdminSession,
} from "./auth.js";
import { createSubmission, listSubmissions } from "./db.js";

const CHOICES: Choice[] = ["A", "B", "C", "D", "E"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const QUESTION_IDS = new Set(QUESTIONS.map((q) => q.id));
const TIEBREAKER_ID = "tiebreaker";
const SECURE_COOKIE =
  process.env.NODE_ENV === "production" || process.env.SECURE_COOKIES === "1";

export type AppDeps = {
  db: Database.Database;
  adminPassword: string;
  sessionSecret: string;
  staticDir?: string;
};

type SubmissionBody = {
  name?: string;
  email?: string;
  answers?: Answer[];
  resultKey?: Choice;
  tiebreaker?: Choice;
};

function isChoice(value: string): value is Choice {
  return CHOICES.includes(value as Choice);
}

function validateSubmissionBody(body: SubmissionBody): string | null {
  const name = body.name?.trim();
  if (!name) return "name is required";

  const email = body.email?.trim();
  if (!email || !EMAIL_RE.test(email)) return "invalid email";

  if (
    !Array.isArray(body.answers) ||
    body.answers.length < 7 ||
    body.answers.length > 8
  ) {
    return "answers must contain 7 or 8 items";
  }

  const seenIds = new Set<string>();
  let tiebreakerInAnswers: Choice | undefined;

  for (const answer of body.answers) {
    if (!answer || typeof answer.questionId !== "string") {
      return "invalid answer";
    }
    if (answer.questionId === TIEBREAKER_ID) {
      if (tiebreakerInAnswers) return "duplicate tiebreaker";
      if (!isChoice(answer.choice)) return "invalid choice";
      tiebreakerInAnswers = answer.choice;
      continue;
    }
    if (!QUESTION_IDS.has(answer.questionId)) {
      return "invalid questionId";
    }
    if (!isChoice(answer.choice)) {
      return "invalid choice";
    }
    if (seenIds.has(answer.questionId)) {
      return "duplicate questionId";
    }
    seenIds.add(answer.questionId);
  }

  if (seenIds.size !== 7) {
    return "answers must contain all 7 questions";
  }

  if (!body.resultKey || !isChoice(body.resultKey)) {
    return "invalid resultKey";
  }

  const tiebreaker = body.tiebreaker ?? tiebreakerInAnswers;
  if (tiebreaker !== undefined && !isChoice(tiebreaker)) {
    return "invalid tiebreaker";
  }

  const questionAnswers = body.answers.filter(
    (answer) => answer.questionId !== TIEBREAKER_ID,
  );

  try {
    const expected = resolveResultKey(questionAnswers, tiebreaker);
    if (expected !== body.resultKey) {
      return "resultKey does not match answers";
    }
  } catch {
    return "resultKey does not match answers";
  }

  return null;
}

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function submissionsToCsv(
  rows: ReturnType<typeof listSubmissions>,
): string {
  const header = "id,name,email,result_key,result_label,answers,created_at";
  const lines = rows.map((row) =>
    [
      String(row.id),
      csvEscape(row.name),
      csvEscape(row.email),
      csvEscape(row.result_key),
      csvEscape(row.result_label),
      csvEscape(JSON.stringify(row.answers)),
      csvEscape(row.created_at),
    ].join(","),
  );
  return [header, ...lines].join("\n");
}

function requireAdmin(c: Context, sessionSecret: string): Response | null {
  const token = getCookie(c, ADMIN_COOKIE_NAME);
  if (!token || !verifyAdminSession(token, sessionSecret)) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  return null;
}

export function createApp(deps: AppDeps) {
  const app = new Hono();

  app.get("/api/health", (c) => c.json({ ok: true }));

  app.post("/api/submissions", async (c) => {
    const body = (await c.req.json()) as SubmissionBody;
    const error = validateSubmissionBody(body);
    if (error) {
      return c.json({ error }, 400);
    }

    const name = body.name!.trim();
    const email = body.email!.trim();
    const answers = body.answers!;
    const resultKey = body.resultKey!;

    const { id } = createSubmission(deps.db, {
      name,
      email,
      answers,
      resultKey,
      resultLabel: RESULTS[resultKey].service,
    });

    return c.json({ id }, 201);
  });

  app.post("/api/admin/login", async (c) => {
    const body = (await c.req.json()) as { password?: string };
    if (body.password !== deps.adminPassword) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    setCookie(c, ADMIN_COOKIE_NAME, signAdminSession(deps.sessionSecret), {
      httpOnly: true,
      path: "/",
      sameSite: "Lax",
      secure: SECURE_COOKIE,
    });

    return c.json({ ok: true });
  });

  app.get("/api/admin/submissions", (c) => {
    const unauthorized = requireAdmin(c, deps.sessionSecret);
    if (unauthorized) return unauthorized;

    return c.json(listSubmissions(deps.db));
  });

  app.get("/api/admin/export", (c) => {
    const unauthorized = requireAdmin(c, deps.sessionSecret);
    if (unauthorized) return unauthorized;

    const csv = submissionsToCsv(listSubmissions(deps.db));
    c.header("Content-Type", "text/csv; charset=utf-8");
    c.header("Content-Disposition", 'attachment; filename="submissions.csv"');
    return c.body(csv);
  });

  if (deps.staticDir) {
    app.use("*", serveStatic({ root: deps.staticDir }));

    app.get("*", async (c) => {
      const indexPath = path.join(deps.staticDir!, "index.html");
      const html = await fs.promises.readFile(indexPath, "utf-8");
      return c.html(html);
    });
  }

  return app;
}
