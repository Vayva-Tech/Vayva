/**
 * Validation Module
 * 
 * Zod schemas, validators, and error messages
 */

// Common schemas
export {
  emailSchema,
  passwordSchema,
  phoneSchema,
  urlSchema,
  uuidSchema,
  positiveNumberSchema,
  nonNegativeNumberSchema,
  dateStringSchema,
  orderStatusEnum,
  paymentStatusEnum,
  inventoryStatusEnum,
  planTypeEnum,
  addressSchema,
  moneySchema,
  paginationQuerySchema,
  dateRangeSchema,
  fileUploadSchema,
  metadataSchema,
} from './schemas/common.schemas';

// Auth schemas
export {
  signInSchema,
  signUpSchema,
  verifyOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
  type SignInInput,
  type SignUpInput,
  type VerifyOtpInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
  type ChangePasswordInput,
  type UpdateProfileInput,
} from './schemas/auth.schemas';

// Validators
export {
  validate,
  validateOrThrow,
  getValidationErrors,
  getFirstValidationError,
  withValidation,
  composeSchemas,
  optionalSchema,
  nullableSchema,
  arraySchema,
  emptyStringToUndefined,
  trimString,
  trimmedStringSchema,
  type SafeParseResult,
} from './validators';

// Messages
export {
  defaultMessages,
  fieldMessages,
  industryMessages,
  getMessage,
  getIndustryMessage,
  formatValidationError,
  type ValidationMessages,
  type FormattedError,
} from './messages';
