"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportStatus = exports.ReportReason = exports.ReportEntityType = exports.PolicyType = exports.PolicyStatus = exports.PaymentStatus = exports.OutboxEventStatus = exports.OrderStatus = exports.OnboardingStatus = exports.MigrationStatus = exports.MetricPeriod = exports.MessageType = exports.MessageStatus = exports.ListingStatus = exports.LegalKey = exports.KycStatus = exports.JobRunStatus = exports.IdempotencyStatus = exports.FulfillmentStatus = exports.FlagSeverity = exports.EvidenceScope = exports.EvidenceFileType = exports.EnforcementScope = exports.EnforcementActionType = exports.DisputeStatus = exports.DisputeProvider = exports.DisputeEvidenceType = exports.DiscountType = exports.DiscountAppliesTo = exports.Direction = exports.DeviceType = exports.DeviceStatus = exports.DataRequestType = exports.DataRequestStatus = exports.DLQStatus = exports.CouponStatus = exports.ChecklistStatus = exports.ChecklistCategory = exports.Channel = exports.CampaignType = exports.CampaignStatus = exports.CampaignSendStatus = exports.CampaignChannel = exports.BillingProvider = exports.ApprovalStatus = exports.AppRole = exports.ApiKeyStatus = exports.AiActionStatus = exports.Prisma = exports.PrismaClient = void 0;
exports.prisma = exports.TransactionType = exports.LedgerAccountType = exports.AutomationAction = exports.AutomationTrigger = exports.PostStatus = exports.AccommodationType = exports.FuelType = exports.Transmission = exports.RaffleEntryStatus = exports.BookingStatus = exports.OrderSource = exports.UploadStatus = exports.UploadPurpose = exports.ImportOrderState = exports.MerchantType = exports.DeletionStatus = exports.DataDeletionStatus = exports.ExportStatus = exports.WebhookEndpointStatus = exports.WebhookDeliveryStatus = exports.VirtualAccountStatus = exports.ThemeStatus = exports.SupportTicketType = exports.SupportTicketStatus = exports.SupportTicketPriority = exports.SupportTicketCategory = exports.SupportCaseStatus = exports.SupportCaseCategory = exports.SubscriptionStatus = exports.SubscriptionPlan = exports.RiskStatus = exports.RiskSeverity = exports.RiskScope = exports.ReviewStatus = exports.ReturnStatus = exports.ReturnResolution = exports.ReturnReason = exports.ReturnMethod = exports.ReturnCondition = exports.RefundStatus = exports.RestockAction = void 0;
exports.getIsolatedPrisma = getIsolatedPrisma;
/* eslint-disable */
// @ts-nocheck
const client_1 = require("./generated/client");
// import { PrismaPg } from "@prisma/adapter-pg";
// import pg from "pg";
// Re-export PrismaClient and Prisma
var client_2 = require("./generated/client");
Object.defineProperty(exports, "PrismaClient", { enumerable: true, get: function () { return client_2.PrismaClient; } });
Object.defineProperty(exports, "Prisma", { enumerable: true, get: function () { return client_2.Prisma; } });
// Core Enums from schema.prisma (Verified present in generated client)
Object.defineProperty(exports, "AiActionStatus", { enumerable: true, get: function () { return client_2.AiActionStatus; } });
Object.defineProperty(exports, "ApiKeyStatus", { enumerable: true, get: function () { return client_2.ApiKeyStatus; } });
Object.defineProperty(exports, "AppRole", { enumerable: true, get: function () { return client_2.AppRole; } });
Object.defineProperty(exports, "ApprovalStatus", { enumerable: true, get: function () { return client_2.ApprovalStatus; } });
Object.defineProperty(exports, "BillingProvider", { enumerable: true, get: function () { return client_2.BillingProvider; } });
Object.defineProperty(exports, "CampaignChannel", { enumerable: true, get: function () { return client_2.CampaignChannel; } });
Object.defineProperty(exports, "CampaignSendStatus", { enumerable: true, get: function () { return client_2.CampaignSendStatus; } });
Object.defineProperty(exports, "CampaignStatus", { enumerable: true, get: function () { return client_2.CampaignStatus; } });
Object.defineProperty(exports, "CampaignType", { enumerable: true, get: function () { return client_2.CampaignType; } });
Object.defineProperty(exports, "Channel", { enumerable: true, get: function () { return client_2.Channel; } });
Object.defineProperty(exports, "ChecklistCategory", { enumerable: true, get: function () { return client_2.ChecklistCategory; } });
Object.defineProperty(exports, "ChecklistStatus", { enumerable: true, get: function () { return client_2.ChecklistStatus; } });
Object.defineProperty(exports, "CouponStatus", { enumerable: true, get: function () { return client_2.CouponStatus; } });
Object.defineProperty(exports, "DLQStatus", { enumerable: true, get: function () { return client_2.DLQStatus; } });
Object.defineProperty(exports, "DataRequestStatus", { enumerable: true, get: function () { return client_2.DataRequestStatus; } });
Object.defineProperty(exports, "DataRequestType", { enumerable: true, get: function () { return client_2.DataRequestType; } });
Object.defineProperty(exports, "DeviceStatus", { enumerable: true, get: function () { return client_2.DeviceStatus; } });
Object.defineProperty(exports, "DeviceType", { enumerable: true, get: function () { return client_2.DeviceType; } });
Object.defineProperty(exports, "Direction", { enumerable: true, get: function () { return client_2.Direction; } });
Object.defineProperty(exports, "DiscountAppliesTo", { enumerable: true, get: function () { return client_2.DiscountAppliesTo; } });
Object.defineProperty(exports, "DiscountType", { enumerable: true, get: function () { return client_2.DiscountType; } });
Object.defineProperty(exports, "DisputeEvidenceType", { enumerable: true, get: function () { return client_2.DisputeEvidenceType; } });
Object.defineProperty(exports, "DisputeProvider", { enumerable: true, get: function () { return client_2.DisputeProvider; } });
Object.defineProperty(exports, "DisputeStatus", { enumerable: true, get: function () { return client_2.DisputeStatus; } });
Object.defineProperty(exports, "EnforcementActionType", { enumerable: true, get: function () { return client_2.EnforcementActionType; } });
Object.defineProperty(exports, "EnforcementScope", { enumerable: true, get: function () { return client_2.EnforcementScope; } });
Object.defineProperty(exports, "EvidenceFileType", { enumerable: true, get: function () { return client_2.EvidenceFileType; } });
Object.defineProperty(exports, "EvidenceScope", { enumerable: true, get: function () { return client_2.EvidenceScope; } });
Object.defineProperty(exports, "FlagSeverity", { enumerable: true, get: function () { return client_2.FlagSeverity; } });
Object.defineProperty(exports, "FulfillmentStatus", { enumerable: true, get: function () { return client_2.FulfillmentStatus; } });
Object.defineProperty(exports, "IdempotencyStatus", { enumerable: true, get: function () { return client_2.IdempotencyStatus; } });
Object.defineProperty(exports, "JobRunStatus", { enumerable: true, get: function () { return client_2.JobRunStatus; } });
Object.defineProperty(exports, "KycStatus", { enumerable: true, get: function () { return client_2.KycStatus; } });
Object.defineProperty(exports, "LegalKey", { enumerable: true, get: function () { return client_2.LegalKey; } });
Object.defineProperty(exports, "ListingStatus", { enumerable: true, get: function () { return client_2.ListingStatus; } });
Object.defineProperty(exports, "MessageStatus", { enumerable: true, get: function () { return client_2.MessageStatus; } });
Object.defineProperty(exports, "MessageType", { enumerable: true, get: function () { return client_2.MessageType; } });
Object.defineProperty(exports, "MetricPeriod", { enumerable: true, get: function () { return client_2.MetricPeriod; } });
Object.defineProperty(exports, "MigrationStatus", { enumerable: true, get: function () { return client_2.MigrationStatus; } });
Object.defineProperty(exports, "OnboardingStatus", { enumerable: true, get: function () { return client_2.OnboardingStatus; } });
Object.defineProperty(exports, "OrderStatus", { enumerable: true, get: function () { return client_2.OrderStatus; } });
Object.defineProperty(exports, "OutboxEventStatus", { enumerable: true, get: function () { return client_2.OutboxEventStatus; } });
Object.defineProperty(exports, "PaymentStatus", { enumerable: true, get: function () { return client_2.PaymentStatus; } });
Object.defineProperty(exports, "PolicyStatus", { enumerable: true, get: function () { return client_2.PolicyStatus; } });
Object.defineProperty(exports, "PolicyType", { enumerable: true, get: function () { return client_2.PolicyType; } });
Object.defineProperty(exports, "ReportEntityType", { enumerable: true, get: function () { return client_2.ReportEntityType; } });
Object.defineProperty(exports, "ReportReason", { enumerable: true, get: function () { return client_2.ReportReason; } });
Object.defineProperty(exports, "ReportStatus", { enumerable: true, get: function () { return client_2.ReportStatus; } });
Object.defineProperty(exports, "RestockAction", { enumerable: true, get: function () { return client_2.RestockAction; } });
Object.defineProperty(exports, "RefundStatus", { enumerable: true, get: function () { return client_2.RefundStatus; } });
Object.defineProperty(exports, "ReturnCondition", { enumerable: true, get: function () { return client_2.ReturnCondition; } });
Object.defineProperty(exports, "ReturnMethod", { enumerable: true, get: function () { return client_2.ReturnMethod; } });
Object.defineProperty(exports, "ReturnReason", { enumerable: true, get: function () { return client_2.ReturnReason; } });
Object.defineProperty(exports, "ReturnResolution", { enumerable: true, get: function () { return client_2.ReturnResolution; } });
Object.defineProperty(exports, "ReturnStatus", { enumerable: true, get: function () { return client_2.ReturnStatus; } });
Object.defineProperty(exports, "ReviewStatus", { enumerable: true, get: function () { return client_2.ReviewStatus; } });
Object.defineProperty(exports, "RiskScope", { enumerable: true, get: function () { return client_2.RiskScope; } });
Object.defineProperty(exports, "RiskSeverity", { enumerable: true, get: function () { return client_2.RiskSeverity; } });
Object.defineProperty(exports, "RiskStatus", { enumerable: true, get: function () { return client_2.RiskStatus; } });
Object.defineProperty(exports, "SubscriptionPlan", { enumerable: true, get: function () { return client_2.SubscriptionPlan; } });
Object.defineProperty(exports, "SubscriptionStatus", { enumerable: true, get: function () { return client_2.SubscriptionStatus; } });
Object.defineProperty(exports, "SupportCaseCategory", { enumerable: true, get: function () { return client_2.SupportCaseCategory; } });
Object.defineProperty(exports, "SupportCaseStatus", { enumerable: true, get: function () { return client_2.SupportCaseStatus; } });
Object.defineProperty(exports, "SupportTicketCategory", { enumerable: true, get: function () { return client_2.SupportTicketCategory; } });
Object.defineProperty(exports, "SupportTicketPriority", { enumerable: true, get: function () { return client_2.SupportTicketPriority; } });
Object.defineProperty(exports, "SupportTicketStatus", { enumerable: true, get: function () { return client_2.SupportTicketStatus; } });
Object.defineProperty(exports, "SupportTicketType", { enumerable: true, get: function () { return client_2.SupportTicketType; } });
Object.defineProperty(exports, "ThemeStatus", { enumerable: true, get: function () { return client_2.ThemeStatus; } });
Object.defineProperty(exports, "VirtualAccountStatus", { enumerable: true, get: function () { return client_2.VirtualAccountStatus; } });
Object.defineProperty(exports, "WebhookDeliveryStatus", { enumerable: true, get: function () { return client_2.WebhookDeliveryStatus; } });
Object.defineProperty(exports, "WebhookEndpointStatus", { enumerable: true, get: function () { return client_2.WebhookEndpointStatus; } });
Object.defineProperty(exports, "ExportStatus", { enumerable: true, get: function () { return client_2.ExportStatus; } });
Object.defineProperty(exports, "DataDeletionStatus", { enumerable: true, get: function () { return client_2.DataDeletionStatus; } });
Object.defineProperty(exports, "DeletionStatus", { enumerable: true, get: function () { return client_2.DeletionStatus; } });
Object.defineProperty(exports, "MerchantType", { enumerable: true, get: function () { return client_2.MerchantType; } });
Object.defineProperty(exports, "ImportOrderState", { enumerable: true, get: function () { return client_2.ImportOrderState; } });
Object.defineProperty(exports, "UploadPurpose", { enumerable: true, get: function () { return client_2.UploadPurpose; } });
Object.defineProperty(exports, "UploadStatus", { enumerable: true, get: function () { return client_2.UploadStatus; } });
Object.defineProperty(exports, "OrderSource", { enumerable: true, get: function () { return client_2.OrderSource; } });
// Additional Enums from schema.prisma
Object.defineProperty(exports, "BookingStatus", { enumerable: true, get: function () { return client_2.BookingStatus; } });
Object.defineProperty(exports, "RaffleEntryStatus", { enumerable: true, get: function () { return client_2.RaffleEntryStatus; } });
Object.defineProperty(exports, "Transmission", { enumerable: true, get: function () { return client_2.Transmission; } });
Object.defineProperty(exports, "FuelType", { enumerable: true, get: function () { return client_2.FuelType; } });
Object.defineProperty(exports, "AccommodationType", { enumerable: true, get: function () { return client_2.AccommodationType; } });
Object.defineProperty(exports, "PostStatus", { enumerable: true, get: function () { return client_2.PostStatus; } });
Object.defineProperty(exports, "AutomationTrigger", { enumerable: true, get: function () { return client_2.AutomationTrigger; } });
Object.defineProperty(exports, "AutomationAction", { enumerable: true, get: function () { return client_2.AutomationAction; } });
Object.defineProperty(exports, "LedgerAccountType", { enumerable: true, get: function () { return client_2.LedgerAccountType; } });
Object.defineProperty(exports, "TransactionType", { enumerable: true, get: function () { return client_2.TransactionType; } });
const globalForPrisma = globalThis;
// import { PrismaPg } from "@prisma/adapter-pg";
// import pg from "pg";
// const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
// const adapter = new PrismaPg(pool);
exports.prisma = globalForPrisma.prisma ?? new client_1.PrismaClient(); // Removed { adapter }
// Create isolated Prisma client for multi-tenant scenarios
function getIsolatedPrisma() {
    return new client_1.PrismaClient();
}
__exportStar(require("./helpers/idempotency"), exports);
if (process.env.NODE_ENV !== "production")
    globalForPrisma.prisma = exports.prisma;
//# sourceMappingURL=client.js.map