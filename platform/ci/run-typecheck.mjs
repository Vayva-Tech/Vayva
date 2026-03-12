#!/usr/bin/env node

import { spawnSync } from "node:child_process";

const result = spawnSync(
  "pnpm",
  ["turbo", "run", "typecheck", "--continue", "--output-logs=errors-only"],
  {
    stdio: "inherit",
    shell: true,
    env: process.env,
  },
);

if (typeof result.status === "number") {
  process.exit(result.status);
}

process.exit(1);
