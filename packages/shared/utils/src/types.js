"use strict";
// ApiResponse moved to ./api/types.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.KYCStatus = exports.UnifiedOrderStatus = exports.OrderType = exports.CustomerStatus = exports.ProductServiceStatus = exports.ProductServiceType = exports.InvoiceStatus = exports.RefundStatus = exports.DisputeStatus = exports.SettlementStatus = exports.WalletTransactionStatus = exports.WalletTransactionType = exports.WhatsAppLinkedEntityType = exports.WhatsAppMessageSender = exports.PaymentStatus = exports.OrderStatus = exports.BusinessType = exports.SubscriptionPlan = exports.OnboardingStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["OWNER"] = "OWNER";
    UserRole["ADMIN"] = "ADMIN";
    UserRole["STAFF"] = "STAFF";
    UserRole["SUPPORT"] = "SUPPORT";
    UserRole["FINANCE"] = "FINANCE";
    UserRole["OPS"] = "OPS";
    UserRole["PLATFORM_ADMIN"] = "PLATFORM_ADMIN";
})(UserRole || (exports.UserRole = UserRole = {}));
var OnboardingStatus;
(function (OnboardingStatus) {
    OnboardingStatus["NOT_STARTED"] = "NOT_STARTED";
    OnboardingStatus["IN_PROGRESS"] = "IN_PROGRESS";
    OnboardingStatus["REQUIRED_COMPLETE"] = "REQUIRED_COMPLETE";
    OnboardingStatus["OPTIONAL_INCOMPLETE"] = "OPTIONAL_INCOMPLETE";
    OnboardingStatus["COMPLETE"] = "COMPLETE";
})(OnboardingStatus || (exports.OnboardingStatus = OnboardingStatus = {}));
var SubscriptionPlan;
(function (SubscriptionPlan) {
    SubscriptionPlan["STARTER"] = "STARTER";
    SubscriptionPlan["GROWTH"] = "GROWTH";
    SubscriptionPlan["PRO"] = "PRO";
})(SubscriptionPlan || (exports.SubscriptionPlan = SubscriptionPlan = {}));
var BusinessType;
(function (BusinessType) {
    BusinessType["RETAIL"] = "RETAIL";
    BusinessType["FOOD"] = "FOOD";
    BusinessType["SERVICES"] = "SERVICES";
})(BusinessType || (exports.BusinessType = BusinessType = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["DRAFT"] = "DRAFT";
    OrderStatus["PENDING_PAYMENT"] = "PENDING_PAYMENT";
    OrderStatus["PAID"] = "PAID";
    OrderStatus["PROCESSING"] = "PROCESSING";
    OrderStatus["SHIPPED"] = "SHIPPED";
    OrderStatus["DELIVERED"] = "DELIVERED";
    OrderStatus["CANCELLED"] = "CANCELLED";
    OrderStatus["REFUND_REQUESTED"] = "REFUND_REQUESTED";
    OrderStatus["REFUNDED"] = "REFUNDED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["INITIATED"] = "INITIATED";
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["VERIFIED"] = "VERIFIED";
    PaymentStatus["SUCCESS"] = "SUCCESS";
    PaymentStatus["FAILED"] = "FAILED";
    PaymentStatus["REVIEW_REQUIRED"] = "REVIEW_REQUIRED";
    PaymentStatus["REFUNDED"] = "REFUNDED";
    PaymentStatus["DISPUTED"] = "DISPUTED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var WhatsAppMessageSender;
(function (WhatsAppMessageSender) {
    WhatsAppMessageSender["CUSTOMER"] = "customer";
    WhatsAppMessageSender["MERCHANT"] = "merchant";
    WhatsAppMessageSender["SYSTEM"] = "system";
})(WhatsAppMessageSender || (exports.WhatsAppMessageSender = WhatsAppMessageSender = {}));
var WhatsAppLinkedEntityType;
(function (WhatsAppLinkedEntityType) {
    WhatsAppLinkedEntityType["ORDER"] = "order";
    WhatsAppLinkedEntityType["BOOKING"] = "booking";
    WhatsAppLinkedEntityType["NONE"] = "none";
})(WhatsAppLinkedEntityType || (exports.WhatsAppLinkedEntityType = WhatsAppLinkedEntityType = {}));
var WalletTransactionType;
(function (WalletTransactionType) {
    WalletTransactionType["PAYMENT"] = "payment";
    WalletTransactionType["PAYOUT"] = "payout";
    WalletTransactionType["REFUND"] = "refund";
    WalletTransactionType["DISPUTE_HOLD"] = "dispute_hold";
    WalletTransactionType["DISPUTE_RELEASE"] = "dispute_release";
    WalletTransactionType["SETTLEMENT"] = "settlement";
})(WalletTransactionType || (exports.WalletTransactionType = WalletTransactionType = {}));
var WalletTransactionStatus;
(function (WalletTransactionStatus) {
    WalletTransactionStatus["PENDING"] = "pending";
    WalletTransactionStatus["COMPLETED"] = "completed";
    WalletTransactionStatus["FAILED"] = "failed";
    WalletTransactionStatus["ON_HOLD"] = "on_hold";
    WalletTransactionStatus["CANCELLED"] = "cancelled";
})(WalletTransactionStatus || (exports.WalletTransactionStatus = WalletTransactionStatus = {}));
var SettlementStatus;
(function (SettlementStatus) {
    SettlementStatus["PENDING"] = "pending";
    SettlementStatus["SETTLED"] = "settled";
    SettlementStatus["FAILED"] = "failed";
    SettlementStatus["DELAYED"] = "delayed";
})(SettlementStatus || (exports.SettlementStatus = SettlementStatus = {}));
var DisputeStatus;
(function (DisputeStatus) {
    DisputeStatus["OPENED"] = "OPENED";
    DisputeStatus["EVIDENCE_REQUIRED"] = "EVIDENCE_REQUIRED";
    DisputeStatus["SUBMITTED"] = "SUBMITTED";
    DisputeStatus["EVIDENCE_SUBMITTED"] = "EVIDENCE_SUBMITTED";
    DisputeStatus["UNDER_REVIEW"] = "UNDER_REVIEW";
    DisputeStatus["WON"] = "WON";
    DisputeStatus["LOST"] = "LOST";
    DisputeStatus["CANCELLED"] = "CANCELLED";
    DisputeStatus["CLOSED"] = "CLOSED";
})(DisputeStatus || (exports.DisputeStatus = DisputeStatus = {}));
var RefundStatus;
(function (RefundStatus) {
    RefundStatus["REQUESTED"] = "REQUESTED";
    RefundStatus["APPROVED"] = "APPROVED";
    RefundStatus["PROCESSING"] = "PROCESSING";
    RefundStatus["SUCCESS"] = "SUCCESS";
    RefundStatus["FAILED"] = "FAILED";
    RefundStatus["CANCELLED"] = "CANCELLED";
})(RefundStatus || (exports.RefundStatus = RefundStatus = {}));
var InvoiceStatus;
(function (InvoiceStatus) {
    InvoiceStatus["DRAFT"] = "draft";
    InvoiceStatus["ISSUED"] = "issued";
    InvoiceStatus["PAID"] = "paid";
    InvoiceStatus["OVERDUE"] = "overdue";
    InvoiceStatus["VOID"] = "void";
})(InvoiceStatus || (exports.InvoiceStatus = InvoiceStatus = {}));
var ProductServiceType;
(function (ProductServiceType) {
    ProductServiceType["RETAIL"] = "retail";
    ProductServiceType["FOOD"] = "food";
    ProductServiceType["SERVICE"] = "service";
    ProductServiceType["DIGITAL"] = "digital";
    ProductServiceType["EVENT"] = "event";
    ProductServiceType["HOTEL"] = "hotel";
    ProductServiceType["AUTO"] = "auto";
    ProductServiceType["REAL_ESTATE"] = "real_estate";
})(ProductServiceType || (exports.ProductServiceType = ProductServiceType = {}));
var ProductServiceStatus;
(function (ProductServiceStatus) {
    ProductServiceStatus["ACTIVE"] = "active";
    ProductServiceStatus["DRAFT"] = "draft";
    ProductServiceStatus["INACTIVE"] = "inactive";
    ProductServiceStatus["OUT_OF_STOCK"] = "out_of_stock";
    ProductServiceStatus["SCHEDULED"] = "scheduled";
})(ProductServiceStatus || (exports.ProductServiceStatus = ProductServiceStatus = {}));
var CustomerStatus;
(function (CustomerStatus) {
    CustomerStatus["NEW"] = "new";
    CustomerStatus["RETURNING"] = "returning";
    CustomerStatus["VIP"] = "vip";
})(CustomerStatus || (exports.CustomerStatus = CustomerStatus = {}));
var OrderType;
(function (OrderType) {
    OrderType["RETAIL"] = "retail";
    OrderType["FOOD"] = "food";
    OrderType["SERVICE"] = "service";
})(OrderType || (exports.OrderType = OrderType = {}));
var UnifiedOrderStatus;
(function (UnifiedOrderStatus) {
    // Retail & Food
    UnifiedOrderStatus["NEW"] = "new";
    UnifiedOrderStatus["PROCESSING"] = "processing";
    UnifiedOrderStatus["READY"] = "ready";
    UnifiedOrderStatus["COMPLETED"] = "completed";
    UnifiedOrderStatus["CANCELLED"] = "cancelled";
    UnifiedOrderStatus["REFUNDED"] = "refunded";
    // Service specific
    UnifiedOrderStatus["REQUESTED"] = "requested";
    UnifiedOrderStatus["CONFIRMED"] = "confirmed";
})(UnifiedOrderStatus || (exports.UnifiedOrderStatus = UnifiedOrderStatus = {}));
// ACCOUNT OVERVIEW TYPES
var KYCStatus;
(function (KYCStatus) {
    KYCStatus["NOT_STARTED"] = "NOT_STARTED";
    KYCStatus["PENDING"] = "PENDING";
    KYCStatus["VERIFIED"] = "VERIFIED";
    KYCStatus["REJECTED"] = "REJECTED";
})(KYCStatus || (exports.KYCStatus = KYCStatus = {}));
//# sourceMappingURL=types.js.map