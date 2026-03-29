export declare enum UserRole {
    OWNER = "OWNER",
    ADMIN = "ADMIN",
    STAFF = "STAFF",
    SUPPORT = "SUPPORT",
    FINANCE = "FINANCE",
    OPS = "OPS",
    PLATFORM_ADMIN = "PLATFORM_ADMIN"
}
export declare enum OnboardingStatus {
    NOT_STARTED = "NOT_STARTED",
    IN_PROGRESS = "IN_PROGRESS",
    REQUIRED_COMPLETE = "REQUIRED_COMPLETE",
    OPTIONAL_INCOMPLETE = "OPTIONAL_INCOMPLETE",
    COMPLETE = "COMPLETE"
}
export declare enum SubscriptionPlan {
    STARTER = "STARTER",
    GROWTH = "GROWTH",
    PRO = "PRO"
}
export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    emailVerified: boolean;
    phoneVerified: boolean;
    role: UserRole;
    storeId?: string;
    avatarUrl?: string;
    image?: string;
    createdAt: string;
}
export declare enum BusinessType {
    RETAIL = "RETAIL",
    FOOD = "FOOD",
    SERVICES = "SERVICES"
}
export interface MerchantContext {
    merchantId: string;
    storeId: string;
    businessType: BusinessType;
    onboardingStatus: OnboardingStatus;
    onboardingLastStep: string;
    onboardingUpdatedAt: string;
    plan: SubscriptionPlan;
    industrySlug: string;
}
export interface AuthMeResponse {
    user: User;
    merchant?: MerchantContext;
}
export declare enum OrderStatus {
    DRAFT = "DRAFT",
    PENDING_PAYMENT = "PENDING_PAYMENT",
    PAID = "PAID",
    PROCESSING = "PROCESSING",
    SHIPPED = "SHIPPED",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED",
    REFUND_REQUESTED = "REFUND_REQUESTED",
    REFUNDED = "REFUNDED"
}
export declare enum PaymentStatus {
    INITIATED = "INITIATED",
    PENDING = "PENDING",
    VERIFIED = "VERIFIED",
    SUCCESS = "SUCCESS",
    FAILED = "FAILED",
    REVIEW_REQUIRED = "REVIEW_REQUIRED",
    REFUNDED = "REFUNDED",
    DISPUTED = "DISPUTED"
}
export declare enum WhatsAppMessageSender {
    CUSTOMER = "customer",
    MERCHANT = "merchant",
    SYSTEM = "system"
}
export declare enum WhatsAppLinkedEntityType {
    ORDER = "order",
    BOOKING = "booking",
    NONE = "none"
}
export interface WhatsAppMessage {
    id: string;
    conversationId: string;
    sender: WhatsAppMessageSender;
    content: string;
    linkedType: WhatsAppLinkedEntityType;
    linkedId?: string;
    timestamp: string;
    isAutomated?: boolean;
}
export interface WhatsAppConversation {
    id: string;
    customerId: string;
    customerName?: string;
    customerPhone?: string;
    status: "open" | "resolved";
    lastMessageAt: string;
    lastMessagePreview?: string;
    unreadCount: number;
    linkedEntity?: {
        type: WhatsAppLinkedEntityType;
        id: string;
    };
    tags?: ("order" | "booking" | "inquiry")[];
}
export declare enum WalletTransactionType {
    PAYMENT = "payment",
    PAYOUT = "payout",
    REFUND = "refund",
    DISPUTE_HOLD = "dispute_hold",
    DISPUTE_RELEASE = "dispute_release",
    SETTLEMENT = "settlement"
}
export declare enum WalletTransactionStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    FAILED = "failed",
    ON_HOLD = "on_hold",
    CANCELLED = "cancelled"
}
export declare enum SettlementStatus {
    PENDING = "pending",
    SETTLED = "settled",
    FAILED = "failed",
    DELAYED = "delayed"
}
export interface Settlement {
    id: string;
    merchantId: string;
    amount: number;
    currency: string;
    status: SettlementStatus;
    referenceId: string;
    payoutDate: string;
    createdAt: string;
    description?: string;
}
export declare enum DisputeStatus {
    OPENED = "OPENED",
    EVIDENCE_REQUIRED = "EVIDENCE_REQUIRED",
    SUBMITTED = "SUBMITTED",
    EVIDENCE_SUBMITTED = "EVIDENCE_SUBMITTED",
    UNDER_REVIEW = "UNDER_REVIEW",
    WON = "WON",
    LOST = "LOST",
    CANCELLED = "CANCELLED",
    CLOSED = "CLOSED"
}
export declare enum RefundStatus {
    REQUESTED = "REQUESTED",
    APPROVED = "APPROVED",
    PROCESSING = "PROCESSING",
    SUCCESS = "SUCCESS",
    FAILED = "FAILED",
    CANCELLED = "CANCELLED"
}
export interface Dispute {
    id: string;
    merchantId: string;
    amount: number;
    currency: string;
    status: DisputeStatus;
    reason: string;
    orderId: string;
    customerName: string;
    createdAt: string;
    deadline?: string;
}
export interface LedgerEntry {
    id: string;
    merchantId: string;
    type: WalletTransactionType;
    amount: number;
    currency: string;
    status: WalletTransactionStatus;
    source: "order" | "manual" | "system";
    referenceId: string;
    createdAt: string;
    description?: string;
}
export interface WalletBalance {
    available: number;
    pending: number;
    blocked: number;
    currency: string;
}
export interface PayoutAccount {
    id: string;
    merchantId: string;
    bankName: string;
    bankCode: string;
    accountNumber: string;
    accountName: string;
    isDefault: boolean;
}
export interface WithdrawalEligibility {
    kycStatus: "verified" | "blocked" | "review" | "pending";
    hasPayoutAccount: boolean;
    availableBalance: number;
    minWithdrawal: number;
    blockedReasons: string[];
    isEligible: boolean;
}
export interface WithdrawalQuote {
    amount: number;
    fee: number;
    netAmount: number;
    currency: string;
    estimatedArrival: string;
}
export declare enum InvoiceStatus {
    DRAFT = "draft",
    ISSUED = "issued",
    PAID = "paid",
    OVERDUE = "overdue",
    VOID = "void"
}
export interface InvoiceLineItem {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
}
export interface Invoice {
    id: string;
    merchantId: string;
    invoiceNumber: string;
    customer: {
        name: string;
        email?: string;
        phone?: string;
    };
    items: InvoiceLineItem[];
    subtotal: number;
    tax?: number;
    discount?: number;
    totalAmount: number;
    currency: string;
    status: InvoiceStatus;
    dueDate: string;
    issuedAt: string;
    paidAt?: string;
    paymentLink?: string;
}
export declare enum ProductServiceType {
    RETAIL = "retail",
    FOOD = "food",
    SERVICE = "service",
    DIGITAL = "digital",
    EVENT = "event",
    HOTEL = "hotel",
    AUTO = "auto",
    REAL_ESTATE = "real_estate"
}
export declare enum ProductServiceStatus {
    ACTIVE = "active",
    DRAFT = "draft",
    INACTIVE = "inactive",
    OUT_OF_STOCK = "out_of_stock",
    SCHEDULED = "scheduled"
}
export interface InventoryConfig {
    enabled: boolean;
    quantity: number;
    lowStockThreshold?: number;
}
export interface AvailabilityConfig {
    days: string[];
    timeRange: string;
}
export interface ProductServiceItem {
    id: string;
    merchantId: string;
    type: ProductServiceType;
    name: string;
    description: string;
    price: number;
    currency: string;
    status: ProductServiceStatus;
    images?: string[];
    image?: string;
    inventory?: InventoryConfig;
    availability?: AvailabilityConfig;
    isTodaysSpecial?: boolean;
    category?: string;
    digital?: {
        fileUrl?: string;
        fileSize?: string;
        licenseType?: "Personal" | "Commercial";
    };
    realEstate?: {
        bedrooms?: number;
        bathrooms?: number;
        sqft?: number;
        propertyType?: string;
        amenities?: string[];
    };
    automotive?: {
        make?: string;
        model?: string;
        year?: number;
        vin?: string;
        mileage?: number;
        fuelType?: string;
        transmission?: string;
    };
    stay?: {
        maxGuests?: number;
        roomType?: string;
        amenities?: string[];
        checkInTime?: string;
        checkOutTime?: string;
    };
    event?: {
        date?: string;
        venue?: string;
        isVirtual?: boolean;
        ticketTiers?: {
            name: string;
            price: number;
        }[];
    };
    metadata?: Record<string, unknown>;
    itemsSold?: number;
    createdAt: string;
    updatedAt?: string;
}
export declare enum CustomerStatus {
    NEW = "new",
    RETURNING = "returning",
    VIP = "vip"
}
export interface Customer {
    id: string;
    merchantId: string;
    name: string;
    phone: string;
    firstSeenAt: string;
    lastSeenAt: string;
    totalOrders: number;
    totalSpend: number;
    status: CustomerStatus;
    preferredChannel?: "whatsapp" | "website";
    email?: string;
    avatarUrl?: string | null;
}
export interface CustomerActivity {
    id: string;
    type: "order" | "booking" | "inquiry" | "note" | "message";
    amount?: number;
    status: string;
    date: string;
    description?: string;
    metadata?: Record<string, unknown>;
}
export interface CustomerInsight {
    id: string;
    type: "spending" | "timing" | "preference" | "risk";
    title: string;
    description: string;
    icon: string;
    variant: "positive" | "neutral" | "warning";
}
export interface CustomerNote {
    id: string;
    customerId: string;
    content: string;
    authorName: string;
    createdAt: string;
}
export interface StoreTemplate {
    id: string;
    name: string;
    description: string;
    thumbnailUrl: string;
    planLevel: SubscriptionPlan;
    category: "retail" | "food" | "services";
    type: "website" | "whatsapp" | "hybrid";
    isLocked?: boolean;
    isActive?: boolean;
}
export interface Domain {
    id: string;
    name: string;
    type: "subdomain" | "custom";
    status: "active" | "connecting" | "error" | "pending";
    sslStatus: "active" | "pending" | "failed";
    dnsStatus: "verified" | "pending" | "failed";
    verificationRecord?: {
        type: string;
        name: string;
        value: string;
    };
    connectedAt?: string;
}
export interface Integration {
    id: string;
    name: string;
    provider: "paystack" | "whatsapp" | "google_analytics" | "facebook_pixel" | "shipbubble";
    logoUrl: string;
    description: string;
    status: "connected" | "not_connected" | "error";
    category?: "payment" | "marketing" | "logistics" | "analytics";
    connectedAt?: string;
    configRequired: boolean;
}
export interface SalesChannel {
    id: string;
    type: "website" | "whatsapp";
    name: string;
    status: "enabled" | "disabled";
    url?: string;
}
export interface UsageMetric {
    used: number;
    limit: number | "unlimited";
    label: string;
}
export interface SystemIssue {
    id: string;
    message: string;
    severity: "warning" | "critical";
    actionUrl?: string;
}
export interface ControlCenterState {
    templates: StoreTemplate[];
    domains: Domain[];
    integrations: Integration[];
    channels: SalesChannel[];
    usage: {
        orders: UsageMetric;
        products: UsageMetric;
        templates: UsageMetric;
    };
    systemStatus: {
        healthy: boolean;
        issues: SystemIssue[];
    };
}
export type NotificationSeverity = "critical" | "action_required" | "info" | "success" | "insight";
export type NotificationChannel = "in_app" | "banner" | "whatsapp" | "email";
export type NotificationCategory = "orders" | "payments" | "account" | "system";
export interface Notification {
    id: string;
    merchantId: string;
    type: string;
    severity: NotificationSeverity;
    category: NotificationCategory;
    title: string;
    message: string;
    actionUrl?: string;
    actionLabel?: string;
    isRead: boolean;
    createdAt: string;
    resolvedAt?: string | null;
    channels: NotificationChannel[];
    metadata?: Record<string, unknown>;
}
export interface NotificationPreferences {
    merchantId: string;
    channels: {
        in_app: boolean;
        whatsapp: boolean;
        email: boolean;
    };
    categories: {
        orders: boolean;
        payments: boolean;
        account: boolean;
        system: boolean;
    };
    quietHours: {
        enabled: boolean;
        start: string;
        end: string;
    };
}
export declare enum OrderType {
    RETAIL = "retail",
    FOOD = "food",
    SERVICE = "service"
}
export declare enum UnifiedOrderStatus {
    NEW = "new",
    PROCESSING = "processing",// Retail: Processing, Food: Preparing
    READY = "ready",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    REFUNDED = "refunded",
    REQUESTED = "requested",
    CONFIRMED = "confirmed"
}
export interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
    modifiers?: string[];
}
export interface UnifiedOrder {
    id: string;
    merchantId: string;
    type: OrderType;
    status: UnifiedOrderStatus;
    paymentStatus: "paid" | "pending" | "failed" | "cod";
    customer: {
        id: string;
        name: string;
        phone: string;
        avatar?: string;
    };
    items: OrderItem[];
    totalAmount: number;
    currency: string;
    source: "website" | "whatsapp" | "marketplace" | "dashboard";
    fulfillmentType?: "pickup" | "delivery";
    fulfillmentGroupId?: string;
    parentOrderRef?: string;
    scheduledAt?: string;
    durationMinutes?: number;
    prepTimeMinutes?: number;
    timestamps: {
        createdAt: string;
        updatedAt: string;
        completedAt?: string;
    };
    note?: string;
}
export interface OrderStats {
    totalRevenue: number;
    countNew: number;
    countInProgress: number;
    countCompleted: number;
    countPendingPayment?: number;
}
export declare enum KYCStatus {
    NOT_STARTED = "NOT_STARTED",
    PENDING = "PENDING",
    VERIFIED = "VERIFIED",
    REJECTED = "REJECTED"
}
export interface KYCDetails {
    status: KYCStatus;
    ninStatus?: KYCStatus;
    bvnStatus?: KYCStatus;
    cacStatus?: KYCStatus;
    submittedAt?: string;
    verifiedAt?: string;
    documents: {
        type: string;
        status: KYCStatus | string;
    }[];
    failureReason?: string;
}
export interface AccountOverview {
    merchantId: string;
    businessName: string;
    businessType: BusinessType;
    plan: SubscriptionPlan;
    kyc: KYCDetails;
    payoutAccount?: PayoutAccount;
    whatsappConnected: boolean;
    whatsappNumber?: string;
    overallStatus: "active" | "restricted" | "action_required";
    blockingIssues: {
        id: string;
        title: string;
        description: string;
        severity: "critical" | "warning";
        actionUrl: string;
    }[];
}
export interface MarketProductImage {
    id: string;
    url: string;
}
export interface MarketProductVariant {
    id: string;
    title: string;
    price: number | string;
    productImage?: MarketProductImage | null;
}
export interface MarketProductPricingTier {
    id: string;
    minQty: number;
    unitPrice: number | string;
}
export interface MarketProduct {
    id: string;
    title: string;
    description?: string | null;
    price: number | string;
    productType?: string | null;
    condition?: string | null;
    moq: number;
    depositRequired?: boolean;
    depositPercentage?: number | string;
    shippingEstimate?: string | null;
    store?: {
        name: string;
        type: string;
    } | null;
    productImages: MarketProductImage[];
    productVariants: MarketProductVariant[];
    pricingTiers?: MarketProductPricingTier[];
}
//# sourceMappingURL=types.d.ts.map