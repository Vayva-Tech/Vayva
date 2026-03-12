/**
 * Ops Console API Utilities
 * 
 * Central export point for all API-related utilities.
 */

// Error Handling
export {
  ErrorCodes,
  createErrorResponse,
  handleAuthError,
  handleValidationError,
  handleNotFound,
  handleRateLimit,
  handleInternalError,
} from "./errors";

// Data Transfer Objects
export type {
  ApiMeta,
  ApiResponse,
  PaginatedMeta,
  PaginatedResponse,
  OpsUserDTO,
  LoginRequestDTO,
  LoginResponseDTO,
  CreateUserRequestDTO,
  UpdateUserRequestDTO,
  MerchantDTO,
  MerchantListQueryDTO,
  BulkMerchantActionDTO,
  OrderDTO,
  OrderItemDTO,
  OrderDetailDTO,
  ShipmentDTO,
  PaymentTransactionDTO,
  OrderEventDTO,
  OrderListQueryDTO,
  KycRecordDTO,
  KycActionRequestDTO,
  BulkKycActionDTO,
  DisputeDTO,
  DisputeDetailDTO,
  DisputeTimelineEventDTO,
  DisputeEvidenceDTO,
  ApproveRefundRequestDTO,
  EscalateDisputeDTO,
  RejectDisputeDTO,
  AuditLogDTO,
  AuditLogQueryDTO,
  WebhookEventDTO,
  WebhookEventQueryDTO,
  DashboardStatsDTO,
  ActivityEventDTO,
  ImpersonationSessionDTO,
  StartImpersonationDTO,
} from "./dto";

// Rate Limiting
export {
  checkRateLimit,
  withRateLimit,
  RateLimits,
} from "./rate-limit";

// Caching
export {
  setCache,
  getCache,
  deleteCache,
  clearCache,
  withCache,
  CachePresets,
  cleanupExpiredCache,
} from "./cache";

// Feature Flags
export {
  type FeatureFlag,
  type FeatureFlagValue,
  DEFAULT_FLAGS,
  getFlag,
  isEnabled,
  getStringFlag,
  getJSONFlag,
  setFlag,
  getAllFlags,
  initializeFlags,
} from "./feature-flags";

// Input Validation
export {
  emailSchema,
  passwordSchema,
  uuidSchema,
  paginationSchema,
  searchQuerySchema,
  createMerchantSchema,
  bulkMerchantActionSchema,
  orderStatusSchema,
  paymentStatusSchema,
  orderQuerySchema,
  ninSchema,
  cacNumberSchema,
  kycActionSchema,
  bulkKycSchema,
  approveRefundSchema,
  escalateDisputeSchema,
  rejectDisputeSchema,
  createUserSchema,
  updateUserSchema,
  auditLogQuerySchema,
  startImpersonationSchema,
  sanitizeString,
  sanitizeObject,
  safeJSONParse,
  validateFileUpload,
  generateRateLimitKey,
  extractIPAddress,
} from "./validation";

// Accessibility
export {
  useFocusTrap,
  useAnnouncer,
  useArrowNavigation,
  usePrefersReducedMotion,
  type SkipLinkProps,
  getLiveRegionProps,
  getErrorProps,
  getLoadingProps,
  focusVisibleClasses,
  skipLinkClasses,
  srOnlyClass,
  type ModalAriaProps,
  getModalAriaProps,
} from "../a11y/hooks";
