# Booth Quiz Hyperjump — Design Spec

**Date:** 2026-08-07  
**Project:** smdd-booth-2026  
**Status:** Approved for planning (pending final user review of this doc)

## Goal

Interactive quiz for a Hyperjump booth. Visitors scan a QR code, complete the quiz on their own phones, and get a recommended Hyperjump service. Staff export leads from `/admin` on the shared VPS.

## Constraints & decisions

| Topic | Decision |
| --- | --- |
| Client | Vite + React + TypeScript + Tailwind + React Router |
| Server | Small Node API (Hono preferred) + better-sqlite3 |
| Hosting | User’s own VPS (single Node process: API + static SPA) |
| Lead storage | SQLite on VPS (not IndexedDB — visitors use personal phones) |
| Admin auth | Local password via `ADMIN_PASSWORD` env, checked on server |
| Questions | 7 fixed questions, options A–E map to 5 services |
| Ties | On-demand tiebreaker question (only tied leaders shown) |
| Restart | Manual “Mulai Lagi” button on result screen |
| Save result | Export result as PNG card via html-to-image (save/share to phone gallery) |
| Brand | Hyperjump logo (black / white / cyan / yellow accents) |
| UX | Mobile-first; comfortable on phones and tablets |

## Architecture

```
┌─────────────────┐     HTTPS      ┌──────────────────────────────┐
│ Visitor phone   │ ──────────────►│ VPS                          │
│ (QR → SPA)      │                │  Node: Hono API + static SPA │
└─────────────────┘                │  SQLite: data/booth.sqlite   │
┌─────────────────┐                └──────────────────────────────┘
│ Staff /admin    │ ──────────────────────────▲
└─────────────────┘
```

### Repo layout

```
/
  client/                 # Vite React SPA
    public/hyperjump-logo.png
  server/                 # Hono + SQLite
  data/                   # SQLite file (gitignored)
  docs/
```

Use the simplest folder layout that builds the client and runs the server together (npm workspaces optional, not required).

### Client routes

- `/` — quiz flow
- `/admin` — password gate → submissions list + CSV export

### API

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/submissions` | none | Create submission after quiz completes |
| `POST` | `/api/admin/login` | password body | Establish admin session (httpOnly cookie or signed token) |
| `GET` | `/api/admin/submissions` | admin | List all submissions (newest first) |
| `GET` | `/api/admin/export` | admin | Download CSV |

Admin password is never embedded in the client bundle as the sole check; the server validates every admin request.

### SQLite schema

```sql
CREATE TABLE submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  answers TEXT NOT NULL, -- JSON array of { questionId, choice } incl. tiebreaker if any
  result_key TEXT NOT NULL, -- A|B|C|D|E
  result_label TEXT NOT NULL, -- e.g. "Inference AI"
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

## Quiz flow

1. **Welcome** — Hyperjump logo + short booth CTA + start
2. **Lead form** — name + email (required, basic email validation)
3. **Questions 1–7** — one question per screen; large tap targets; progress `n/7`
4. **Tiebreaker (conditional)** — if two or more letters share the highest count, show: “Mana yang paling urgensi buat kamu selesaikan sekarang?” with only the tied options
5. **Result** — winning service, tagline, diagnosis, solution copy; optional link to hyperjump.tech service page; **Simpan Kartu** (PNG); **Mulai Lagi** resets to welcome with empty state
6. **Persist** — `POST /api/submissions` when entering the result step (full payload). On failure: show error + retry; keep answers in client state

### Scoring

- Each of Q1–Q7 adds +1 to the selected letter A–E
- Winner = letter with max count
- If tie for max → tiebreaker required; tiebreaker choice becomes `result_key`
- No dual-result screen

## Question bank (source of truth)

Options A–E always map to the same five services.

### Q1 — Apa "sakit kepala" terbesar di operasional bisnis kamu saat ini?

- **A.** Tim kecapekan ngerjain tugas rutin/manual yang itu-itu aja tiap hari.
- **B.** Data operasional dan laporan antar divisi (Finance, Sales, Stock) masih berantakan.
- **C.** Pusing nyari, ngatur, dan menahan engineer IT supaya gak sering keluar-masuk.
- **D.** Butuh software khusus buat bisnis, tapi gak ada produk jadi (off-the-shelf) yang pas.
- **E.** Ragu apakah fondasi sistem IT sekarang aman dan siap buat scale up atau fundraising.

### Q2 — Kalau dikasih "tongkat ajaib" buat selesain 1 masalah esok hari, kamu mau apa?

- **A.** Bikin asisten pintar yang bisa otomatisasi tugas berulang 24/7.
- **B.** Punya satu dashboard rapi yang bisa memantau seluruh proses bisnis dari ujung ke ujung.
- **C.** Punya petinggi IT berpengalaman yang langsung siap eksekusi tech roadmap tanpa ribet rekrutmen.
- **D.** Bikin aplikasi kustom yang fiturnya 100% nurut sama alur kerja unik perusahaan.
- **E.** Dapet audit komprehensif tentang kesehatan dan keamanan sistem IT saat ini.

### Q3 — Kalimat apa yang paling sering kamu dengar dari tim kamu?

- **A.** "Duh, kerjaan kita cuma copas data dan balesin pesan yang sama terus nih!"
- **B.** "Kok data stok di gudang beda ya sama catatan tim finance?"
- **C.** "Kita bingung mau bikin arsitektur sistemnya kayak gimana, gak ada yang ngarahin."
- **D.** "Tools yang kita pakai sekarang kaku banget, gak fleksibel buat nambah fitur baru."
- **E.** "Sistem kita sering lemot kalau user naik, tapi gak tahu bocornya di mana."

### Q4 — Sektor mana di bisnis kamu yang rasanya paling banyak pemborosan waktu/biaya?

- **A.** Pekerjaan administratif harian yang harusnya bisa dikerjakan mesin.
- **B.** Proses sinkronisasi data manual yang makan waktu antar departemen.
- **C.** Gaji tim IT mahal tapi eksekusinya sering lambat dan kurang terarah.
- **D.** Langganan berbagai software bulanan yang cuma terpakai separuh fiturnya.
- **E.** Perbaikan bug atau masalah sistem yang terus timbul tanpa tahu akar masalahnya.

### Q5 — Apa ketakutan terbesar kamu saat bisnis mulai membesar (scaling)?

- **A.** Operasional makin lambat karena tim kewalahan nanganin volume tugas harian.
- **B.** Kontrol operasional lepas karena data makin kompleks dan tercecer di mana-mana.
- **C.** Produk IT gagal rilis tepat waktu karena tim engineering kurang berpengalaman.
- **D.** Aplikasi yang dipakai saat ini gak mampu menampung lonjakan pengguna/kebutuhan baru.
- **E.** Sistem IT mendadak crash atau ketahuan punya celah keamanan di depan investor/klien besar.

### Q6 — Kalau ada proyek digital baru, kendala apa yang paling sering bikin tersendat?

- **A.** Makan waktu lama buat melatih staf cuma untuk ngerjain proses-proses dasar.
- **B.** Sulit mengintegrasikan sistem baru dengan sistem lama yang udah berjalan.
- **C.** Tidak ada sosok leader teknis yang bisa mengarahkan para developer.
- **D.** Mengembangkan aplikasinya dari nol makan waktu terlalu lama kalau pakai resource internal.
- **E.** Khawatir hasilnya tidak memenuhi standar keamanan dan kualitas teknis yang baik.

### Q7 — Apa fokus/target utama bisnis kamu dalam 6 bulan ke depan?

- **A.** Efisiensi biaya dan waktu kerja lewat otomatisasi cerdas.
- **B.** Merapikan alur kerja antar divisi supaya operasional lebih ramping.
- **C.** Membangun produk digital tanpa perlu pusing urusan manajemen tim IT.
- **D.** Meluncurkan platform digital kustom yang stabil dan siap tumbuh.
- **E.** Meyakinkan investor atau stakeholder bahwa fondasi teknologi perusahaan solid dan siap ekspansi.

### Tiebreaker

**Prompt:** Mana yang paling urgensi buat kamu selesaikan sekarang?  
**Options:** only the letters currently tied for the lead. Each option shows the letter plus the service name (e.g. “A — Inference AI”).

## Result content

| Key | Service | URL | Tagline |
| --- | --- | --- | --- |
| A | Inference AI | https://hyperjump.tech/en/services/inference-ai | Saatnya Bebaskan Tim Kamu dari Tugas Manual! |
| B | ERP Implementation | https://hyperjump.tech/en/services/erp-implementation | Saatnya Rapikan & Integrasikan Seluruh Operasional! |
| C | CTO-as-a-Service | https://hyperjump.tech/en/services/cto-as-a-service | Saatnya Punya Kepemimpinan IT Tanpa Pusing Rekrutmen! |
| D | Software as a Service | https://hyperjump.tech/en/services/software-as-a-service | Saatnya Punya Software Kustom yang Pas dengan Bisnis Kamu! |
| E | Tech Due Diligence | https://hyperjump.tech/en/services/tech-due-diligence | Saatnya Pastikan Fondasi Sistem IT Kamu Aman & Ready to Scale! |

### Diagnosis + solution body

**A — Inference AI**  
Diagnosis: Bisnis kamu butuh efisiensi ekstra!  
Solusi: Saatnya lepas tugas manual yang menguras waktu. Kami bantu bangun dan deploy AI agent khusus yang hemat biaya, berjalan otomatis, dan bikin operasional kamu jauh lebih cepat tanpa pusing urusan teknis.

**B — ERP Implementation**  
Diagnosis: Operasional kamu butuh kerapian dan transparansi!  
Solusi: Katakan selamat tinggal pada data berantakan. Kami bantu integrasikan seluruh proses bisnis kamu ke dalam solusi ERP kelas enterprise agar laporan akurat dan keputusan bisnis bisa diambil lebih cepat.

**C — CTO-as-a-Service**  
Diagnosis: Kamu butuh kepemimpinan teknologi yang solid!  
Solusi: Gak perlu pusing rekrut dan kelola tim engineering dari nol. Kami sediakan kepemimpinan IT berpengalaman beserta manajemen tim software yang siap mengeksekusi ide bisnis kamu.

**D — Software as a Service**  
Diagnosis: Kamu butuh software yang benar-benar pas dengan bisnis kamu!  
Solusi: Jangan paksa bisnis kamu ikutan alur software kaku. Kami bangun dan kembangkan solusi software kustom yang siap di-deploy serta di-scale sesuai kebutuhan perusahaan.

**E — Tech Due Diligence**  
Diagnosis: Kamu butuh kepastian dan keamanan fondasi teknis!  
Solusi: Sebelum melangkah lebih jauh untuk ekspansi atau pendanaan, mari kita audit dan evaluasi performa, arsitektur, serta kemampuan eksekusi sistem IT kamu secara mendalam.

Result UI order: service name → tagline → diagnosis → solution → CTA link (optional) → **Simpan Kartu** → Mulai Lagi.

### Result card PNG export

Visitors save a shareable **result card** image to their phone (gallery / Files / share sheet).

**Library:** `html-to-image` (`toPng`) — capture a dedicated card DOM node (not the whole screen chrome).

**Card content (fixed composition for capture):**
- Hyperjump logo
- Visitor first name (personalization)
- Service name + tagline
- Short diagnosis line
- Footer with **hyperjump.tech** (required, clearly readable on the PNG) plus optional booth/event line (e.g. SMDD 2026) — keep text minimal so the card stays readable as an image

**Capture target:** a ref’d card element styled at a stable export size (e.g. ~1080×1350 or 9:16-friendly), dark Hyperjump look. On-screen result may show the same card scaled down; export uses the card node at full pixel density (`pixelRatio: 2`).

**Save / share behavior:**
1. **Desktop & Android:** download PNG file (`hyperjump-quiz-{result_key}.png`)
2. **iOS (iPhone/iPad):** Web Share API with PNG `File` so the user can “Save Image” / share to apps
3. On failure: short Indonesian error + retry

**Out of card capture:** nav chrome, retry/submit status, Mulai Lagi button (actions stay outside the captured node).

## Visual / UX

- Dark Hyperjump aesthetic: black background, white text, cyan primary accent, yellow highlight (aligned with logo)
- Logo on welcome and result
- One composition per step; large option buttons; no dense card grids in the hero/welcome
- Light step transitions (fade/slide)
- Progress indicator on question steps
- Indonesian copy throughout the visitor flow
- Admin UI intentionally plain and functional
- Result card designed to look good both on-screen and as a saved PNG

## Admin

- Password form; wrong password → generic error (no hints)
- After login: table of submissions (name, email, result, timestamp)
- Export CSV columns: `id,name,email,result_key,result_label,answers,created_at`
- Empty state: message that there is no data yet; export may be header-only or disabled with explanation
- No sophisticated analytics dashboard

## Error handling

- Client validation before advancing from lead form
- Network/API failure on submit: keep local quiz state; show retry on result
- Disable duplicate submit after success for that session
- “Mulai Lagi” clears in-memory quiz state only (does not delete server rows)
- PNG export failure: keep result visible; show error + allow retry; do not clear quiz state

## Out of scope

- Multi-tablet sync beyond shared VPS SQLite
- Email notifications / CRM integrations
- Multi-language
- Sophisticated admin auth (OAuth, roles)
- Offline-first PWA requirements
- Auto-reset countdown on result

## Success criteria

- Visitor can finish quiz on phone in a few minutes without staff help
- Result matches dominant A–E (or tiebreaker)
- Visitor can save/share a PNG result card to their device
- Submission appears in SQLite and in `/admin` export
- Works well on common mobile viewports; readable on tablet
- Deployable as one Node service on the user’s VPS

## Implementation notes (non-blocking)

- Prefer Hono + `@hono/node-server` + `better-sqlite3`
- Client: `html-to-image` for PNG capture; Web Share API first, download fallback
- Serve `client/dist` from the same server in production
- CORS only needed if client and API diverge in local dev
- Gitignore `data/*.sqlite` and `.env`
- Env: `ADMIN_PASSWORD`, `PORT`, optional `SESSION_SECRET`
- Test PNG save on iOS Safari and Android Chrome before booth day
