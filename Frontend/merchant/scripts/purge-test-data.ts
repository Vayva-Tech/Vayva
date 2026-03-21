import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("🚀 Starting data purge for launch...");

  // Exhaustive list of tables for a full database purge before launch.
  // Order of deletion matters due to foreign key constraints, but CASCADE handles most.
  const tablenames = [
    // Transactional & Logs (Snake Case)
    "audit_log",
    "admin_audit_log",
    "audit_event",
    "OpsAuditEvent",
    "ai_usage_event",
    "AiUsageDaily",
    "AnalyticsDailyDelivery",
    "AnalyticsDailyPayments",
    "AnalyticsDailySales",
    "AnalyticsDailySupport",
    "analytics_events",
    "TelemetryEvent",
    "SupportTelemetryEvent",

    // Core Merchant Data (Mixed Case)
    "Order",
    "OrderItem",
    "OrderEvent",
    "OrderTimelineEvent",
    "OrderDiscount",
    "FulfillmentGroup",
    "Shipment",
    "DeliveryEvent",
    "DispatchJob",
    "InvoiceV2",
    "InvoiceLineV2",
    "LedgerEntry",
    "LedgerTransaction",
    "Payout",
    "Refund",
    "Charge",
    "PaymentIntent",
    "PaymentTransaction",

    // Customers & Support (Mixed Case)
    "Customer",
    "CustomerAddress",
    "CustomerNote",
    "CustomerSession",
    "CustomerAccount",
    "Contact",
    "Conversation",
    "Message",
    "ticket_message",
    "support_ticket",
    "SupportCase",
    "HandoffEvent",

    // Inventory & Products (Mixed Case)
    "Product",
    "ProductVariant",
    "ProductImage",
    "InventoryItem",
    "InventoryLocation",
    "InventoryMovement",
    "InventoryEvent",
    "CollectionProduct",
    "Collection",

    // Marketing & Coupons (Mixed Case)
    "Campaign",
    "CampaignSend",
    "Coupon",
    "DiscountRedemption",

    // Authentication & Sessions (Mixed Case)
    "MerchantSession",
    "user_session",
    "OpsSession",
    "PasswordResetToken",
    "OtpCode",
    "Membership",
    "StaffInvite",
    "ApiKey",

    // Onboarding & Store Setup (Mixed Case)
    "MerchantOnboarding",
    "onboarding_analytics_events",
    "KycRecord",
    "BankBeneficiary",
    "MerchantAiSubscription",
    "StoreAddOn",
    "StoreDeployment",
    "store_template_selection",

    // Root entities (Pascal Case)
    "Store",
    "User",
  ];

  for (const tablename of tablenames) {
    try {
      // TRUNCATE with CASCADE is the safest way to clear related data in Postgres
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE;`);
      console.log(`✅ Cleared table: ${tablename}`);
    } catch (e: any) {
      // Some tables might not exist in the current schema or have different names
      if (e.message.includes("does not exist")) {
        continue;
      }
      console.error(`❌ Failed to clear ${tablename}:`, e.message);
    }
  }

  console.log(
    "\n✨ Database is now ready for production launch. All test data purged.",
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
