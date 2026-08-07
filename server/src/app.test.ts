import { describe, expect, it } from "vitest";
import { createApp } from "./app.js";
import { initDb } from "./db.js";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

function tempDb() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "booth-"));
  const dbPath = path.join(dir, "test.sqlite");
  return initDb(dbPath);
}

describe("POST /api/submissions", () => {
  it("stores a valid submission", async () => {
    const db = tempDb();
    const app = createApp({ db, adminPassword: "secret", sessionSecret: "sess" });
    const answers = [
      { questionId: "q1", choice: "A" },
      { questionId: "q2", choice: "A" },
      { questionId: "q3", choice: "A" },
      { questionId: "q4", choice: "B" },
      { questionId: "q5", choice: "C" },
      { questionId: "q6", choice: "D" },
      { questionId: "q7", choice: "E" },
    ];
    const res = await app.request("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Denny",
        email: "denny@example.com",
        answers,
        resultKey: "A",
      }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.id).toBeTypeOf("number");
  });

  it("rejects invalid email", async () => {
    const db = tempDb();
    const app = createApp({ db, adminPassword: "secret", sessionSecret: "sess" });
    const res = await app.request("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "X",
        email: "not-an-email",
        answers: [],
        resultKey: "A",
      }),
    });
    expect(res.status).toBe(400);
  });

  it("accepts tiebreaker answer in answers array", async () => {
    const db = tempDb();
    const app = createApp({ db, adminPassword: "secret", sessionSecret: "sess" });
    const questionAnswers = [
      { questionId: "q1", choice: "A" },
      { questionId: "q2", choice: "A" },
      { questionId: "q3", choice: "A" },
      { questionId: "q4", choice: "B" },
      { questionId: "q5", choice: "B" },
      { questionId: "q6", choice: "B" },
      { questionId: "q7", choice: "C" },
    ];
    const answers = [
      ...questionAnswers,
      { questionId: "tiebreaker", choice: "A" },
    ];
    const res = await app.request("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Denny",
        email: "denny@example.com",
        answers,
        resultKey: "A",
      }),
    });
    expect(res.status).toBe(201);
  });

  it("rejects resultKey mismatch", async () => {
    const db = tempDb();
    const app = createApp({ db, adminPassword: "secret", sessionSecret: "sess" });
    const answers = [
      { questionId: "q1", choice: "A" },
      { questionId: "q2", choice: "A" },
      { questionId: "q3", choice: "A" },
      { questionId: "q4", choice: "B" },
      { questionId: "q5", choice: "C" },
      { questionId: "q6", choice: "D" },
      { questionId: "q7", choice: "E" },
    ];
    const res = await app.request("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Denny",
        email: "denny@example.com",
        answers,
        resultKey: "B",
      }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("resultKey does not match answers");
  });
});

const SAMPLE_ANSWERS = [
  { questionId: "q1", choice: "A" },
  { questionId: "q2", choice: "A" },
  { questionId: "q3", choice: "A" },
  { questionId: "q4", choice: "B" },
  { questionId: "q5", choice: "C" },
  { questionId: "q6", choice: "D" },
  { questionId: "q7", choice: "E" },
];

async function createSampleSubmission(app: ReturnType<typeof createApp>) {
  await app.request("/api/submissions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Denny",
      email: "denny@example.com",
      answers: SAMPLE_ANSWERS,
      resultKey: "A",
    }),
  });
}

async function adminLogin(
  app: ReturnType<typeof createApp>,
  password: string,
): Promise<Response> {
  return app.request("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
}

function cookieHeader(res: Response): string | undefined {
  const setCookie = res.headers.getSetCookie?.() ?? [];
  const boothCookie = setCookie.find((c) => c.startsWith("booth_admin="));
  return boothCookie?.split(";")[0];
}

describe("admin auth", () => {
  it("login wrong password → 401", async () => {
    const db = tempDb();
    const app = createApp({ db, adminPassword: "secret", sessionSecret: "sess" });
    const res = await adminLogin(app, "wrong");
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("login correct → 200 + cookie", async () => {
    const db = tempDb();
    const app = createApp({ db, adminPassword: "secret", sessionSecret: "sess" });
    const res = await adminLogin(app, "secret");
    expect(res.status).toBe(200);
    const cookie = cookieHeader(res);
    expect(cookie).toBeDefined();
    expect(cookie).toMatch(/^booth_admin=/);
    expect(res.headers.getSetCookie?.()[0]).toContain("HttpOnly");
    expect(res.headers.getSetCookie?.()[0]).toContain("Path=/");
    expect(res.headers.getSetCookie?.()[0]).toContain("SameSite=Lax");
  });

  it("list/export without cookie → 401", async () => {
    const db = tempDb();
    const app = createApp({ db, adminPassword: "secret", sessionSecret: "sess" });
    await createSampleSubmission(app);

    const listRes = await app.request("/api/admin/submissions");
    expect(listRes.status).toBe(401);
    expect(await listRes.json()).toEqual({ error: "Unauthorized" });

    const exportRes = await app.request("/api/admin/export");
    expect(exportRes.status).toBe(401);
    expect(await exportRes.json()).toEqual({ error: "Unauthorized" });
  });

  it("list/export with cookie → 200; CSV includes header", async () => {
    const db = tempDb();
    const app = createApp({ db, adminPassword: "secret", sessionSecret: "sess" });
    await createSampleSubmission(app);

    const loginRes = await adminLogin(app, "secret");
    const cookie = cookieHeader(loginRes)!;

    const listRes = await app.request("/api/admin/submissions", {
      headers: { Cookie: cookie },
    });
    expect(listRes.status).toBe(200);
    const list = await listRes.json();
    expect(list).toHaveLength(1);
    expect(list[0].name).toBe("Denny");
    expect(list[0].email).toBe("denny@example.com");

    const exportRes = await app.request("/api/admin/export", {
      headers: { Cookie: cookie },
    });
    expect(exportRes.status).toBe(200);
    expect(exportRes.headers.get("Content-Type")).toContain("text/csv");
    expect(exportRes.headers.get("Content-Disposition")).toContain(
      "submissions.csv",
    );
    const csv = await exportRes.text();
    expect(csv.split("\n")[0]).toBe(
      "id,name,email,result_key,result_label,answers,created_at",
    );
    expect(csv).toContain("Denny");
    expect(csv).toContain("denny@example.com");
  });
});

describe("static SPA", () => {
  it("serves index.html and SPA fallback when staticDir is set", async () => {
    const db = tempDb();
    const staticDir = fs.mkdtempSync(path.join(os.tmpdir(), "booth-static-"));
    fs.writeFileSync(
      path.join(staticDir, "index.html"),
      "<!DOCTYPE html><html><body>SPA</body></html>",
    );
    fs.writeFileSync(path.join(staticDir, "app.js"), "console.log('ok');");

    const app = createApp({
      db,
      adminPassword: "secret",
      sessionSecret: "sess",
      staticDir,
    });

    const rootRes = await app.request("/");
    expect(rootRes.status).toBe(200);
    expect(await rootRes.text()).toContain("SPA");

    const assetRes = await app.request("/app.js");
    expect(assetRes.status).toBe(200);
    expect(await assetRes.text()).toContain("console.log");

    const adminRes = await app.request("/admin");
    expect(adminRes.status).toBe(200);
    expect(await adminRes.text()).toContain("SPA");

    const apiRes = await app.request("/api/health");
    expect(apiRes.status).toBe(200);
    expect(await apiRes.json()).toEqual({ ok: true });
  });
});
