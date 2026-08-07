import { serve } from "@hono/node-server";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createApp } from "./app.js";
import { initDb } from "./db.js";
import { readEnv } from "./env.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, "../../data");
const dbPath = path.join(dataDir, "booth.sqlite");
const clientDist = path.resolve(__dirname, "../../client/dist");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const { adminPassword, sessionSecret, port } = readEnv(process.env);

const db = initDb(dbPath);
const app = createApp({
  db,
  adminPassword,
  sessionSecret,
  staticDir: fs.existsSync(clientDist) ? clientDist : undefined,
});

const server = serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Server listening on http://localhost:${info.port}`);
});

server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `Port ${port} is already in use. Stop the other process (or set PORT) and retry.`,
    );
  } else {
    console.error(err);
  }
  process.exit(1);
});
