import { z } from "zod";
// Event Categories
export var EventCategory;
(function (EventCategory) {
    EventCategory["AUTH"] = "auth";
    EventCategory["COMMERCE"] = "commerce";
    EventCategory["FINANCE"] = "finance";
    EventCategory["OPS"] = "ops";
    EventCategory["SYSTEM"] = "system";
})(EventCategory || (EventCategory = {}));
// Event Names
export var EventName;
(function (EventName) {
    // Auth
    EventName["USER_SIGNED_UP"] = "user.signed_up";
    EventName["USER_LOGGED_IN"] = "user.logged_in";
    // Templates & Onboarding
    EventName["TEMPLATE_PREVIEWED"] = "template.previewed";
    EventName["TEMPLATE_APPLIED"] = "template.applied";
    EventName["ONBOARDING_STARTED"] = "onboarding.started";
    EventName["ONBOARDING_COMPLETED"] = "onboarding.completed";
    // Commerce
    EventName["ORDER_CREATED"] = "order.created";
    EventName["ORDER_PAID"] = "order.paid";
    EventName["ORDER_FULFILLED"] = "order.fulfilled";
    EventName["ORDER_CANCELLED"] = "order.cancelled";
    EventName["PRODUCT_CREATED"] = "product.created";
    EventName["PRODUCT_UPDATED"] = "product.updated";
    // Activation Triangle (First-time events)
    EventName["FIRST_ORDER_CREATED"] = "activation.first_order_created";
    EventName["FIRST_PAYMENT_RECORDED"] = "activation.first_payment_recorded";
    EventName["FIRST_ORDER_COMPLETED"] = "activation.first_order_completed";
    EventName["USER_ACTIVATED"] = "activation.user_activated";
    // Finance
    EventName["PAYMENT_RECEIVED"] = "payment.received";
    EventName["REFUND_REQUESTED"] = "refund.requested";
    EventName["PAYOUT_INITIATED"] = "payout.initiated";
    // Plan & Upgrades
    EventName["PLAN_LIMIT_REACHED"] = "plan.limit_reached";
    EventName["UPGRADE_PROMPT_SHOWN"] = "upgrade.prompt_shown";
    EventName["UPGRADE_COMPLETED"] = "upgrade.completed";
    // Ops
    EventName["DELIVERY_ASSIGNED"] = "delivery.assigned";
    EventName["TICKET_CREATED"] = "ticket.created";
    // System
    EventName["ERROR_OCCURRED"] = "error.occurred";
})(EventName || (EventName = {}));
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
