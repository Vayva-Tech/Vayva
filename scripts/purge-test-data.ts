import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting data purge for launch...');

  // Order of deletion matters due to foreign key constraints
  // We use executeRawUnsafe for TRUNCATE with CASCADE to handle dependencies efficiently
  const tablenames = [
    // Transactional & Logs
    'audit_log',
    'admin_audit_log',
    'audit_event',
    'ops_audit_event',
    'ai_usage_event',
    'ai_usage_daily',
    'analytics_daily_delivery',
    'analytics_daily_payments',
    'analytics_daily_sales',
    'analytics_daily_support',
    'analytics_event',
    'telemetry_event',
    'support_telemetry_event',
    
    // Core Merchant Data
    'order',
    'order_item',
    'order_event',
    'order_timeline_event',
    'order_discount',
    'fulfillment_group',
    'shipment',
    'delivery_event',
    'dispatch_job',
    'invoice_v2',
    'invoice_line_v2',
    'ledger_entry',
    'ledger_transaction',
    'payout',
    'refund',
    'charge',
    'payment_intent',
    'payment_transaction',
    
    // Customers & Support
    'customer',
    'customer_address',
    'customer_note',
    'customer_session',
    'customer_account',
    'contact',
    'conversation',
    'message',
    'ticket_message',
    'support_ticket',
    'support_case',
    'handoff_event',
    
    // Inventory & Products
    'product',
    'product_variant',
    'product_image',
    'inventory_item',
    'inventory_location',
    'inventory_movement',
    'inventory_event',
    'collection_product',
    'collection',
    
    // Marketing & Coupons
    'campaign',
    'campaign_send',
    'coupon',
    'discount_redemption',
    
    // Authentication & Sessions
    'merchant_session',
    'user_session',
    'ops_session',
    'password_reset_token',
    'otp_code',
    'membership',
    'staff_invite',
    'api_key',
    
    // Onboarding & Store Setup
    'merchant_onboarding',
    'onboarding_analytics_event',
    'kyc_record',
    'bank_beneficiary',
    'merchant_ai_subscription',
    'store_add_on',
    'store_deployment',
    'store_template_selection',
    
    // Finally, the root entities
    'store',
    'user',
  ];

  for (const tablename of tablenames) {
    try {
      // Note: Table names are quoted to handle any potential case sensitivity in Postgres
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE;`);
      console.log(`✅ Cleared table: ${tablename}`);
    } catch (e: any) {
      console.error(`❌ Failed to clear ${tablename}:`, e.message);
    }
  }

  console.log('\n✨ Database is now ready for production launch.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
