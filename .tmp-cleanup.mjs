/**
 * One-shot cleanup script: removes dead UI components from Backend/core-api.
 * Run once, then delete this file.
 */
import { rmSync, unlinkSync, existsSync } from "fs";
import { join } from "path";

const BASE = "/Users/fredrick/Documents/Vayva-Tech/vayva/Backend/core-api/src";
const COMP = join(BASE, "components");

// ── Entire directories to wipe ───────────────────────────────────────────────
const DEAD_DIRS = [
  "account", "activation", "ai", "ai-agent", "analytics", "automations",
  "billing", "bookings", "bundles", "control-center", "customers",
  "dashboard", "dashboard-v2", "designer", "growth", "kitchen", "kyc",
  "market", "marketing", "marketplace", "notifications", "onboarding",
  "ops", "orders", "policies", "preview", "products", "properties",
  "resources", "security", "settings", "shared", "support", "templates",
  "transactions", "ui", "wallet", "whatsapp", "wix-style",
];

// ── Root-level single files in src/components/ ───────────────────────────────
const DEAD_ROOT_FILES = [
  "admin-shell.tsx", "auth-shell.tsx", "BulkActions.tsx", "ConfirmDialog.tsx",
  "DashboardPageHeader.tsx", "ErrorBoundary.tsx", "LoadingSkeletons.tsx",
  "LoadingStates.tsx", "Logo.tsx", "VayvaLogo.tsx", "Pagination.tsx",
  "SearchInput.tsx", "Spinner.tsx", "notifications-drawer.tsx",
  "product-form.tsx", "trend-chart.tsx",
];

// ── Files inside partially-kept directories ──────────────────────────────────
// auth/ — keep InactivityListener.tsx, delete the other 4
const DEAD_AUTH = [
  "auth/AuthLeftPanel.tsx", "auth/AuthRightPanel.tsx",
  "auth/PermissionGate.tsx", "auth/SplitAuthLayout.tsx",
];
// layout/ — keep IncidentBanner.tsx, delete the other 9
const DEAD_LAYOUT = [
  "layout/Breadcrumbs.tsx", "layout/DashboardPageShell.tsx",
  "layout/GlobalFooter.tsx", "layout/IndustryGuard.tsx",
  "layout/PageEmpty.tsx", "layout/PageError.tsx",
  "layout/PageShell.tsx", "layout/PageSkeleton.tsx", "layout/SkipNav.tsx",
];

let deleted = 0;
let skipped = 0;

function del(p) {
  if (!existsSync(p)) { skipped++; return; }
  try { unlinkSync(p); deleted++; } catch (e) { console.error("FAIL", p, e.message); }
}

function delDir(p) {
  if (!existsSync(p)) { skipped++; return; }
  try { rmSync(p, { recursive: true, force: true }); console.log("dir  ", p.replace(BASE, "")); }
  catch (e) { console.error("FAIL", p, e.message); }
}

for (const d of DEAD_DIRS) delDir(join(COMP, d));
for (const f of DEAD_ROOT_FILES) del(join(COMP, f));
for (const f of [...DEAD_AUTH, ...DEAD_LAYOUT]) del(join(COMP, f));

console.log(`\nDone — deleted ${deleted} files, ${skipped} not found.`);
