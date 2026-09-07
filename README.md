# Booth Badge Detective — Hyperjump

Interactive booth experience monorepo (`client`, `server`, `shared`). Visitors play detective: pick problems, read stories, solve cases, and earn badges that reveal Hyperjump services and products.

## Booth flow

1. **QR / welcome** — visitor lands on the booth SPA, sees the 3-step brief
2. **Lead capture** — name + email, framed as issuing a detective ID card
3. **Berkas Kasus | Badge** — two tabs: case files filterable by Service / Product, or the badge grid
4. **Solve cases** — each case opens with a one-line hook, then 3 pieces of evidence revealed one tap at a time; once all are open, “Pecahkan kasus ini!” runs a short analysis beat and lands the badge with a stamp slam, confetti, and haptic buzz
5. **Submit** — enabled when visitor has ≥ **2 service** + ≥ **1 product** badge; sends all earned badges to the server
6. **Siap stamp** — after submit, Badge tab shows stamp-ready state for staff to verify and give a physical doorprize stamp

A progress HUD above the case list tracks detective rank (Rekrut Baru through Legenda Booth), badges closed out of 16, and the Service / Product requirement meters. Unearned badges stay visible as locked slots so visitors can see what they are missing.

Progress is stored in `localStorage` until submit. Admin at `/admin` lists submissions and exports CSV with badge details.

## Setup

```bash
cp .env.example .env
npm install   # or: bun install
```

## Development

```bash
npm run dev    # or: bun run dev
```

`dev` selalu menjalankan API dengan **Node** (bukan runtime Bun) karena `better-sqlite3`, dan `--watch` hanya memantau `server/src` supaya file SQLite/cache tidak bikin restart loop. Vite tetap di proses terpisah.

Atau terpisah:

```bash
npm run dev:server   # / bun run dev:server
npm run dev:client
```

- API health: http://localhost:3000/api/health
- Client: http://localhost:5173

## Production (VPS)

Requires **Node.js 22+**.

```bash
cp .env.example .env   # set ADMIN_PASSWORD, SESSION_SECRET, PORT
npm ci
npm run build
npm start
```

`npm start` loads `.env` from the repo root if present, then runs the Hono API and serves the built React SPA from `client/dist` on **one port**. Client routes (`/`, `/admin`) fall back to `index.html`; `/api/*` is unchanged.

`ADMIN_PASSWORD` and `SESSION_SECRET` are required — the server exits on startup if either is missing or empty.

### Docker (satu port)

Build & run — API + SPA di port `3000`:

```bash
docker build -t booth-badge-detective .
docker run --rm -p 3000:3000 \
  -e ADMIN_PASSWORD='change-me' \
  -e SESSION_SECRET='change-me-to-a-long-random-string' \
  -v booth-data:/app/data \
  booth-badge-detective
```

Buka http://localhost:3000 (booth) dan http://localhost:3000/admin.

Atau pakai Compose (butuh `.env` dengan `ADMIN_PASSWORD` + `SESSION_SECRET`):

```bash
cp .env.example .env   # ganti password & secret
docker compose up --build -d
```

SQLite tersimpan di volume `booth-data`. Cek status: `docker compose ps` / logs: `docker compose logs -f`.

### Environment

| Variable | Description |
|----------|-------------|
| `ADMIN_PASSWORD` | Password for `/admin` login |
| `SESSION_SECRET` | HMAC secret for admin session cookie |
| `PORT` | Listen port (default `3000`) |
| `SECURE_COOKIES` | Set to `1` to send admin cookie with `Secure` flag (also enabled when `NODE_ENV=production`) |

Ensure the `data/` directory is writable — SQLite stores submissions at `data/booth.sqlite`.

### Process manager (systemd example)

```ini
[Unit]
Description=Booth Badge Detective
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/smdd-booth-2026
EnvironmentFile=/opt/smdd-booth-2026/.env
ExecStart=/usr/bin/npm start
Restart=on-failure
User=www-data

[Install]
WantedBy=multi-user.target
```

Or with PM2:

```bash
pm2 start npm --name booth-badge-detective -- start
pm2 save
```

### HTTPS (optional)

Put nginx or Caddy in front and proxy to `http://127.0.0.1:3000`. Terminate TLS at the reverse proxy.
