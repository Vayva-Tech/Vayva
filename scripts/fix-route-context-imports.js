#!/usr/bin/env node

import { execSync } from "node:child_process";
import fs from "node:fs";

const files = execSync(
  "rg \"RouteContext\" apps services packages -g\"*.ts\" -g\"*.tsx\"\"",
  { encoding: "utf8" }
)
  .split("\n")
  .filter(Boolean);

for (const file of files) {
  const content = fs.readFileSync(file, "utf8");

  if (
    content.includes("RouteContext") &&
    content.includes("@vayva/shared")
  ) {
    const updated = content.replace(
      /from\s+["']@vayva\/shared["']/g,
      'from "@vayva/next-types"'
    );

    if (updated !== content) {
      fs.writeFileSync(file, updated);
      console.log(`✔ updated RouteContext import in ${file}`);
    }
  }
}

console.log("Done fixing RouteContext imports.");
