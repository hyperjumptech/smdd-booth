# Booth Badge Detective Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the A–E quiz with a detective badge hunt: mixed pain-first cases → read story → reveal service/product badge → submit when ≥2 service + ≥1 product badges.

**Architecture:** Shared `CASES` content drives the SPA. Client keeps progress in `localStorage` until `POST /api/submissions` with `{ name, email, badges[] }`. SQLite stores badge JSON per lead. Admin lists badges instead of quiz answers. Old quiz scoring, PNG card, and question UI are removed.

**Tech Stack:** Vite + React 19 + TypeScript + Tailwind (client); Hono + better-sqlite3 (server); `@booth/shared` cases package; existing Docker/compose unchanged.

## Global Constraints

- Submit requires ≥ **2** badges with `kind: "service"` and ≥ **1** with `kind: "product"`.
- Problems list must **not** show Service/Product labels or official names — only `painTitle`.
- Reveal name/kind only after scroll gate (~90%) + “Selesaikan masalah ini!”.
- Lead (name + email) before explore; Badges tab shows `revealName` + `Service`/`Product` label + counters + Submit / Siap stamp.
- Dark Hyperjump mobile-first UI; Indonesian copy.
- Drop quiz A–E, tiebreaker, ResultCard PNG flow.
- Auth/env (`ADMIN_PASSWORD`, `SESSION_SECRET`) unchanged.
- On schema change: wipe or migrate SQLite (`data/booth.sqlite`) — prefer recreate table for this booth rewrite.

---

## File map

| Path | Responsibility |
| --- | --- |
| `shared/cases.ts` | Case types, `CASES`, badge helpers (`countKinds`, `canSubmitBadges`) |
| `shared/cases.test.ts` | Unit tests for helpers + case inventory invariants |
| `shared/quiz.ts` / `quiz.test.ts` | **Delete** after cases land |
| `server/src/db.ts` | Schema + create/list with `badges` JSON |
| `server/src/app.ts` | Validate badge submissions; CSV with badges |
| `server/src/app.test.ts` | API tests for new payload |
| `client/src/lib/boothStorage.ts` | localStorage lead + badges + submitted |
| `client/src/hooks/useBoothState.ts` | Welcome → lead → tabs; earn badge; submit |
| `client/src/pages/BoothPage.tsx` | Shell: welcome, lead, Problems/Badges tabs |
| `client/src/components/ProblemsList.tsx` | Pain titles + solved state |
| `client/src/components/CaseDetail.tsx` | Story scroll gate + solve + reveal |
| `client/src/components/BadgesTab.tsx` | Badge list, counters, submit, Siap stamp |
| `client/src/components/LeadFormStep.tsx` | Keep; wire to booth state |
| `client/src/components/WelcomeStep.tsx` | Detective framing copy |
| `client/src/App.tsx` | Route `/` → `BoothPage` |
| `client/src/lib/api.ts` | `createSubmission` badge payload |
| `client/src/pages/AdminPage.tsx` | Show badges instead of quiz answers |
| Remove | `QuizPage`, quiz steps, `ResultCard`, `saveCard`, `useQuizState`, `leadStorage` (fold into boothStorage) |

---

### Task 1: Shared cases model + helpers

**Files:**
- Create: `shared/cases.ts`
- Create: `shared/cases.test.ts`
- Modify: `shared/package.json` (exports still `.` → build `cases` as main entry — point `main`/`types`/`exports` to `./dist/cases.js` and `./dist/cases.d.ts`)
- Delete after tests pass and dependents updated (Task 2+): `shared/quiz.ts`, `shared/quiz.test.ts` — **do not delete until Task 2 compiles**; for Task 1 keep both files temporarily OR replace quiz exports with re-exports — prefer: Task 1 only add `cases.ts`; Task 8 deletes quiz.

**Interfaces:**
- Produces:
  - `export type CaseKind = "service" | "product"`
  - `export type BoothCase = { id: string; kind: CaseKind; painTitle: string; story: string; revealName: string; revealBody: string; url?: string }`
  - `export type Badge = { caseId: string; kind: CaseKind; revealName: string }`
  - `export const CASES: BoothCase[]`
  - `export function getCaseById(id: string): BoothCase | undefined`
  - `export function countKinds(badges: Badge[]): { service: number; product: number }`
  - `export function canSubmitBadges(badges: Badge[]): boolean` — true iff service ≥ 2 && product ≥ 1
  - `export const MIN_SERVICE_BADGES = 2` / `export const MIN_PRODUCT_BADGES = 1`

- [ ] **Step 1: Write failing tests**

Create `shared/cases.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  CASES,
  canSubmitBadges,
  countKinds,
  getCaseById,
  type Badge,
} from "./cases.js";

describe("CASES inventory", () => {
  it("has unique ids and required fields", () => {
    const ids = new Set<string>();
    for (const c of CASES) {
      expect(c.id.length).toBeGreaterThan(0);
      expect(ids.has(c.id)).toBe(false);
      ids.add(c.id);
      expect(["service", "product"]).toContain(c.kind);
      expect(c.painTitle.length).toBeGreaterThan(0);
      expect(c.story.length).toBeGreaterThan(40);
      expect(c.revealName.length).toBeGreaterThan(0);
      expect(c.revealBody.length).toBeGreaterThan(0);
    }
  });

  it("includes at least 5 services and 3 products", () => {
    const services = CASES.filter((c) => c.kind === "service");
    const products = CASES.filter((c) => c.kind === "product");
    expect(services.length).toBeGreaterThanOrEqual(5);
    expect(products.length).toBeGreaterThanOrEqual(3);
  });
});

describe("badge helpers", () => {
  it("countKinds and canSubmitBadges enforce 2+1", () => {
    const badges: Badge[] = [
      { caseId: "a", kind: "service", revealName: "A" },
      { caseId: "b", kind: "service", revealName: "B" },
      { caseId: "c", kind: "product", revealName: "C" },
    ];
    expect(countKinds(badges)).toEqual({ service: 2, product: 1 });
    expect(canSubmitBadges(badges)).toBe(true);
    expect(canSubmitBadges(badges.slice(0, 2))).toBe(false);
  });

  it("getCaseById returns case", () => {
    const first = CASES[0];
    expect(getCaseById(first.id)?.id).toBe(first.id);
    expect(getCaseById("missing")).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `npm test -w shared`

Expected: FAIL (cannot resolve `./cases.js` or exports missing)

- [ ] **Step 3: Implement `shared/cases.ts`**

Include **all 5 Hyperjump services** plus products from the site (TypeTable, Hydra8, Avenu, Frontier News, MediaPulse, StartGPT, NEO Sense, Monitime, Monika, Grule, WhatsApp Chatbot Connector). Pain titles in Indonesian; stories ≥ ~80 words placeholder OK (can refine copy later). Mix kinds; do **not** put `revealName` into `painTitle`.

Example shape (repeat for full inventory):

```ts
export type CaseKind = "service" | "product";

export type BoothCase = {
  id: string;
  kind: CaseKind;
  painTitle: string;
  story: string;
  revealName: string;
  revealBody: string;
  url?: string;
};

export type Badge = {
  caseId: string;
  kind: CaseKind;
  revealName: string;
};

export const MIN_SERVICE_BADGES = 2;
export const MIN_PRODUCT_BADGES = 1;

export const CASES: BoothCase[] = [
  {
    id: "cto-as-a-service",
    kind: "service",
    painTitle: "Tim IT lemot banget kerjanya",
    story:
      "Kamu punya tim engineering, tapi roadmap molor, prioritas berubah tiap minggu, dan gak ada yang pegang arah teknis…", // keep long
    revealName: "CTO-as-a-Service",
    revealBody:
      "Cocok untuk founder non-teknis / growth-stage. Hyperjump sediakan kepemimpinan IT dan eksekusi roadmap tanpa rekrut CTO full-time.",
    url: "https://hyperjump.tech/en/services/cto-as-a-service",
  },
  // … Inference AI, ERP, Software as a Service, Tech Due Diligence
  // … products with kind: "product" and matching URLs under /en/products where possible
];

export function getCaseById(id: string): BoothCase | undefined {
  return CASES.find((c) => c.id === id);
}

export function countKinds(badges: Badge[]): { service: number; product: number } {
  let service = 0;
  let product = 0;
  for (const b of badges) {
    if (b.kind === "service") service += 1;
    else if (b.kind === "product") product += 1;
  }
  return { service, product };
}

export function canSubmitBadges(badges: Badge[]): boolean {
  const { service, product } = countKinds(badges);
  return service >= MIN_SERVICE_BADGES && product >= MIN_PRODUCT_BADGES;
}
```

Update `shared/package.json` exports to `./dist/cases.js` (and types). Update `shared/tsconfig.json` `include` if needed so `cases.ts` builds.

- [ ] **Step 4: Run tests — expect PASS**

Run: `npm run build -w shared && npm test -w shared`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add shared/cases.ts shared/cases.test.ts shared/package.json shared/tsconfig.json
git commit -m "feat: add shared booth cases and badge helpers"
```

---

### Task 2: Server DB + submissions API for badges

**Files:**
- Modify: `server/src/db.ts`
- Modify: `server/src/app.ts`
- Modify: `server/src/app.test.ts`
- Modify: server imports — stop importing `QUESTIONS` / `RESULTS` / `resolveResultKey` from quiz; use `CASES`, `Badge`, `canSubmitBadges`, `getCaseById` from `@booth/shared`

**Interfaces:**
- Consumes: `Badge`, `CASES`, `canSubmitBadges`, `getCaseById`, `CaseKind` from `@booth/shared`
- Produces: `createSubmission(db, { name, email, badges })`; `listSubmissions` returns `{ id, name, email, badges, created_at }`

- [ ] **Step 1: Rewrite failing API tests**

Replace quiz-oriented tests in `server/src/app.test.ts` with badge tests. Core cases:

```ts
import { CASES } from "@booth/shared";

function sampleBadges() {
  const services = CASES.filter((c) => c.kind === "service").slice(0, 2);
  const product = CASES.find((c) => c.kind === "product")!;
  return [...services, product].map((c) => ({
    caseId: c.id,
    kind: c.kind,
    revealName: c.revealName,
  }));
}

it("stores a valid badge submission", async () => {
  const app = createApp({ db: tempDb(), adminPassword: "secret", sessionSecret: "sess" });
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

it("rejects when fewer than 2 services or 0 products", async () => {
  // one service + one product → 400
});

it("rejects unknown caseId or kind/revealName mismatch", async () => {
  // 400
});
```

Also update admin list/export assertions: expect `badges` on list rows; CSV header `id,name,email,badges,created_at`.

- [ ] **Step 2: Run tests — expect FAIL**

Run: `npm run build -w shared && npm test -w server`

Expected: FAIL on old schema / validation

- [ ] **Step 3: Update `db.ts`**

```ts
const SCHEMA = `
CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  badges TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;
```

In `initDb`, after `db.exec(SCHEMA)`, migrate old quiz tables:

```ts
const cols = db.prepare(`PRAGMA table_info(submissions)`).all() as { name: string }[];
const names = new Set(cols.map((c) => c.name));
if (names.has("answers") || names.has("result_key")) {
  db.exec(`
    DROP TABLE IF EXISTS submissions;
    ${SCHEMA}
  `);
}
```

`createSubmission` / `listSubmissions` read/write `badges` as `Badge[]` JSON.

- [ ] **Step 4: Update `app.ts` validation + handlers**

```ts
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
```

CSV:

```ts
const header = "id,name,email,badges,created_at";
// badges column = JSON.stringify(row.badges)
```

- [ ] **Step 5: Run tests — expect PASS**

Run: `npm test -w server`

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add server/src/db.ts server/src/app.ts server/src/app.test.ts
git commit -m "feat: accept badge submissions in API and SQLite"
```

---

### Task 3: Client booth storage + state hook

**Files:**
- Create: `client/src/lib/boothStorage.ts`
- Create: `client/src/hooks/useBoothState.ts`
- Modify: `client/src/lib/api.ts` — badge payload

**Interfaces:**
- Consumes: `Badge`, `BoothCase`, `CASES`, `canSubmitBadges`, `countKinds`, `getCaseById` from `@booth/shared`
- Produces:
  - `loadBoothProgress()` / `saveBoothProgress(state)`
  - `useBoothState()` → `{ step, name, email, badges, submitted, submissionId, setLead, goExplore, earnBadge, hasBadge, resetBadges, markSubmitted, … }`
  - Steps: `"welcome" | "lead" | "explore"`

- [ ] **Step 1: Implement `boothStorage.ts`**

```ts
import type { Badge } from "@booth/shared";

const KEY = "booth-progress-v1";

export type BoothProgress = {
  name: string;
  email: string;
  badges: Badge[];
  submitted: boolean;
  submissionId?: number;
};

export function loadBoothProgress(): BoothProgress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      return { name: "", email: "", badges: [], submitted: false };
    }
    const parsed = JSON.parse(raw) as Partial<BoothProgress>;
    return {
      name: typeof parsed.name === "string" ? parsed.name : "",
      email: typeof parsed.email === "string" ? parsed.email : "",
      badges: Array.isArray(parsed.badges) ? (parsed.badges as Badge[]) : [],
      submitted: Boolean(parsed.submitted),
      submissionId:
        typeof parsed.submissionId === "number" ? parsed.submissionId : undefined,
    };
  } catch {
    return { name: "", email: "", badges: [], submitted: false };
  }
}

export function saveBoothProgress(progress: BoothProgress): void {
  localStorage.setItem(KEY, JSON.stringify(progress));
}
```

- [ ] **Step 2: Implement `useBoothState.ts`**

- Init from `loadBoothProgress`; if name+email already set, `step` can start at `"explore"` **or** always `"welcome"` then lead prefilled — **prefer:** start `"welcome"`; lead form prefilled; after lead submit → `"explore"`.
- `earnBadge(caseId)`: if already earned, no-op; else push `{ caseId, kind, revealName }` from `getCaseById`, persist.
- `resetProgress()`: clear badges + submitted; keep name/email; stay on explore (Mulai Lagi).
- Persist on every change via `saveBoothProgress`.

- [ ] **Step 3: Update `api.ts`**

```ts
export async function createSubmission(payload: {
  name: string;
  email: string;
  badges: { caseId: string; kind: string; revealName: string }[];
}) {
  const res = await fetch("/api/submissions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Gagal menyimpan hasil");
  return res.json() as Promise<{ id: number }>;
}
```

- [ ] **Step 4: Typecheck client**

Run: `npm run build -w shared && npx tsc -p client --noEmit` (or `npm run build -w client` once UI wires — may fail until Task 4–6; at minimum ensure new files alone typecheck).

If full client build still references quiz, defer full build to Task 6.

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/boothStorage.ts client/src/hooks/useBoothState.ts client/src/lib/api.ts
git commit -m "feat: add booth progress storage and state hook"
```

---

### Task 4: Welcome + lead + BoothPage shell with tabs

**Files:**
- Create: `client/src/pages/BoothPage.tsx`
- Modify: `client/src/App.tsx` — render `BoothPage` at `/`
- Modify: `client/src/components/WelcomeStep.tsx` — detective copy
- Modify: `client/src/components/LeadFormStep.tsx` — keep validation; onSubmit → explore
- Create stub: `client/src/components/ProblemsList.tsx` (list `painTitle` only)
- Create stub: `client/src/components/BadgesTab.tsx` (empty state OK)

- [ ] **Step 1: Welcome copy**

Title/CTA framing: detective — e.g. subtitle “Pilih masalah, pecahkan kasusnya, kumpulkan badge.” Button “Mulai”.

- [ ] **Step 2: `BoothPage.tsx`**

```tsx
// welcome → WelcomeStep
// lead → LeadFormStep
// explore → header + tab buttons Problems | Badges
//   problems → ProblemsList (stub: map CASES to buttons showing only painTitle)
//   badges → BadgesTab stub
```

Layout: `main` `w-full max-w-md mx-auto min-h-dvh` (existing pattern).

- [ ] **Step 3: Wire `App.tsx`**

```tsx
import { BoothPage } from "./pages/BoothPage";
// Route path="/" element={<BoothPage />}
```

- [ ] **Step 4: Manual smoke**

Run: `npm run dev`  
Expected: welcome → lead → two tabs; Problems shows pain titles only (no “CTO-as-a-Service” in list text).

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/BoothPage.tsx client/src/App.tsx client/src/components/WelcomeStep.tsx client/src/components/ProblemsList.tsx client/src/components/BadgesTab.tsx client/src/components/LeadFormStep.tsx
git commit -m "feat: add booth shell with Problems and Badges tabs"
```

---

### Task 5: Case detail — scroll gate, solve, reveal, earn badge

**Files:**
- Create: `client/src/components/CaseDetail.tsx`
- Modify: `client/src/components/ProblemsList.tsx` — open detail
- Modify: `client/src/pages/BoothPage.tsx` — selected case id state
- Modify: `client/src/hooks/useBoothState.ts` if needed (`earnBadge`)

**Interfaces:**
- Consumes: `BoothCase`, `earnBadge`, `hasBadge(caseId)`
- Produces: CaseDetail UI with scroll gate

- [ ] **Step 1: Implement scroll gate**

In `CaseDetail`:

- Story in `overflow-y-auto` container with `max-h` (e.g. `50dvh` or flex fill).
- `onScroll`: if `scrollTop + clientHeight >= scrollHeight * 0.9` → `setReadEnough(true)`.
- Also if content fits without scroll (`scrollHeight <= clientHeight`) → treat as read enough on mount.
- If `hasBadge`, show reveal read-only; hide solve or show “Sudah diselesaikan”.

- [ ] **Step 2: Solve → loading → reveal**

- Button label: **Selesaikan masalah ini!** (disabled until `readEnough`).
- On click: `setPhase("loading")` ~600–900ms → `earnBadge(case.id)` → `setPhase("reveal")`.
- Reveal shows `revealName`, `revealBody`, optional `url` link, close button.

- [ ] **Step 3: Problems list marks solved**

Solved = `badges.some(b => b.caseId === c.id)` — checkmark / muted style; still tappable.

- [ ] **Step 4: Manual smoke**

Expected: cannot solve until scroll; after solve, badge count increases; reopen no duplicate badge.

- [ ] **Step 5: Commit**

```bash
git add client/src/components/CaseDetail.tsx client/src/components/ProblemsList.tsx client/src/pages/BoothPage.tsx client/src/hooks/useBoothState.ts
git commit -m "feat: add case story scroll gate and badge reveal"
```

---

### Task 6: Badges tab — counters, submit, Siap stamp

**Files:**
- Modify: `client/src/components/BadgesTab.tsx`
- Modify: `client/src/hooks/useBoothState.ts` — `markSubmitted`
- Use: `createSubmission` from `api.ts`
- Use: `canSubmitBadges`, `countKinds`, `MIN_*` from shared

- [ ] **Step 1: UI**

- Counters: `Service {n}/2 · Product {m}/1`
- List: each badge `revealName` + pill `Service` | `Product`
- Submit button disabled unless `canSubmitBadges(badges) && !submitted`
- On success: set `submitted` + `submissionId` in storage; show **Siap stamp** banner (large, staff-readable)
- Error + retry on failure
- Optional **Mulai Lagi**: `resetProgress()` clears badges/submitted, keep lead

- [ ] **Step 2: Submit handler**

```ts
const { id } = await createSubmission({ name, email, badges });
markSubmitted(id);
```

- [ ] **Step 3: Manual smoke**

Earn 2 service + 1 product → submit → Siap stamp; refresh keeps state from localStorage.

- [ ] **Step 4: Commit**

```bash
git add client/src/components/BadgesTab.tsx client/src/hooks/useBoothState.ts
git commit -m "feat: add badges tab submit and siap stamp state"
```

---

### Task 7: Admin UI for badges

**Files:**
- Modify: `client/src/pages/AdminPage.tsx`

- [ ] **Step 1: Types**

```ts
type Submission = {
  id: number;
  name: string;
  email: string;
  badges: { caseId: string; kind: string; revealName: string }[];
  created_at: string;
};
```

- [ ] **Step 2: Expandable row**

Replace quiz answer formatting with badge list: `revealName` + kind. Keep pagination PAGE_SIZE 10. CSV export unchanged endpoint (new columns from server).

- [ ] **Step 3: Smoke**

Login admin → see badges on expanded row after a real submission.

- [ ] **Step 4: Commit**

```bash
git add client/src/pages/AdminPage.tsx
git commit -m "feat: show earned badges in admin list"
```

---

### Task 8: Remove old quiz code + docs polish

**Files:**
- Delete: `client/src/pages/QuizPage.tsx`, `client/src/hooks/useQuizState.ts`, `client/src/components/QuestionStep.tsx`, `TiebreakerStep.tsx`, `ResultStep.tsx`, `ResultCard.tsx`, `client/src/lib/saveCard.ts`, `client/src/lib/leadStorage.ts` (if fully replaced)
- Delete: `shared/quiz.ts`, `shared/quiz.test.ts` (ensure no imports remain)
- Modify: `README.md` — describe badge detective flow, submit 2+1, admin badges
- Modify: `docs/superpowers/specs/2026-08-10-booth-badge-detective-design.md` — Status: Approved
- Grep for `@booth/shared` quiz symbols and `html-to-image` — remove dependency from `client/package.json` if unused

- [ ] **Step 1: Grep and delete dead code**

Run: `rg "QUESTIONS|resolveResultKey|ResultCard|useQuizState|leadStorage|html-to-image" -g '!docs/**'`

Expected: only hits you are about to delete / already gone

- [ ] **Step 2: Full test + build**

```bash
npm run build -w shared && npm test -w shared && npm test -w server && npm run build -w client
```

Expected: all PASS / build OK

- [ ] **Step 3: Update README**

Document: QR → lead → Problems/Badges → min 2 service + 1 product → Submit → Siap stamp; Docker compose unchanged.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove quiz flow and document badge detective booth"
```

---

## Spec coverage check

| Spec item | Task |
| --- | --- |
| Detective Problems \| Badges | 4–6 |
| Pain-only list; kind hidden | 1, 4–5 |
| Scroll gate + solve + reveal | 5 |
| Lead before explore | 4 |
| localStorage progress | 3 |
| Submit 2+1 all badges | 2, 6 |
| Siap stamp / staff glance | 6 |
| Admin + CSV badges | 2, 7 |
| Drop quiz / PNG | 8 |
| Full catalog cases | 1 |
| Docker unchanged | — (no task; verify still builds) |

## Placeholder scan

No TBD steps; case **copy** may be placeholder length but structure required in Task 1.

## Type consistency

- `Badge = { caseId, kind, revealName }` shared across client, server, admin.
- Submission API body uses `badges`, not `answers` / `resultKey`.

---
