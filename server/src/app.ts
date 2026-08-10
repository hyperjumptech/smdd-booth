import {
  type Badge,
  canSubmitBadges,
  getCaseById,
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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
  badges?: Badge[];
};

function validateSubmissionBody(body: SubmissionBody): string | null {
  const name = body.name?.trim();
  if (!name) return "name is required";

  const email = body.email?.trim();
  if (!email || !EMAIL_RE.test(email)) return "invalid email";

  if (!Array.isArray(body.badges) || body.badges.length === 0) {
    return "badges required";
  }

  const seen = new Set<string>();
  for (const b of body.badges) {
    if (!b?.caseId || seen.has(b.caseId)) return "invalid badges";
    seen.add(b.caseId);
    const c = getCaseById(b.caseId);
    if (!c) return "unknown caseId";
    if (b.kind !== c.kind || b.revealName !== c.revealName) {
      return "badge does not match case";
    }
  }

  if (!canSubmitBadges(body.badges)) {
    return "need at least 2 service and 1 product badges";
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
  const header = "id,name,email,badges,created_at";
  const lines = rows.map((row) =>
    [
      String(row.id),
      csvEscape(row.name),
      csvEscape(row.email),
      csvEscape(JSON.stringify(row.badges)),
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
    const badges = body.badges!;

    const { id } = createSubmission(deps.db, {
      name,
      email,
      badges,
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
