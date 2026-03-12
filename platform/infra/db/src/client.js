import { PrismaClient } from "./generated/client";
// import { PrismaPg } from "@prisma/adapter-pg";
// import pg from "pg";
// Re-export PrismaClient and Prisma
export { PrismaClient, Prisma, 
// Core Enums from schema.prisma (Verified present in generated client)
AiActionStatus, ApiKeyStatus, AppRole, ApprovalStatus, BillingProvider, CampaignChannel, CampaignSendStatus, CampaignStatus, CampaignType, Channel, ChecklistCategory, ChecklistStatus, CouponStatus, DLQStatus, DataRequestStatus, DataRequestType, DeviceStatus, DeviceType, Direction, DiscountAppliesTo, DiscountType, DisputeEvidenceType, DisputeProvider, DisputeStatus, EnforcementActionType, EnforcementScope, EvidenceFileType, EvidenceScope, FlagSeverity, FulfillmentStatus, IdempotencyStatus, JobRunStatus, KycStatus, LegalKey, ListingStatus, MessageStatus, MessageType, MetricPeriod, MigrationStatus, OnboardingStatus, OrderStatus, OutboxEventStatus, PaymentStatus, PolicyStatus, PolicyType, ReportEntityType, ReportReason, ReportStatus, RestockAction, ReturnCondition, ReturnMethod, ReturnReason, ReturnResolution, ReturnStatus, ReviewStatus, RiskScope, RiskSeverity, RiskStatus, SubscriptionPlan, SubscriptionStatus, SupportCaseCategory, SupportCaseStatus, ThemeStatus, VirtualAccountStatus, WebhookDeliveryStatus, WebhookEndpointStatus, ExportStatus, DataDeletionStatus, DeletionStatus, MerchantType, ImportOrderState, 
// Additional Enums from schema.prisma
BookingStatus, RaffleEntryStatus, Transmission, FuelType, AccommodationType, PostStatus, AutomationTrigger, AutomationAction, LedgerAccountType, TransactionType, } from "./generated/client";
const globalForPrisma = globalThis;
// import { PrismaPg } from "@prisma/adapter-pg";
// import pg from "pg";
// const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
// const adapter = new PrismaPg(pool);
export const prisma = globalForPrisma.prisma ?? new PrismaClient(); // Removed { adapter }
export * from "./helpers/idempotency";
if (process.env.NODE_ENV !== "production")
    globalForPrisma.prisma = prisma;
