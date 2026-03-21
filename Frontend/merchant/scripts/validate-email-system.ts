import fs from "fs";
import path from "path";

// Load Configs
import { Templates } from "../src/lib/email/templates/core";
import registry from "../src/lib/email/registry.json";
import {
  getRouteForTemplate,
  getFullRoutingTable,
} from "../src/lib/email/sender-routing";

console.log("✅ VALIDATING EMAIL SYSTEM CONFIGURATION...\n");

let hasErrors = false;

// 1. Verify Templates vs Registry
const implementedKeys = Object.keys(Templates) as Array<keyof typeof Templates>;
const registryKeys = registry.templates.map((t) => t.key) as Array<
  keyof typeof Templates
>;

console.log("--- 1. Registry vs Implementation ---");
registryKeys.forEach((key) => {
  if (!implementedKeys.includes(key)) {
    console.error(`❌ Missing Implementation for Key: ${key}`);
    hasErrors = true;
  } else {
    // Double check it returns a string
    const tmpl = Templates[key];
    if (typeof tmpl !== "function") {
      console.error(`❌ Template ${key} is not a function`);
      hasErrors = true;
    }
  }
});
console.log(`Checked ${registryKeys.length} templates.\n`);

// 2. Mock Render & Size Check
console.log("--- 2. Render & Size Check (Mock Data) ---");
const MOCK_DATA = {
  otp: "123456",
  first_name: "TestUser",
  store_name: "TestStore",
  dashboard_url: "https://merchant.vayva.ng/dashboard",
  reset_link: "https://merchant.vayva.ng/reset-password?token=test",
  amount: "5000",
  currency: "NGN",
  invoice_number: "INV-001",
  date: "2025-01-01",
  inviter_name: "Boss",
  role: "Admin",
  invite_url: "https://join",
  order_id: "ORD-123",
  items: "Item A, Item B",
  total: "10000",
  customer_name: "Customer",
  carrier: "DHL",
  tracking_number: "1234567890",
  plan_name: "Pro",
  renewal_date: "2025-02-01",
  end_date: "2025-02-01",
  verify_link: "https://verify",
  unlock_link: "https://unlock",
  device: "iPhone",
  location: "Lagos",
  ip: "127.0.0.1",
};

implementedKeys.forEach((key) => {
  const tmpl = (Templates as Record<string, (data: any) => string>)[key];
  try {
    const html = tmpl(MOCK_DATA);
    const sizeKB = Buffer.byteLength(html, "utf8") / 1024;

    if (sizeKB > 150) {
      console.error(
        `❌ Template ${key} EXCEEDS 150KB limit (${sizeKB.toFixed(2)}KB)`,
      );
      hasErrors = true;
    } else {
      console.log(`✅ ${key}: ${sizeKB.toFixed(2)}KB`);
    }

    if (html.includes("{{") && html.includes("}}")) {
      console.warn(
        `⚠️ Template ${key} might have unreplaced tokens ({{}} detected)`,
      );
    }
  } catch (e: any) {
    console.error(`❌ Failed to render ${key}: ${e.message}`);
    hasErrors = true;
  }
});
console.log("\n");

// 3. Routing Table Verification
console.log("--- 3. Sender Routing Verification ---");
const routingTable = getFullRoutingTable();

// Ensure all registry keys are covered (getRouteForTemplate defaults to SECURITY if missing)
// But we want to ensure explicit coverage if possible, or at least that it resolves valid senders.
registryKeys.forEach((key) => {
  const route = getRouteForTemplate(key as any);
  if (!route.sender || !route.sender.email.includes("@vayva.ng")) {
    console.error(
      `❌ Invalid sender for ${key}: ${JSON.stringify(route.sender)}`,
    );
    hasErrors = true;
  }

  // Check Reply-To Rules
  if (
    route.sender.email === "no-reply@vayva.ng" &&
    route.replyTo !== "support@vayva.ng"
  ) {
    console.error(
      `❌ Rule Violation: no-reply must reply-to support. Got: ${route.replyTo}`,
    );
    hasErrors = true;
  }
});
console.log("✅ Routing Logic Verified.\n");

if (hasErrors) {
  console.error("FAILED: Validation found critical errors.");
  process.exit(1);
} else {
  console.log("SUCCESS: Email System Configuration is Valid.");
  process.exit(0);
}
