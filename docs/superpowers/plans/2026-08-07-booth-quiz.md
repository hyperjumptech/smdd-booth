# Booth Quiz Hyperjump Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first Hyperjump booth quiz (7 questions → service result + PNG card) with a Hono/SQLite API on a VPS and a simple password-protected `/admin` CSV export.

**Architecture:** Vite React SPA in `client/` talks to a Hono API in `server/` backed by SQLite. Shared quiz content and scoring live in `shared/`. In production one Node process serves `/api/*` and the built SPA. Visitors use their phones via QR; staff use `/admin` on the same host.

**Tech Stack:** Vite, React 19, TypeScript, Tailwind CSS v4, React Router v7, html-to-image, Hono, @hono/node-server, better-sqlite3, vitest, cookie-based admin session (HMAC signed).

## Global Constraints

- Indonesian visitor-facing copy only
- Options A–E always map to the five Hyperjump services in the spec
- Admin password only via `ADMIN_PASSWORD` env; validated on server
- SQLite file at `data/booth.sqlite` (gitignored)
- Result PNG must include logo, name, service, tagline, diagnosis, and readable `hyperjump.tech`
- Mobile-first; large tap targets; one question per screen
- Dark Hyperjump palette: black / white / cyan / yellow
- Logo asset: `client/public/hyperjump-logo.png` (already present)
- Spec source of truth: `docs/superpowers/specs/2026-08-07-booth-quiz-design.md`

---

## File Structure

```
/
  package.json                 # workspaces: client, server, shared; scripts
  .gitignore
  .env.example
  README.md
  data/.gitkeep
  shared/
    package.json
    tsconfig.json
    quiz.ts                    # questions, results, scoring helpers
    quiz.test.ts
  server/
    package.json
    tsconfig.json
    src/
      index.ts                 # start node server
      app.ts                   # Hono app (exportable for tests)
      db.ts                    # sqlite init + queries
      auth.ts                  # admin cookie sign/verify
      app.test.ts
  client/
    package.json
    vite.config.ts
    tsconfig.json
    index.html
    public/hyperjump-logo.png
    src/
      main.tsx
      App.tsx
      index.css
      lib/api.ts
      lib/saveCard.ts
      pages/QuizPage.tsx
      pages/AdminPage.tsx
      components/
        WelcomeStep.tsx
        LeadFormStep.tsx
        QuestionStep.tsx
        TiebreakerStep.tsx
        ResultStep.tsx
        ResultCard.tsx
```

---

### Task 1: Scaffold monorepo

**Files:**
- Create: `package.json`, `.gitignore`, `.env.example`, `data/.gitkeep`, `README.md`
- Create: `shared/package.json`, `shared/tsconfig.json`
- Create: `server/package.json`, `server/tsconfig.json`
- Create: `client/package.json`, `client/tsconfig.json`, `client/tsconfig.app.json`, `client/vite.config.ts`, `client/index.html`, `client/src/main.tsx`, `client/src/App.tsx`, `client/src/index.css`
- Keep: `client/public/hyperjump-logo.png`

**Interfaces:**
- Consumes: none
- Produces: npm workspaces `client`, `server`, `shared`; root scripts `dev`, `build`, `test`, `start`

- [ ] **Step 1: Create root workspace files**

`package.json`:

```json
{
  "name": "smdd-booth-2026",
  "private": true,
  "workspaces": ["client", "server", "shared"],
  "scripts": {
    "dev": "npm run dev -w server & npm run dev -w client",
    "dev:client": "npm run dev -w client",
    "dev:server": "npm run dev -w server",
    "build": "npm run build -w shared && npm run build -w client && npm run build -w server",
    "start": "npm run start -w server",
    "test": "npm run test -w shared && npm run test -w server"
  }
}
```

`.gitignore`:

```
node_modules
dist
data/*.sqlite
data/*.sqlite-*
.env
.DS_Store
*.log
```

`.env.example`:

```
ADMIN_PASSWORD=change-me
SESSION_SECRET=change-me-to-a-long-random-string
PORT=3000
```

`data/.gitkeep`: empty file.

`README.md`: short — how to `cp .env.example .env`, `npm install`, `npm run dev:server` + `npm run dev:client`, `npm run build && npm start` on VPS.

- [ ] **Step 2: Scaffold `shared` package**

`shared/package.json`:

```json
{
  "name": "@booth/shared",
  "private": true,
  "type": "module",
  "main": "./dist/quiz.js",
  "types": "./dist/quiz.d.ts",
  "exports": {
    ".": {
      "types": "./dist/quiz.d.ts",
      "import": "./dist/quiz.js"
    }
  },
  "scripts": {
    "build": "tsc",
    "test": "vitest run"
  },
  "devDependencies": {
    "typescript": "^5.8.2",
    "vitest": "^3.0.0"
  }
}
```

`shared/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "declaration": true,
    "outDir": "dist",
    "rootDir": ".",
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["quiz.ts"]
}
```

Create placeholder `shared/quiz.ts`:

```ts
export type Choice = "A" | "B" | "C" | "D" | "E";
export const PLACEHOLDER = true;
```

- [ ] **Step 3: Scaffold `server` package**

`server/package.json`:

```json
{
  "name": "@booth/server",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "vitest run"
  },
  "dependencies": {
    "@booth/shared": "*",
    "@hono/node-server": "^1.14.0",
    "better-sqlite3": "^11.8.0",
    "hono": "^4.7.0"
  },
  "devDependencies": {
    "@types/better-sqlite3": "^7.6.12",
    "@types/node": "^22.13.0",
    "tsx": "^4.19.0",
    "typescript": "^5.8.2",
    "vitest": "^3.0.0"
  }
}
```

`server/tsconfig.json`: strict NodeNext, `outDir: dist`, `rootDir: src`, include `src`.

Minimal `server/src/app.ts` + `server/src/index.ts` that listen on `PORT` and return `GET /api/health` → `{ ok: true }`.

- [ ] **Step 4: Scaffold `client` with Vite React TS + Tailwind**

From repo root:

```bash
npm create vite@latest client -- --template react-ts
```

If `client/` already has `public/`, merge carefully — keep `hyperjump-logo.png`.

Add deps: `react-router-dom`, `html-to-image`, `@booth/shared`, Tailwind v4 (`@tailwindcss/vite`).

`client/vite.config.ts` proxy `/api` → `http://localhost:3000`.

`client/src/App.tsx` temporary: `<div>Booth Quiz</div>`.

- [ ] **Step 5: Install and verify**

```bash
cd /Users/dennypradipta/Projects/smdd-booth-2026
npm install
npm run build -w shared
npm run dev:server
# other terminal:
npm run dev:client
```

Expected: health `http://localhost:3000/api/health` → `{"ok":true}`; Vite opens and shows “Booth Quiz”.

- [ ] **Step 6: Commit**

```bash
git init  # if needed
git add package.json .gitignore .env.example data/.gitkeep README.md shared client server
git commit -m "chore: scaffold booth quiz monorepo"
```

---

### Task 2: Shared quiz content + scoring

**Files:**
- Create: `shared/quiz.ts`, `shared/quiz.test.ts`
- Modify: `shared/tsconfig.json` (include tests excluded from build — keep build include only `quiz.ts`)

**Interfaces:**
- Consumes: none
- Produces:
  - `export type Choice = "A" | "B" | "C" | "D" | "E"`
  - `export type Answer = { questionId: string; choice: Choice }`
  - `export const QUESTIONS: Question[]` (7 items)
  - `export const RESULTS: Record<Choice, ResultContent>`
  - `export function tallyAnswers(answers: Answer[]): Record<Choice, number>`
  - `export function leadingChoices(tallies: Record<Choice, number>): Choice[]`
  - `export function resolveResultKey(answers: Answer[], tiebreaker?: Choice): Choice`

- [ ] **Step 1: Write failing tests in `shared/quiz.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import {
  QUESTIONS,
  RESULTS,
  leadingChoices,
  resolveResultKey,
  tallyAnswers,
  type Answer,
  type Choice,
} from "./quiz.js";

describe("quiz content", () => {
  it("has exactly 7 questions with A-E options", () => {
    expect(QUESTIONS).toHaveLength(7);
    for (const q of QUESTIONS) {
      expect(Object.keys(q.options).sort().join("")).toBe("ABCDE");
    }
  });

  it("defines all five results with hyperjump URLs", () => {
    for (const key of ["A", "B", "C", "D", "E"] as Choice[]) {
      expect(RESULTS[key].service).toBeTruthy();
      expect(RESULTS[key].url).toContain("hyperjump.tech");
      expect(RESULTS[key].tagline).toBeTruthy();
      expect(RESULTS[key].diagnosis).toBeTruthy();
      expect(RESULTS[key].solution).toBeTruthy();
    }
  });
});

describe("scoring", () => {
  it("tallies choices", () => {
    const answers: Answer[] = [
      { questionId: "q1", choice: "A" },
      { questionId: "q2", choice: "A" },
      { questionId: "q3", choice: "B" },
    ];
    expect(tallyAnswers(answers)).toEqual({ A: 2, B: 1, C: 0, D: 0, E: 0 });
  });

  it("returns single leader when no tie", () => {
    const answers: Answer[] = [
      { questionId: "q1", choice: "C" },
      { questionId: "q2", choice: "C" },
      { questionId: "q3", choice: "A" },
      { questionId: "q4", choice: "B" },
      { questionId: "q5", choice: "C" },
      { questionId: "q6", choice: "D" },
      { questionId: "q7", choice: "E" },
    ];
    expect(leadingChoices(tallyAnswers(answers))).toEqual(["C"]);
    expect(resolveResultKey(answers)).toBe("C");
  });

  it("detects ties and uses tiebreaker", () => {
    const answers: Answer[] = [
      { questionId: "q1", choice: "A" },
      { questionId: "q2", choice: "A" },
      { questionId: "q3", choice: "B" },
      { questionId: "q4", choice: "B" },
      { questionId: "q5", choice: "C" },
      { questionId: "q6", choice: "D" },
      { questionId: "q7", choice: "E" },
    ];
    expect(leadingChoices(tallyAnswers(answers)).sort()).toEqual(["A", "B"]);
    expect(resolveResultKey(answers, "B")).toBe("B");
  });

  it("throws if tiebreaker required but missing or invalid", () => {
    const answers: Answer[] = [
      { questionId: "q1", choice: "A" },
      { questionId: "q2", choice: "A" },
      { questionId: "q3", choice: "B" },
      { questionId: "q4", choice: "B" },
      { questionId: "q5", choice: "C" },
      { questionId: "q6", choice: "D" },
      { questionId: "q7", choice: "E" },
    ];
    expect(() => resolveResultKey(answers)).toThrow();
    expect(() => resolveResultKey(answers, "C")).toThrow();
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npm run test -w shared
```

Expected: FAIL (module incomplete / missing exports).

- [ ] **Step 3: Implement `shared/quiz.ts`**

Copy all 7 questions, 5 results (taglines, diagnosis, solution, URLs) verbatim from the design spec into typed constants.

Implement:

```ts
export type Choice = "A" | "B" | "C" | "D" | "E";

export type Question = {
  id: string;
  prompt: string;
  options: Record<Choice, string>;
};

export type ResultContent = {
  service: string;
  url: string;
  tagline: string;
  diagnosis: string;
  solution: string;
};

export type Answer = { questionId: string; choice: Choice };

export const QUESTIONS: Question[] = [/* q1..q7 from spec */];

export const RESULTS: Record<Choice, ResultContent> = {
  A: {
    service: "Inference AI",
    url: "https://hyperjump.tech/en/services/inference-ai",
    tagline: "Saatnya Bebaskan Tim Kamu dari Tugas Manual!",
    diagnosis: "Bisnis kamu butuh efisiensi ekstra!",
    solution:
      "Saatnya lepas tugas manual yang menguras waktu. Kami bantu bangun dan deploy AI agent khusus yang hemat biaya, berjalan otomatis, dan bikin operasional kamu jauh lebih cepat tanpa pusing urusan teknis.",
  },
  B: {
    service: "ERP Implementation",
    url: "https://hyperjump.tech/en/services/erp-implementation",
    tagline: "Saatnya Rapikan & Integrasikan Seluruh Operasional!",
    diagnosis: "Operasional kamu butuh kerapian dan transparansi!",
    solution:
      "Katakan selamat tinggal pada data berantakan. Kami bantu integrasikan seluruh proses bisnis kamu ke dalam solusi ERP kelas enterprise agar laporan akurat dan keputusan bisnis bisa diambil lebih cepat.",
  },
  C: {
    service: "CTO-as-a-Service",
    url: "https://hyperjump.tech/en/services/cto-as-a-service",
    tagline: "Saatnya Punya Kepemimpinan IT Tanpa Pusing Rekrutmen!",
    diagnosis: "Kamu butuh kepemimpinan teknologi yang solid!",
    solution:
      "Gak perlu pusing rekrut dan kelola tim engineering dari nol. Kami sediakan kepemimpinan IT berpengalaman beserta manajemen tim software yang siap mengeksekusi ide bisnis kamu.",
  },
  D: {
    service: "Software as a Service",
    url: "https://hyperjump.tech/en/services/software-as-a-service",
    tagline: "Saatnya Punya Software Kustom yang Pas dengan Bisnis Kamu!",
    diagnosis: "Kamu butuh software yang benar-benar pas dengan bisnis kamu!",
    solution:
      "Jangan paksa bisnis kamu ikutan alur software kaku. Kami bangun dan kembangkan solusi software kustom yang siap di-deploy serta di-scale sesuai kebutuhan perusahaan.",
  },
  E: {
    service: "Tech Due Diligence",
    url: "https://hyperjump.tech/en/services/tech-due-diligence",
    tagline: "Saatnya Pastikan Fondasi Sistem IT Kamu Aman & Ready to Scale!",
    diagnosis: "Kamu butuh kepastian dan keamanan fondasi teknis!",
    solution:
      "Sebelum melangkah lebih jauh untuk ekspansi atau pendanaan, mari kita audit dan evaluasi performa, arsitektur, serta kemampuan eksekusi sistem IT kamu secara mendalam.",
  },
};

export function emptyTallies(): Record<Choice, number> {
  return { A: 0, B: 0, C: 0, D: 0, E: 0 };
}

export function tallyAnswers(answers: Answer[]): Record<Choice, number> {
  const t = emptyTallies();
  for (const a of answers) t[a.choice] += 1;
  return t;
}

export function leadingChoices(tallies: Record<Choice, number>): Choice[] {
  const max = Math.max(...Object.values(tallies));
  return (Object.keys(tallies) as Choice[]).filter((k) => tallies[k] === max);
}

export function resolveResultKey(answers: Answer[], tiebreaker?: Choice): Choice {
  const leaders = leadingChoices(tallyAnswers(answers));
  if (leaders.length === 1) return leaders[0];
  if (!tiebreaker || !leaders.includes(tiebreaker)) {
    throw new Error("Tiebreaker required");
  }
  return tiebreaker;
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm run test -w shared
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add shared
git commit -m "feat: add shared quiz content and scoring"
```

---

### Task 3: SQLite + create submission API

**Files:**
- Create: `server/src/db.ts`, `server/src/app.ts` (expand), `server/src/app.test.ts`
- Modify: `server/src/index.ts`
- Create: `server/vitest.config.ts` if needed

**Interfaces:**
- Consumes: `@booth/shared` `Choice`, `RESULTS`
- Produces:
  - `initDb(path: string): Database`
  - `createSubmission(input): { id: number }`
  - `listSubmissions(): SubmissionRow[]`
  - Hono `POST /api/submissions` body:
    `{ name: string; email: string; answers: Answer[]; resultKey: Choice; tiebreaker?: Choice }`

- [ ] **Step 1: Write failing API test**

`server/src/app.test.ts`:

```ts
import { beforeEach, describe, expect, it } from "vitest";
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
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm run test -w server
```

- [ ] **Step 3: Implement `db.ts` + `createApp`**

`server/src/db.ts`: open better-sqlite3, run schema from spec, export `createSubmission`, `listSubmissions`.

`server/src/app.ts`:

```ts
export type AppDeps = {
  db: Database.Database;
  adminPassword: string;
  sessionSecret: string;
  staticDir?: string;
};

export function createApp(deps: AppDeps) {
  const app = new Hono();
  app.get("/api/health", (c) => c.json({ ok: true }));

  app.post("/api/submissions", async (c) => {
    const body = await c.req.json();
    // validate name non-empty, email with simple regex, answers length 7,
    // resultKey in A-E, optionally verify resolveResultKey(answers, tiebreaker) === resultKey
    // insert; return 201 { id }
  });

  return app;
}
```

Load env in `index.ts`: `ADMIN_PASSWORD`, `SESSION_SECRET`, `PORT`, db path `../data/booth.sqlite` (create `data/` if missing).

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm run test -w server
```

- [ ] **Step 5: Commit**

```bash
git add server
git commit -m "feat: add submissions API and sqlite store"
```

---

### Task 4: Admin login, list, CSV export

**Files:**
- Create: `server/src/auth.ts`
- Modify: `server/src/app.ts`, `server/src/app.test.ts`

**Interfaces:**
- Consumes: `AppDeps`, `listSubmissions`
- Produces:
  - `signAdminSession(secret: string): string`
  - `verifyAdminSession(token: string, secret: string): boolean`
  - `POST /api/admin/login` `{ password }` → Set-Cookie `booth_admin=...; HttpOnly; Path=/; SameSite=Lax`
  - `GET /api/admin/submissions` → JSON array
  - `GET /api/admin/export` → `text/csv` download

- [ ] **Step 1: Extend tests**

Add cases:
- login wrong password → 401
- login correct → 200 + cookie
- list/export without cookie → 401
- list/export with cookie → 200; CSV includes header `id,name,email,result_key,result_label,answers,created_at`

- [ ] **Step 2: Run — expect FAIL**

- [ ] **Step 3: Implement HMAC cookie auth + routes**

Use Node `crypto.createHmac("sha256", sessionSecret).update("admin").digest("hex")` as token value (constant session token is fine for booth; optionally include expiry timestamp in payload).

Middleware: read cookie `booth_admin`, verify, else 401 JSON `{ error: "Unauthorized" }` with no password hints.

CSV: escape fields that contain commas/quotes; filename `submissions.csv`.

- [ ] **Step 4: Run tests — PASS**

- [ ] **Step 5: Commit**

```bash
git add server
git commit -m "feat: add admin auth, list, and CSV export"
```

---

### Task 5: Client shell — theme, router, API helper

**Files:**
- Modify: `client/src/main.tsx`, `client/src/App.tsx`, `client/src/index.css`, `client/index.html`
- Create: `client/src/lib/api.ts`, `client/src/pages/QuizPage.tsx`, `client/src/pages/AdminPage.tsx`

**Interfaces:**
- Consumes: React Router
- Produces: routes `/` → QuizPage, `/admin` → AdminPage; CSS variables for Hyperjump colors; `api.createSubmission`, `api.adminLogin`, `api.adminList`, `api.adminExportUrl`

- [ ] **Step 1: Wire fonts + CSS variables in `index.css`**

Use distinctive fonts via Google Fonts or Fontshare (avoid Inter/Roboto/Arial). Example: display `Syne` or `Outfit`, body `Manrope`.

```css
@import "tailwindcss";

:root {
  --hj-bg: #050505;
  --hj-fg: #ffffff;
  --hj-cyan: #5ec8f0;
  --hj-yellow: #f5d547;
  --hj-muted: #a3a3a3;
}

body {
  margin: 0;
  min-height: 100dvh;
  background: var(--hj-bg);
  color: var(--hj-fg);
  font-family: "Manrope", system-ui, sans-serif;
}
```

- [ ] **Step 2: Router + placeholder pages**

```tsx
// App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QuizPage } from "./pages/QuizPage";
import { AdminPage } from "./pages/AdminPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<QuizPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

Placeholders render title text only.

- [ ] **Step 3: `lib/api.ts`**

```ts
export async function createSubmission(payload: {
  name: string;
  email: string;
  answers: { questionId: string; choice: string }[];
  resultKey: string;
  tiebreaker?: string;
}) {
  const res = await fetch("/api/submissions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Gagal menyimpan hasil");
  return res.json() as Promise<{ id: number }>;
}

export async function adminLogin(password: string) {
  const res = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ password }),
  });
  if (!res.ok) throw new Error("Password salah");
}

export async function adminList() {
  const res = await fetch("/api/admin/submissions", { credentials: "include" });
  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
}

export function adminExportUrl() {
  return "/api/admin/export";
}
```

- [ ] **Step 4: Manual check**

```bash
npm run dev:client
```

Expected: `/` and `/admin` placeholders render with dark background.

- [ ] **Step 5: Commit**

```bash
git add client
git commit -m "feat: add client router, theme, and API helpers"
```

---

### Task 6: Quiz flow — welcome, lead form, state machine

**Files:**
- Create: `client/src/pages/QuizPage.tsx` (state), `client/src/components/WelcomeStep.tsx`, `client/src/components/LeadFormStep.tsx`
- Modify as needed

**Interfaces:**
- Consumes: `@booth/shared` QUESTIONS later
- Produces: QuizPage state:
  - `step: "welcome" | "lead" | "question" | "tiebreaker" | "result"`
  - `name`, `email`, `questionIndex`, `answers`, `tiebreaker`, `resultKey`
  - `reset()` for Mulai Lagi

- [ ] **Step 1: Implement WelcomeStep**

Full-bleed dark welcome: logo `/hyperjump-logo.png`, short CTA (“Cari solusi tech yang pas buat bisnis kamu”), primary button “Mulai”.

- [ ] **Step 2: Implement LeadFormStep**

Fields nama + email; disable lanjut until name non-empty and email matches `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`; errors in Indonesian.

- [ ] **Step 3: Wire QuizPage step switching**

welcome → lead → (stop before questions until Task 7).

- [ ] **Step 4: Manual test on narrow viewport**

Expected: can start and submit lead form; back not required.

- [ ] **Step 5: Commit**

```bash
git add client
git commit -m "feat: add welcome and lead form steps"
```

---

### Task 7: Questions + tiebreaker UI

**Files:**
- Create: `client/src/components/QuestionStep.tsx`, `client/src/components/TiebreakerStep.tsx`
- Modify: `client/src/pages/QuizPage.tsx`

**Interfaces:**
- Consumes: `QUESTIONS`, `RESULTS`, `tallyAnswers`, `leadingChoices`, `resolveResultKey`
- Produces: after Q7, if leaders.length > 1 → tiebreaker else result; tiebreaker options show `A — Inference AI` style labels from `RESULTS[choice].service`

- [ ] **Step 1: QuestionStep**

Props: `question`, `index`, `total`, `onSelect(choice)`.

UI: progress `index+1 / total`, prompt, five large buttons A–E with option text. On select, call `onSelect` immediately (no separate Next).

- [ ] **Step 2: TiebreakerStep**

Props: `leaders: Choice[]`, `onSelect(choice)`.

Prompt: “Mana yang paling urgensi buat kamu selesaikan sekarang?”

- [ ] **Step 3: QuizPage logic**

On each answer push `{ questionId, choice }`. When `answers.length === 7`, compute leaders; branch to tiebreaker or set `resultKey` and go to result.

- [ ] **Step 4: Manual test**

Path without tie: all A → result key A.  
Path with tie: force A/B split then pick B on tiebreaker.

- [ ] **Step 5: Commit**

```bash
git add client
git commit -m "feat: add question and tiebreaker steps"
```

---

### Task 8: Result screen, submit API, PNG card

**Files:**
- Create: `client/src/components/ResultStep.tsx`, `client/src/components/ResultCard.tsx`, `client/src/lib/saveCard.ts`
- Modify: `client/src/pages/QuizPage.tsx`

**Interfaces:**
- Consumes: `createSubmission`, `RESULTS`, `html-to-image` `toPng`
- Produces: `saveResultCard(node: HTMLElement, resultKey: Choice): Promise<void>`

- [ ] **Step 1: ResultCard (capture target)**

Fixed aspect (e.g. width 360 CSS px, aspect 9/16 or 1080/1350 ratio). Contents:
- logo
- “Untuk {firstName}”
- service name + tagline + diagnosis
- footer: `hyperjump.tech` (required) and `SMDD 2026`

Do **not** put action buttons inside this node.

- [ ] **Step 2: `saveCard.ts`**

```ts
import { toPng } from "html-to-image";
import type { Choice } from "@booth/shared";

export async function saveResultCard(node: HTMLElement, resultKey: Choice) {
  const dataUrl = await toPng(node, { pixelRatio: 2, cacheBust: true });
  const blob = await (await fetch(dataUrl)).blob();
  const file = new File([blob], `hyperjump-quiz-${resultKey}.png`, {
    type: "image/png",
  });

  const nav = navigator as Navigator & {
    canShare?: (data: SharingData) => boolean;
  };

  if (nav.canShare?.({ files: [file] })) {
    await navigator.share({
      files: [file],
      title: "Hasil Kuis Hyperjump",
    });
    return;
  }

  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = file.name;
  a.click();
}
```

- [ ] **Step 3: ResultStep**

On mount: call `createSubmission` once (guard with ref). Show save status / retry if fail.

UI order: ResultCard → link to service URL → “Simpan Kartu” → “Mulai Lagi”.

Simpan Kartu: call `saveResultCard`; on error show “Gagal menyimpan kartu. Coba lagi.”

- [ ] **Step 4: Manual test**

With server running: finish quiz → row in DB; Simpan Kartu downloads/shares PNG containing `hyperjump.tech`.

- [ ] **Step 5: Commit**

```bash
git add client
git commit -m "feat: add result card, submit, and PNG export"
```

---

### Task 9: Admin page UI

**Files:**
- Modify: `client/src/pages/AdminPage.tsx`

**Interfaces:**
- Consumes: `adminLogin`, `adminList`, `adminExportUrl`
- Produces: password form → table → export link (`<a href="/api/admin/export">` with `credentials` note: use `window.open` or fetch blob download with credentials)

- [ ] **Step 1: Login form**

Plain UI; wrong password → “Password salah” (no hints).

- [ ] **Step 2: After login load list**

Table columns: nama, email, hasil (`result_label`), waktu.

Empty: “Belum ada data.”

- [ ] **Step 3: Export button**

```ts
async function downloadCsv() {
  const res = await fetch("/api/admin/export", { credentials: "include" });
  if (!res.ok) throw new Error("Export gagal");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "submissions.csv";
  a.click();
  URL.revokeObjectURL(url);
}
```

- [ ] **Step 4: Manual test**

Login with `.env` password; see submission from Task 8; CSV opens in spreadsheet.

- [ ] **Step 5: Commit**

```bash
git add client
git commit -m "feat: add admin login, list, and export UI"
```

---

### Task 10: Production static serve + polish

**Files:**
- Modify: `server/src/app.ts`, `server/src/index.ts`, `README.md`, root `package.json` scripts if needed

**Interfaces:**
- Consumes: `client/dist`
- Produces: in production, Hono serves SPA assets and `GET *` → `index.html` for client routes; `/api/*` unchanged

- [ ] **Step 1: Serve static files when `staticDir` set**

Use `serveStatic` from `@hono/node-server/serve-static` or read files manually. Fallback: non-API GETs return `index.html`.

- [ ] **Step 2: Build + start smoke test**

```bash
npm run build
ADMIN_PASSWORD=test SESSION_SECRET=test npm start
```

Open `http://localhost:3000/`, complete quiz, open `/admin`, export.

- [ ] **Step 3: README deploy notes for VPS**

Document: Node 22+, `npm ci`, `npm run build`, systemd or pm2 example, env vars, ensure `data/` writable, reverse proxy HTTPS optional.

- [ ] **Step 4: Visual polish pass**

Ensure welcome is one composition; question buttons large enough for thumbs; result card looks intentional (cyan/yellow accents, not purple gradient).

- [ ] **Step 5: Commit**

```bash
git add server README.md package.json client
git commit -m "feat: serve SPA from API server for VPS deploy"
```

---

## Spec coverage checklist (self-review)

| Spec requirement | Task |
| --- | --- |
| Vite React SPA + Tailwind + Router | 1, 5 |
| Hono + SQLite on VPS | 1, 3, 10 |
| POST submissions | 3, 8 |
| Admin password + list + CSV | 4, 9 |
| 7 questions A–E + content | 2, 7 |
| Tiebreaker on demand | 2, 7 |
| Result copy + service links | 2, 8 |
| Simpan Kartu PNG + hyperjump.tech | 8 |
| Mulai Lagi manual reset | 6, 8 |
| Mobile-first dark Hyperjump UI | 5–8, 10 |
| Submit retry on failure | 8 |
| Logo asset | already present; used in 6, 8 |

## Execution handoff

Plan complete and saved to `docs/superpowers/plans/2026-08-07-booth-quiz.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** — dispatch a fresh subagent per task, review between tasks, fast iteration  
2. **Inline Execution** — execute tasks in this session with executing-plans and checkpoints  

Which approach?
