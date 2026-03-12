#!/usr/bin/env node
/**
 * Script to remove @ts-ignore comments from API route imports
 * These comments were temporarily added during module resolution migration
 */

const fs = require('fs');
const path = require('path');

const API_ROUTES_DIR = path.join(__dirname, '../src/app/api');

// Known import patterns that had @ts-ignore
const IMPORT_PATTERNS = [
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/lib/api-handler', name: 'withVayvaAPI' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/lib/team/permissions', name: 'PERMISSIONS' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/lib/auth', name: 'authOptions' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/digital-products.service', name: 'digitalProductsService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/creative.service', name: 'creativePortfolioService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/content.service', name: 'blogMediaService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/customer-referral.service', name: 'getReferralService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/virtual-try-on.service', name: 'getVirtualTryOnService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/email-marketing.service', name: 'emailMarketingService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/marketing.service', name: 'emailMarketingService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/merchandising.service', name: 'merchandisingService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/pricing.service', name: 'pricingService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/wallet.service', name: 'walletService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/vendor.service', name: 'vendorService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/food.service', name: 'foodService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/ai-content.service', name: 'aiContentService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/kyc.service', name: 'kycService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/billing.service', name: 'billingService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/print.service', name: 'printService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/loyalty.service', name: 'loyaltyService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/autopilot.service', name: 'autopilotService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/audit.service', name: 'auditService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/dispute.service', name: 'disputeService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/marketing-campaign.service', name: 'marketingCampaignService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/marketing-content.service', name: 'marketingContentService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/marketing-reward.service', name: 'marketingRewardService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/marketing-storefront.service', name: 'marketingStorefrontService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/marketing-segment.service', name: 'marketingSegmentService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/kitchen.service', name: 'kitchenService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/kitchen-display.service', name: 'kitchenDisplayService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/restaurant.service', name: 'restaurantService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/table-management.service', name: 'tableManagementService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/reservation.service', name: 'reservationService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/event.service', name: 'eventService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/event-ticket.service', name: 'eventTicketService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/event-attendee.service', name: 'eventAttendeeService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/event-purchase.service', name: 'eventPurchaseService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/education.service', name: 'educationService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/education-enrollment.service', name: 'educationEnrollmentService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/electronics-warranty.service', name: 'electronicsWarrantyService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/fashion.service', name: 'fashionService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/fashion-size.service', name: 'fashionSizeService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/finance.service', name: 'financeService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/finance-bank.service', name: 'financeBankService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/finance-payout.service', name: 'financePayoutService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/finance-report.service', name: 'financeReportService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/finance-statement.service', name: 'financeStatementService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/finance-transaction.service', name: 'financeTransactionService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/food.service', name: 'foodService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/food-reservation.service', name: 'foodReservationService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/fulfillment.service', name: 'fulfillmentService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/fulfillment-shipment.service', name: 'fulfillmentShipmentService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/inventory.service', name: 'inventoryService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/inventory-location.service', name: 'inventoryLocationService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/inventory-transfer.service', name: 'inventoryTransferService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/job.service', name: 'jobService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/lead.service', name: 'leadService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/ledger.service', name: 'ledgerService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/ledger-import.service', name: 'ledgerImportService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/loyalty-customer.service', name: 'loyaltyCustomerService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/loyalty-program.service', name: 'loyaltyProgramService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/loyalty-reward.service', name: 'loyaltyRewardService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/merchant.service', name: 'merchantService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/merchant-addon.service', name: 'merchantAddonService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/merchant-audit.service', name: 'merchantAuditService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/merchant-billing.service', name: 'merchantBillingService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/merchant-autopilot.service', name: 'merchantAutopilotService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/merchant-coupon.service', name: 'merchantCouponService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/merchant-domain.service', name: 'merchantDomainService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/merchant-discount.service', name: 'merchantDiscountService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/merchant-export.service', name: 'merchantExportService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/merchant-flashsale.service', name: 'merchantFlashsaleService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/merchant-integration.service', name: 'merchantIntegrationService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/merchant-plan.service', name: 'merchantPlanService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/merchant-promotion.service', name: 'merchantPromotionService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/merchant-referral.service', name: 'merchantReferralService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/merchant-review.service', name: 'merchantReviewService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/merchant-settings.service', name: 'merchantSettingsService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/merchant-store.service', name: 'merchantStoreService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/merchant-subscription.service', name: 'merchantSubscriptionService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/merchant-support.service', name: 'merchantSupportService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/merchant-tax.service', name: 'merchantTaxService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/merchant-whitelist.service', name: 'merchantWhitelistService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/notification.service', name: 'notificationService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/order.service', name: 'orderService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/payment.service', name: 'paymentService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/payment-method.service', name: 'paymentMethodService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/payout-account.service', name: 'payoutAccountService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/policy.service', name: 'policyService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/pricing.service', name: 'pricingService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/product.service', name: 'productService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/refund.service', name: 'refundService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/report.service', name: 'reportService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/review.service', name: 'reviewService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/role.service', name: 'roleService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/setting.service', name: 'settingService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/shipping.service', name: 'shippingService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/shipping-rate.service', name: 'shippingRateService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/social.service', name: 'socialService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/staff.service', name: 'staffService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/store.service', name: 'storeService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/support.service', name: 'supportService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/support-conversation.service', name: 'supportConversationService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/support-message.service', name: 'supportMessageService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/support-ticket.service', name: 'supportTicketService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/tax.service', name: 'taxService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/team.service', name: 'teamService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/team-permission.service', name: 'teamPermissionService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/theme.service', name: 'themeService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/upload.service', name: 'uploadService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/user.service', name: 'userService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/vendor.service', name: 'vendorService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/wallet.service', name: 'walletService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/webhook.service', name: 'webhookService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/whatsapp.service', name: 'whatsappService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/whatsapp-broadcast.service', name: 'whatsappBroadcastService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/whatsapp-contact.service', name: 'whatsappContactService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/whatsapp-message.service', name: 'whatsappMessageService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/whatsapp-template.service', name: 'whatsappTemplateService' },
  { comment: '@ts-ignore - Module resolution pending\n', path: '@/services/zapier.service', name: 'zapierService' },
];

function removeTsIgnoreFromFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;

  // Remove @ts-ignore comments that precede known imports
  // Pattern: // @ts-ignore - Module resolution pending\nimport { X } from 'Y';
  for (const pattern of IMPORT_PATTERNS) {
    const regex = new RegExp(`\\/\\/ @ts-ignore - Module resolution pending\\s*\\n(import\\s+.*\\s+from\\s+['"]${pattern.path}['"];)`, 'g');
    if (regex.test(content)) {
      content = content.replace(regex, '$1');
      modified = true;
    }
  }

  // Also handle the simpler case: // @ts-ignore - Module resolution pending\nimport X from 'Y';
  const genericRegex = /\/\/ @ts-ignore - Module resolution pending\s*\n(import\s+.*?;)/g;
  if (genericRegex.test(content)) {
    content = content.replace(genericRegex, '$1');
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ ${filePath}`);
    return true;
  }
  return false;
}

function findTsFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      findTsFiles(fullPath, files);
    } else if (item.endsWith('.ts') && !item.endsWith('.d.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

function main() {
  console.log('🔍 Scanning for @ts-ignore comments in API routes...\n');
  
  if (!fs.existsSync(API_ROUTES_DIR)) {
    console.error(`❌ Directory not found: ${API_ROUTES_DIR}`);
    process.exit(1);
  }

  const files = findTsFiles(API_ROUTES_DIR);
  let modifiedCount = 0;
  let totalFilesChecked = 0;

  for (const file of files) {
    totalFilesChecked++;
    if (removeTsIgnoreFromFile(file)) {
      modifiedCount++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Files checked: ${totalFilesChecked}`);
  console.log(`   Files modified: ${modifiedCount}`);
  
  if (modifiedCount === 0) {
    console.log('\n✨ No @ts-ignore comments found!');
  }
}

main();
