import { execSync } from "child_process";
import { writeFileSync } from "fs";

const BASE = "/Users/fredrick/Documents/Vayva-Tech/vayva";

const projects = [
  { name: "merchant-admin", path: "Frontend/merchant-admin/src" },
  { name: "ops-console", path: "Frontend/ops-console/src" },
  { name: "marketing", path: "Frontend/marketing/src" },
  { name: "storefront", path: "Frontend/storefront/src" },
];

const allErrors = {};

for (const proj of projects) {
  let raw;
  try {
    raw = execSync(
      `cd ${BASE} && npx eslint ${proj.path} --ext .ts,.tsx --format json 2>/dev/null`,
      { encoding: "utf8", maxBuffer: 50 * 1024 * 1024 }
    );
  } catch (e) {
    raw = e.stdout || "[]";
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    console.error("Parse failed for " + proj.name);
    continue;
  }

  const errors = [];
  for (const f of data) {
    for (const m of f.messages) {
      if (m.severity === 2) {
        errors.push({
          file: f.filePath.replace(/.*\/src\//, ""),
          line: m.line,
          col: m.column,
          rule: m.ruleId || "unknown",
          msg: m.message,
        });
      }
    }
  }

  allErrors[proj.name] = errors;

  const byRule = {};
  for (const e of errors) {
    byRule[e.rule] = (byRule[e.rule] || 0) + 1;
  }

  console.log("\n=== " + proj.name + " (" + errors.length + " errors) ===");
  const sorted = Object.entries(byRule).sort((a, b) => b[1] - a[1]);
  for (const [rule, count] of sorted) {
    console.log("  " + count + "x  " + rule);
  }

  console.log("\n  Detail:");
  for (const e of errors.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line)) {
    console.log("  " + e.file + ":" + e.line + " [" + e.rule + "] " + e.msg.substring(0, 90));
  }
}

writeFileSync("/tmp/eslint_errors.json", JSON.stringify(allErrors, null, 2));
console.log("\nFull data written to /tmp/eslint_errors.json");
