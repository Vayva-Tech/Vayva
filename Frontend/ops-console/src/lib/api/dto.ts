/**
 * Shared Data Transfer Objects (DTOs) for Ops Console API
 * 
 * These types define the contract between frontend and backend,
 * ensuring type safety across the API boundary.
 */

// ============================================================================
// Common / Base Types
// ============================================================================

export interface ApiMeta {
  requestId: string;
  timestamp: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta: ApiMeta;
}

export interface PaginatedMeta extends ApiMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginatedMeta;
}

// ============================================================================
// User / Authentication Types
// ============================================================================

export interface OpsUserDTO {
  id: string;
  email: string;
  name: string;
  role: "OPS_OWNER" | "OPS_ADMIN" | "OPS_SUPPORT";
  isActive: boolean;
  isMfaEnabled: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface LoginRequestDTO {
  email: string;
  password: string;
  mfaCode?: string;
}

export interface LoginResponseDTO {
  user: Pick<OpsUserDTO, "email" | "name" | "role">;
  requiresMfa?: boolean;
  tempToken?: string;
}

export interface CreateUserRequestDTO {
  email: string;
  name: string;
  role: OpsUserDTO["role"];
  password?: string;
}

export interface UpdateUserRequestDTO {
  userId: string;
  action: "TOGGLE_STATUS" | "RESET_2FA";
}

// ============================================================================
// Merchant / Store Types
// ============================================================================

export interface MerchantDTO {
  id: string;
  name: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  plan: "FREE" | "STARTER" | "GROWTH" | "PRO" | "ENTERPRISE";
  trialEndsAt: string | null;
  kycStatus: "NOT_SUBMITTED" | "PENDING" | "VERIFIED" | "REJECTED";
  riskFlags: string[];
  gmv30d: number;
  lastActive: string;
  createdAt: string;
  location: string;
}

export interface MerchantListQueryDTO {
  page?: number;
  limit?: number;
  q?: string;
  status?: "active" | "inactive" | "suspended";
  plan?: string;
  kycStatus?: string;
}

export interface BulkMerchantActionDTO {
  action: "activate" | "suspend" | "delete" | "updateTier";
  merchantIds: string[];
  data?: {
    tier?: string;
  };
}

// ============================================================================
// Order Types
// ============================================================================

export interface OrderDTO {
  id: string;
  orderNumber: string;
  storeId: string;
  storeName: string;
  customerEmail: string;
  customerName: string;
  status: string;
  paymentStatus: string;
  total: number;
  currency: string;
  items: OrderItemDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItemDTO {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface OrderDetailDTO extends OrderDTO {
  shipments: ShipmentDTO[];
  paymentTransactions: PaymentTransactionDTO[];
  timeline: OrderEventDTO[];
}

export interface ShipmentDTO {
  id: string;
  trackingNumber: string;
  carrier: string;
  status: string;
  shippedAt?: string;
  deliveredAt?: string;
}

export interface PaymentTransactionDTO {
  id: string;
  amount: number;
  status: string;
  method: string;
  processedAt: string;
}

export interface OrderEventDTO {
  id: string;
  eventType: string;
  description: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface OrderListQueryDTO {
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
  storeId?: string;
  q?: string;
}

// ============================================================================
// KYC Types
// ============================================================================

export interface KycRecordDTO {
  id: string;
  storeId: string;
  storeName: string;
  ownerName: string;
  ownerEmail: string;
  nin: string;
  cacNumber?: string;
  status: "NOT_SUBMITTED" | "PENDING" | "VERIFIED" | "REJECTED";
  submittedAt: string | null;
  reviewedAt: string | null;
  reviewedBy?: string;
  notes?: string;
}

export interface KycActionRequestDTO {
  id: string;
  action: "approve" | "reject";
  notes?: string;
}

export interface BulkKycActionDTO {
  ids: string[];
  action: "approve" | "reject";
  notes?: string;
}

// ============================================================================
// Dispute Types
// ============================================================================

export interface DisputeDTO {
  id: string;
  orderId: string;
  storeId: string;
  storeName: string;
  customerEmail: string;
  reason: string;
  status: "OPEN" | "UNDER_REVIEW" | "WON" | "LOST" | "CANCELLED";
  amount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface DisputeDetailDTO extends DisputeDTO {
  timeline: DisputeTimelineEventDTO[];
  evidence: DisputeEvidenceDTO[];
}

export interface DisputeTimelineEventDTO {
  id: string;
  eventType: string;
  description: string;
  createdAt: string;
  actor?: string;
}

export interface DisputeEvidenceDTO {
  id: string;
  type: string;
  url: string;
  submittedAt: string;
}

export interface ApproveRefundRequestDTO {
  refundAmount: number;
  reason: string;
}

export interface EscalateDisputeDTO {
  note?: string;
}

export interface RejectDisputeDTO {
  reason: string;
}

// ============================================================================
// Audit Log Types
// ============================================================================

export interface AuditLogDTO {
  id: string;
  eventType: string;
  description: string;
  actorId?: string;
  actorEmail?: string;
  targetId?: string;
  targetType?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditLogQueryDTO {
  page?: number;
  limit?: number;
  eventType?: string;
  actorId?: string;
  targetId?: string;
  startDate?: string;
  endDate?: string;
  export?: boolean;
}

// ============================================================================
// Webhook Types
// ============================================================================

export interface WebhookEventDTO {
  id: string;
  provider: string;
  eventType: string;
  eventId: string;
  status: "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED" | "RETRYING";
  receivedAt: string;
  processedAt?: string;
  error?: string;
  storeName: string;
  storeSlug?: string;
  payload?: Record<string, unknown>;
}

export interface WebhookEventQueryDTO {
  page?: number;
  limit?: number;
  provider?: string;
  status?: string;
  q?: string;
}

// ============================================================================
// Dashboard / Stats Types
// ============================================================================

export interface DashboardStatsDTO {
  merchants: {
    total: number;
    delta: number;
    newThisWeek: number;
  };
  revenue: {
    total: number;
    delta: number;
    currency: string;
    formatted: string;
  };
  orders: {
    total: number;
    delta: number;
    avgOrderValue: number;
  };
  operations: {
    tickets: number;
  };
  subscriptions: {
    active: number;
    mrr: number;
    formattedMrr: string;
  };
  recentActivity: ActivityEventDTO[];
}

export interface ActivityEventDTO {
  id: string;
  message: string;
  actor: string;
  timestamp: string;
  relativeTime: string;
}

// ============================================================================
// Impersonation Types
// ============================================================================

export interface ImpersonationSessionDTO {
  id: string;
  targetUserId: string;
  targetUserEmail: string;
  targetUserName: string;
  targetType: "merchant" | "customer" | "admin";
  startedAt: string;
  expiresAt: string;
  reason: string;
  impersonatorId: string;
  impersonatorEmail: string;
}

export interface StartImpersonationDTO {
  targetUserId: string;
  targetType?: string;
  reason: string;
  sessionDuration?: number;
}
