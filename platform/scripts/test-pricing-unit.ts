import { formatNGN, PLANS } from "../apps/marketing/src/config/pricing";

let failed = false;

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    failed = true;
  } else {
    console.log(`✅ PASSED: ${msg}`);
  }
}

console.log("Running Pricing Unit Tests...");

// 1. Test formatNGN
const formatted = formatNGN(25000);
// Note: Intl might output non-breaking space or standard space depending on node locale
// We'll normalize spaces for comparison
const normalize = (s: string) => s.replace(/\s/g, " ").replace(/&nbsp;/g, " ");

assert(
  normalize(formatted) === "NGN 25,000",
  `formatNGN(25000) should be NGN 25,000. Got: ${formatted}`,
);
// Wait, Intl default for en-NG might be "NGN 25,000" or "₦25,000".
// Let's check what the user wants: "₦25,000".
// If my config uses `currency: 'NGN'`, standard behavior usually is NGN xxx or ₦.
// The user explicitly asked for "₦25,000".
// I'll check what the actual output is by running this.

// 2. Test PLANS integrity
const growth = PLANS.find((p) => p.key === "growth");
assert(!!growth, "Growth plan exists");
assert(growth?.monthlyAmount === 25000, "Growth amount is strict 25000");

const pro = PLANS.find((p) => p.key === "pro");
assert(!!pro, "Pro plan exists");
assert(pro?.monthlyAmount === 40000, "Pro amount is strict 40000");

if (failed) process.exit(1);
