import { CASES } from "@booth/shared";
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

function sampleBadges() {
  const services = CASES.filter((c) => c.kind === "service").slice(0, 2);
  const product = CASES.find((c) => c.kind === "product")!;
  return [...services, product].map((c) => ({
    caseId: c.id,
    kind: c.kind,
    revealName: c.revealName,
  }));
}

describe("POST /api/submissions", () => {
  it("stores a valid badge submission", async () => {
    const app = createApp({
      db: tempDb(),
      adminPassword: "secret",
      sessionSecret: "sess",
    });
    const res = await app.request("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Denny",
        email: "denny@example.com",
        badges: sampleBadges(),
      }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.id).toEqual(expect.any(Number));
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
        badges: sampleBadges(),
      }),
    });
    expect(res.status).toBe(400);
  });

  it("rejects when fewer than 2 services or 0 products", async () => {
    const app = createApp({
      db: tempDb(),
      adminPassword: "secret",
      sessionSecret: "sess",
    });
    const service = CASES.find((c) => c.kind === "service")!;
    const product = CASES.find((c) => c.kind === "product")!;
    const badges = [
      {
        caseId: service.id,
        kind: service.kind,
        revealName: service.revealName,
      },
      {
        caseId: product.id,
        kind: product.kind,
        revealName: product.revealName,
      },
    ];
    const res = await app.request("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Denny",
        email: "denny@example.com",
        badges,
      }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("need at least 2 service and 1 product badges");
  });

  it("rejects unknown caseId or kind/revealName mismatch", async () => {
    const app = createApp({
      db: tempDb(),
      adminPassword: "secret",
      sessionSecret: "sess",
    });
    const badges = sampleBadges();
    badges[0] = {
      caseId: "nonexistent-case",
      kind: "service",
      revealName: "Fake",
    };
    const res = await app.request("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Denny",
        email: "denny@example.com",
        badges,
      }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("unknown caseId");
  });
});

async function createSampleSubmission(app: ReturnType<typeof createApp>) {
  await app.request("/api/submissions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Denny",
      email: "denny@example.com",
      badges: sampleBadges(),
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
    expect(list[0].badges).toEqual(sampleBadges());

    const exportRes = await app.request("/api/admin/export", {
      headers: { Cookie: cookie },
    });
    expect(exportRes.status).toBe(200);
    expect(exportRes.headers.get("Content-Type")).toContain("text/csv");
    expect(exportRes.headers.get("Content-Disposition")).toContain(
      "submissions.csv",
    );
    const csv = await exportRes.text();
    expect(csv.split("\n")[0]).toBe("id,name,email,badges,created_at");
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
