import fs from "fs";
import path from "path";

const FORBIDDEN = [
  "25k",
  "40k",
  "25,000",
  "40,000",
  "₦25,000",
  "₦40,000",
  // "25000", "40000" // These might be too common (e.g. timeouts), use with caution or regex
];

const EXCLUDED_FILES = [
  "pricing.ts", // The config itself
  "check-pricing.ts", // This script
  "pricing.spec.ts", // The test
  "package.json",
  "pnpm-lock.yaml",
];

const ROOT_DIRS = ["apps/marketing/src", "apps/merchant-admin/src"];

function scanDir(dir: string) {
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      scanDir(fullPath);
    } else {
      if (EXCLUDED_FILES.includes(file)) continue;
      // Skip binary or largely irrelevant
      if (!file.match(/\.(ts|tsx|js|jsx)$/)) continue;

      const content = fs.readFileSync(fullPath, "utf-8");

      for (const bad of FORBIDDEN) {
        if (content.includes(bad)) {
          console.error(
            `ERROR: Found forbidden hardcoded price string "${bad}" in ${fullPath}`,
          );
          process.exitCode = 1;
        }
      }
    }
  }
}

console.log("Scanning for hardcoded pricing strings...");
ROOT_DIRS.forEach((d) => scanDir(path.join(process.cwd(), d)));
console.log("Scan complete.");
