import { execFileSync, spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envFile = path.join(root, ".env");
const children = [];

/**
 * better-sqlite3 requires real Node. When this script is started via
 * `bun run`, process.execPath is Bun — resolve system `node` instead.
 */
function resolveNode() {
  const isBun =
    Boolean(process.versions.bun) ||
    /[/\\]bun(?:\.exe)?$/i.test(process.execPath);
  if (!isBun) return process.execPath;
  try {
    return execFileSync("which", ["node"], { encoding: "utf8" }).trim();
  } catch {
    throw new Error(
      "Node.js 22+ is required for the API (better-sqlite3). Install Node, then retry.",
    );
  }
}

function run(label, command, args, cwd) {
  const child = spawn(command, args, {
    cwd,
    env: process.env,
    stdio: "inherit",
    shell: false,
  });
  child.on("exit", (code, signal) => {
    for (const other of children) {
      if (other !== child && !other.killed) other.kill("SIGTERM");
    }
    if (signal) process.exit(1);
    process.exit(code ?? 0);
  });
  child.on("error", (err) => {
    console.error(`[${label}] failed to start:`, err.message);
    process.exit(1);
  });
  children.push(child);
}

const node = resolveNode();
const serverArgs = [];
if (fs.existsSync(envFile)) {
  serverArgs.push(`--env-file=${envFile}`);
} else {
  console.warn(`[dev] missing ${envFile} — copy from .env.example`);
}
// Only watch server source — never data/*.sqlite, lockfiles, or Vite cache
serverArgs.push(
  `--watch-path=${path.join(root, "server/src")}`,
  "--import",
  "tsx",
  path.join(root, "server/src/index.ts"),
);

run("server", node, serverArgs, path.join(root, "server"));

const viteJs = path.join(root, "node_modules", "vite", "bin", "vite.js");
if (!fs.existsSync(viteJs)) {
  console.error("[dev] vite not found — run npm install / bun install first");
  process.exit(1);
}
run("client", node, [viteJs], path.join(root, "client"));

function shutdown() {
  for (const child of children) {
    if (!child.killed) child.kill("SIGTERM");
  }
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
