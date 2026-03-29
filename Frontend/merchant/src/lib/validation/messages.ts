/**
 * Validation Error Message Templates
 * 
 * Standardized error messages with support for industry-specific overrides
 */

export interface ValidationMessages {
  required: string;
  invalid: string;
  minLength: (min: number) => string;
  maxLength: (max: number) => string;
  minNumber: (min: number) => string;
  maxNumber: (max: number) => string;
  invalidEmail: string;
  invalidUrl: string;
  invalidPhone: string;
  invalidDate: string;
  passwordTooShort: string;
  passwordRequirements: string;
}

/**
 * Default validation messages
 */
export const defaultMessages: ValidationMessages = {
  required: 'This field is required',
  invalid: 'Invalid value',
  minLength: (min) => `Must be at least ${min} characters`,
  maxLength: (max) => `Must be no more than ${max} characters`,
  minNumber: (min) => `Must be at least ${min}`,
  maxNumber: (max) => `Must be no more than ${max}`,
  invalidEmail: 'Invalid email address',
  invalidUrl: 'Invalid URL',
  invalidPhone: 'Invalid phone number',
  invalidDate: 'Invalid date',
  passwordTooShort: 'Password must be at least 8 characters',
  passwordRequirements: 'Must contain uppercase, lowercase, and number',
};

/**
 * Field-specific messages
 */
export const fieldMessages: Record<string, Partial<ValidationMessages>> = {
  email: {
    required: 'Email is required',
    invalid: 'Please enter a valid email address',
  },
  password: {
    required: 'Password is required',
    invalid: 'Invalid password',
  },
  phone: {
    required: 'Phone number is required',
    invalid: 'Please enter a valid phone number',
  },
  firstName: {
    required: 'First name is required',
  },
  lastName: {
    required: 'Last name is required',
  },
  businessName: {
    required: 'Business name is required',
  },
  address: {
    required: 'Address is required',
  },
  city: {
    required: 'City is required',
  },
  state: {
    required: 'State is required',
  },
  amount: {
    required: 'Amount is required',
    minNumber: (min) => `Minimum amount is ₦${min.toLocaleString()}`,
  },
  quantity: {
    required: 'Quantity is required',
    minNumber: (min) => `Minimum quantity is ${min}`,
  },
};

/**
 * Get message for a specific field and error type
 */
export function getMessage(
  field: string,
  errorType: keyof ValidationMessages,
  ...args: unknown[]
): string {
  const fieldMsg = fieldMessages[field]?.[errorType];
  if (fieldMsg) {
    return typeof fieldMsg === 'function' ? fieldMsg(...args) : fieldMsg;
  }

  const defaultMsg = defaultMessages[errorType];
  return typeof defaultMsg === 'function' ? defaultMsg(...args) : defaultMsg;
}

/**
 * Industry-specific message overrides
 */
export const industryMessages: Record<string, Partial<ValidationMessages>> = {
  grocery: {
    quantity: {
      minNumber: (min) => `Minimum order quantity is ${min} units`,
    },
  },
  fashion: {
    size: {
      required: 'Size selection is required',
    },
  },
  beauty: {
    serviceDuration: {
      required: 'Service duration is required',
    },
  },
  food: {
    preparationTime: {
      required: 'Preparation time is required',
    },
  },
};

/**
 * Get industry-specific message
 */
export function getIndustryMessage(
  industry: string,
  field: string,
  errorType: keyof ValidationMessages,
  ...args: unknown[]
): string {
  const industryMsg = industryMessages[industry]?.[field as keyof typeof industryMessages[string]];
  if (industryMsg && errorType in industryMsg) {
    const msg = industryMsg[errorType];
    return typeof msg === 'function' ? msg(...args) : msg;
  }

  return getMessage(field, errorType, ...args);
}

/**
 * Format validation errors for display
 */
export interface FormattedError {
  field: string;
  message: string;
  code?: string;
}

export function formatValidationError(
  field: string,
  errorCode: string,
  params?: Record<string, unknown>
): FormattedError {
  let message = getMessage(field, errorCode as keyof ValidationMessages);

  // Replace placeholders with params
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      message = message.replace(`{${key}}`, String(value));
    });
  }

  return {
    field,
    message,
    code: errorCode,
  };
}
