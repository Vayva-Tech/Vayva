import { readFileSync, writeFileSync } from "fs";

const BASE = "/Users/fredrick/Documents/Vayva-Tech/vayva/Frontend/ops-console/src";

const entries = [
  ["app/api/ops/alerts/stream/route.ts", [2]],
  ["app/api/ops/audit/[id]/route.ts", [2]],
  ["app/api/ops/audit/route.ts", [2]],
  ["app/api/ops/auth/login/route.ts", [49]],
  ["app/api/ops/auth/me/route.ts", [2]],
  ["app/api/ops/auth/signout/route.ts", [2]],
  ["app/api/ops/communications/segments/route.ts", [3]],
  ["app/api/ops/compliance/exports/route.ts", [2]],
  ["app/api/ops/config/announcements/route.ts", [2]],
  ["app/api/ops/config/feature-flags/route.ts", [2]],
  ["app/api/ops/config/global/route.ts", [27, 81]],
  ["app/api/ops/dashboard/stats/route.ts", [3]],
  ["app/api/ops/deliveries/[id]/retry/route.ts", [3]],
  ["app/api/ops/developers/api-usage/route.ts", [2]],
  ["app/api/ops/disputes/[id]/approve-refund/route.ts", [3]],
  ["app/api/ops/disputes/[id]/escalate/route.ts", [3]],
  ["app/api/ops/disputes/[id]/evidence/route.ts", [3]],
  ["app/api/ops/disputes/[id]/reject/route.ts", [3]],
  ["app/api/ops/financials/payouts/route.ts", [3]],
  ["app/api/ops/financials/revenue/route.ts", [2]],
  ["app/api/ops/financials/subscriptions/route.ts", [3]],
  ["app/api/ops/growth/campaigns/active/route.ts", [3]],
  ["app/api/ops/growth/campaigns/route.ts", [3]],
  ["app/api/ops/health/detailed/route.ts", [3]],
  ["app/api/ops/health/dlq/[id]/replay/route.ts", [2]],
  ["app/api/ops/health/dlq/route.ts", [2]],
  ["app/api/ops/health/ping/route.ts", [3]],
  ["app/api/ops/impersonate/route.ts", [3]],
  ["app/api/ops/industries/route.ts", [3]],
  ["app/api/ops/invitations/accept/route.ts", [4, 114]],
  ["app/api/ops/invitations/route.ts", [167, 219]],
  ["app/api/ops/jobs/drain-emails/route.ts", [3]],
  ["app/api/ops/kyc/assign/route.ts", [3]],
  ["app/api/ops/kyc/route.ts", [3]],
  ["app/api/ops/logistics/shipments/route.ts", [3]],
  ["app/api/ops/logistics/stats/route.ts", [3]],
  ["app/api/ops/marketing/analytics/route.ts", [9]],
  ["app/api/ops/marketing/conversions/route.ts", [8]],
  ["app/api/ops/marketing/pages/route.ts", [8]],
  ["app/api/ops/marketing/traffic/route.ts", [8]],
  ["app/api/ops/marketplace/apps/route.ts", [3]],
  ["app/api/ops/marketplace/listings/[id]/route.ts", [3]],
  ["app/api/ops/marketplace/listings/route.ts", [3]],
  ["app/api/ops/marketplace/templates/[id]/route.ts", [3]],
  ["app/api/ops/marketplace/templates/route.ts", [3]],
  ["app/api/ops/me/route.ts", [2]],
  ["app/api/ops/merchants/[id]/actions/disable-payouts/route.ts", [2]],
  ["app/api/ops/merchants/[id]/actions/enable-payouts/route.ts", [2]],
  ["app/api/ops/merchants/[id]/actions/force-kyc-review/route.ts", [2]],
  ["app/api/ops/merchants/[id]/actions/issue-warning/route.ts", [2]],
  ["app/api/ops/merchants/[id]/actions/open-appeal-case/route.ts", [2]],
  ["app/api/ops/merchants/[id]/actions/replay-order-webhook/route.ts", [3]],
  ["app/api/ops/merchants/[id]/actions/rotate-secret/route.ts", [3]],
  ["app/api/ops/merchants/[id]/actions/set-restrictions/route.ts", [2]],
  ["app/api/ops/merchants/[id]/actions/suspend-account/route.ts", [2]],
  ["app/api/ops/merchants/[id]/actions/unsuspend-account/route.ts", [2]],
  ["app/api/ops/merchants/[id]/actions/update-appeal-status/route.ts", [2]],
  ["app/api/ops/merchants/[id]/wallet/lock/route.ts", [2]],
  ["app/api/ops/merchants/activity/route.ts", [8]],
  ["app/api/ops/merchants/batch/route.ts", [2]],
  ["app/api/ops/orders/[id]/route.ts", [2]],
  ["app/api/ops/orders/route.ts", [2]],
  ["app/api/ops/payments/paystack-webhooks/[id]/reprocess/route.ts", [2]],
  ["app/api/ops/payments/wallet-funding/[id]/reconcile/route.ts", [2]],
  ["app/api/ops/rescue/incidents/route.ts", [4]],
  ["app/api/ops/rescue/runbooks/route.ts", [2]],
  ["app/api/ops/risk/[id]/resolve/route.ts", [2]],
  ["app/api/ops/risk/scores/route.ts", [2]],
];

let totalFixed = 0;
let filesFixed = 0;

for (const [relFile, lineNums] of entries) {
  const fullPath = BASE + "/" + relFile;
  let content;
  try {
    content = readFileSync(fullPath, "utf8");
  } catch (e) {
    console.error("Cannot read: " + fullPath);
    continue;
  }

  const lines = content.split("\n");
  const sorted = [...lineNums].sort((a, b) => b - a);
  let removed = 0;
  for (const lineNum of sorted) {
    const idx = lineNum - 1;
    if (idx >= 0 && idx < lines.length && lines[idx].includes("@ts-expect-error")) {
      lines.splice(idx, 1);
      removed++;
    } else {
      const actual = lines[idx] || "(out of range)";
      console.warn("  SKIP line " + lineNum + " in " + relFile + ": " + actual);
    }
  }

  if (removed > 0) {
    writeFileSync(fullPath, lines.join("\n"), "utf8");
    filesFixed++;
    totalFixed += removed;
    console.log("Fixed " + removed + " lines: " + relFile);
  }
}

console.log("\nTotal: removed " + totalFixed + " @ts-expect-error lines from " + filesFixed + " files");
