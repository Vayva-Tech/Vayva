import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

function readAllowlist() {
  const allowlistPath = path.join(process.cwd(), ".ci", "typecheck-allowlist.txt");
  const raw = fs.readFileSync(allowlistPath, "utf8");
  return new Set(
    raw
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith("#")),
  );
}

function getWorkspaces() {
  const out = execFileSync("pnpm", ["-r", "--depth", "-1", "list", "--json"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  });
  const list = JSON.parse(out);
  const repoRoot = path.resolve(process.cwd());
  // Exclude repo root (avoid recursive execution if pnpm reports root as a workspace)
  return list.filter(
    (p) =>
      p.path &&
      p.path.length > 0 &&
      path.resolve(p.path) !== repoRoot &&
      p.name !== "vayva",
  );
}

function runTypecheck(ws) {
  try {
    execFileSync("pnpm", ["-C", ws.path, "run", "--if-present", "typecheck"], {
      stdio: "inherit",
      env: process.env,
    });
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

const allowlist = readAllowlist();
const workspaces = getWorkspaces();

const failing = [];
const unexpected = [];

// Deterministic ordering
workspaces.sort((a, b) => a.name.localeCompare(b.name));

for (const ws of workspaces) {
  process.stdout.write(`\n=== typecheck: ${ws.name} (${ws.path}) ===\n`);
  const res = runTypecheck(ws);
  if (!res.ok) {
    failing.push(ws.name);
    if (!allowlist.has(ws.name)) unexpected.push(ws.name);
  }
}

process.stdout.write("\n=== Typecheck summary ===\n");
process.stdout.write(`Failing: ${failing.length}\n`);
if (failing.length) process.stdout.write(`Failing workspaces: ${failing.join(", ")}\n`);

if (unexpected.length) {
  process.stdout.write(`Unexpected failures (not allowlisted): ${unexpected.join(", ")}\n`);
  process.exit(1);
}

process.exit(0);
