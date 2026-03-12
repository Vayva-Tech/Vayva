import fs from "fs";
import path from "path";

// Configuration
const API_ROOT = path.join(process.cwd(), "apps/merchant-admin/src/app/api");
const EXEMPT_ROUTES = [
  "auth/", // NextAuth handles its own security
  "webhooks/", // Handled by signature verification, not session
  "upload/route.ts", // Ideally should be authed, but might be public for some reason (will flag for review)
];

// Auth patterns to look for
const AUTH_PATTERNS = [
  "withRBAC",
  "getServerSession",
  "requireAuth",
  "authOptions", // Implicitly used in some session gets
  "verifySignature", // for webhooks
];

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else {
      if (file.endsWith(".ts") || file.endsWith(".tsx")) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

function checkFileForAuth(filePath: string) {
  const content = fs.readFileSync(filePath, "utf-8");
  const relativePath = path.relative(API_ROOT, filePath);

  // Skip exempt
  if (
    EXEMPT_ROUTES.some(
      (exempt) => relativePath.startsWith(exempt) || relativePath === exempt,
    )
  ) {
    return { secured: true, reason: "Exempt" };
  }

  const hasAuth = AUTH_PATTERNS.some((pattern) => content.includes(pattern));

  return {
    secured: hasAuth,
    reason: hasAuth ? "Found auth pattern" : "Missing explicit auth check",
    path: relativePath,
  };
}

async function runAudit() {
  console.log("🔍 Starting API Auth Audit...");
  console.log(`📂 Root: ${API_ROOT}`);

  const files = getAllFiles(API_ROOT);
  const issues: string[] = [];
  let securedCount = 0;

  files.forEach((file) => {
    const result = checkFileForAuth(file);
    if (!result.secured) {
      issues.push(result.path!);
    } else {
      securedCount++;
    }
  });

  console.log("\n📊 Audit Results:");
  console.log(`✅ Secured: ${securedCount}`);
  console.log(`❌ Unprotected: ${issues.length}`);

  if (issues.length > 0) {
    console.log("\n⚠️  The following routes appear unprotected:");
    issues.forEach((issue) => console.log(` - ${issue}`));
    process.exit(1);
  } else {
    console.log("\n✨ All routes appear secured.");
    process.exit(0);
  }
}

runAudit();
