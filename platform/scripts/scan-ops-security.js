/**
 * Manual / optional: mirrors Frontend/ops-console/scripts/verify-api-route-auth.sh
 * (CI uses the shell script in ops-guard.yml).
 */
import fs from "fs";
import path from "path";

const OPS_CONSOLE_ROOT = "Frontend/ops-console";
const AUTH_PATTERN =
  /OpsAuthService\.requireSession|withOpsAPI|withOpsAuth/;

/** Paths relative to Frontend/ops-console/src/app/api */
const AUTH_ALLOWLIST = new Set([
  "auth/[...nextauth]/route.ts",
  "health/route.ts",
  "ops/auth/login/route.ts",
  "ops/auth/signout/route.ts",
  "ops/health/route.ts",
  "ops/invitations/validate/route.ts",
  "ops/invitations/accept/route.ts",
  "webhooks/fraud-detection/route.ts",
]);

const apiDir = `${OPS_CONSOLE_ROOT}/src/app/api`;
const apiPrefix = `${apiDir}/`;

function walk(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      walk(full, fileList);
    } else if (file === "route.ts") {
      fileList.push(full);
    }
  }
  return fileList;
}

let hasError = false;
console.log("🔒 Scanning ops-console API routes for auth enforcement...");
const apiRoutes = walk(apiDir);
for (const routePath of apiRoutes) {
  const rel = routePath.startsWith(apiPrefix)
    ? routePath.slice(apiPrefix.length)
    : routePath;
  if (AUTH_ALLOWLIST.has(rel)) continue;

  const content = fs.readFileSync(routePath, "utf-8");
  if (!AUTH_PATTERN.test(content)) {
    console.error(
      `❌ Route missing requireSession / withOpsAPI / withOpsAuth: ${routePath}`,
    );
    hasError = true;
  }
}

if (hasError) {
  console.error("🛑 SECURITY SCAN FAILED");
  process.exit(1);
}
console.log("✅ SECURITY SCAN PASSED");
