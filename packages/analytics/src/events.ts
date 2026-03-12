import { z } from "zod";

// Event Categories
export enum EventCategory {
  AUTH = "auth",
  COMMERCE = "commerce",
  FINANCE = "finance",
  OPS = "ops",
  SYSTEM = "system",
}

// Event Names
export enum EventName {
  // Auth
  USER_SIGNED_UP = "user.signed_up",
  USER_LOGGED_IN = "user.logged_in",

  // Templates & Onboarding
  TEMPLATE_PREVIEWED = "template.previewed",
  TEMPLATE_APPLIED = "template.applied",
  ONBOARDING_STARTED = "onboarding.started",
  ONBOARDING_COMPLETED = "onboarding.completed",

  // Commerce
  ORDER_CREATED = "order.created",
  ORDER_PAID = "order.paid",
  ORDER_FULFILLED = "order.fulfilled",
  ORDER_CANCELLED = "order.cancelled",
  PRODUCT_CREATED = "product.created",
  PRODUCT_UPDATED = "product.updated",

  // Activation Triangle (First-time events)
  FIRST_ORDER_CREATED = "activation.first_order_created",
  FIRST_PAYMENT_RECORDED = "activation.first_payment_recorded",
  FIRST_ORDER_COMPLETED = "activation.first_order_completed",
  USER_ACTIVATED = "activation.user_activated",

  // Finance
  PAYMENT_RECEIVED = "payment.received",
  REFUND_REQUESTED = "refund.requested",
  PAYOUT_INITIATED = "payout.initiated",

  // Plan & Upgrades
  PLAN_LIMIT_REACHED = "plan.limit_reached",
  UPGRADE_PROMPT_SHOWN = "upgrade.prompt_shown",
  UPGRADE_COMPLETED = "upgrade.completed",

  // Ops
  DELIVERY_ASSIGNED = "delivery.assigned",
  TICKET_CREATED = "ticket.created",

  // System
  ERROR_OCCURRED = "error.occurred",
}

// Event Payloads (Zod Schemas for validation)
export const EventPayloads = {
  [EventName.USER_SIGNED_UP]: z.object({
    userId: z.string(),
    email: z.string(),
  }),
  [EventName.ORDER_CREATED]: z.object({
    orderId: z.string(),
    total: z.number(),
  }),

  // Template & Onboarding
  [EventName.TEMPLATE_PREVIEWED]: z.object({
    templateId: z.string(),
    templateName: z.string(),
    templateTier: z.enum(["free", "growth", "pro"]),
  }),
  [EventName.TEMPLATE_APPLIED]: z.object({
    templateId: z.string(),
    templateName: z.string(),
    templateTier: z.enum(["free", "growth", "pro"]),
  }),
  [EventName.ONBOARDING_STARTED]: z.object({
    templateId: z.string().optional(),
    setupMode: z.enum(["guided", "quick"]).optional(),
  }),
  [EventName.ONBOARDING_COMPLETED]: z.object({
    templateId: z.string().optional(),
    setupMode: z.enum(["guided", "quick"]).optional(),
    completedSteps: z.number().optional(),
    totalSteps: z.number().optional(),
  }),

  // Activation Triangle
  [EventName.FIRST_ORDER_CREATED]: z.object({
    orderId: z.string(),
    orderValue: z.number().optional(),
  }),
  [EventName.FIRST_PAYMENT_RECORDED]: z.object({
    orderId: z.string(),
    orderValue: z.number().optional(),
    paymentMethod: z.string().optional(),
  }),
  [EventName.FIRST_ORDER_COMPLETED]: z.object({
    orderId: z.string(),
  }),
  [EventName.USER_ACTIVATED]: z.object({
    templateId: z.string(),
    timeToActivation: z.number(), // minutes
    activationPath: z.array(z.string()), // sequence of events
  }),

  // Plan & Upgrades
  [EventName.PLAN_LIMIT_REACHED]: z.object({
    currentTier: z.enum(["free", "growth", "pro"]),
    limitType: z.string(),
  }),
  [EventName.UPGRADE_PROMPT_SHOWN]: z.object({
    currentTier: z.enum(["free", "growth", "pro"]),
    targetTier: z.enum(["growth", "pro"]),
    promptContext: z.string().optional(),
  }),
  [EventName.UPGRADE_COMPLETED]: z.object({
    previousTier: z.enum(["free", "growth", "pro"]),
    newTier: z.enum(["growth", "pro"]),
  }),
};
