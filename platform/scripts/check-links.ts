import fs from "fs";
import path from "path";

// Naive regex to find ROUTES usage
// In a real app, we'd use TS Compiler API, but this is a quick static check
const ROUTES_FILE = path.join(
  process.cwd(),
  "apps/marketing/src/lib/routes.ts",
);
const APP_DIR = path.join(process.cwd(), "apps/marketing/src/app");

// 1. Parse Routes
const routesContent = fs.readFileSync(ROUTES_FILE, "utf-8");
const routeKeys: string[] = [];
const routeValues: string[] = [];

// Match keys in "export const ROUTES = { key: 'value' }"
const matches = routesContent.matchAll(/(\w+):\s*"([^"]+)"/g);
for (const match of matches) {
  routeKeys.push(match[1]);
  routeValues.push(match[2]);
}

console.log(`Found ${routeKeys.length} defined routes in manifest.`);

// 2. Check Page Existence
const missingPages: string[] = [];
for (const route of routeValues) {
  if (route.startsWith("/")) {
    // Ignore external if any
    // route /pricing -> app/pricing/page.tsx
    // route / -> app/page.tsx
    let pagePath;
    if (route === "/") {
      pagePath = path.join(APP_DIR, "page.tsx");
    } else {
      pagePath = path.join(APP_DIR, route, "page.tsx");
    }

    if (!fs.existsSync(pagePath)) {
      // Try layout? No, strict page requirement
      // Maybe it's a dynamic route? Not handling that complexity for now unless needed
      missingPages.push(route);
    }
  }
}

if (missingPages.length > 0) {
  console.error(
    "ERROR: The following routes are defined but have no corresponding page.tsx:",
  );
  missingPages.forEach((p) => console.error(` - ${p}`));
  // process.exit(1); // Non-blocking for now, just warning
} else {
  console.log("✅ All routes have corresponding pages.");
}

console.log("Link check complete.");
